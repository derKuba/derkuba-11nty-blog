---
title: "Fuckup der Woche: Wie ein unscheinbarer Origin-Header unsere Proxy-Konfiguration sabotierte"
description: Eine Leidensgeschichte aus dem Unit-Testing
date: 2024-11-08
tags: ["vite", "typescript", "ssl", "fuckup"]
layout: layouts/post.njk
---

In der Kategorie _Fuckup der Woche_ geht es heute um ein Beispiel, das zeigt, wie viel Zeit man in etwas scheinbar Simples wie eine Proxy-Konfiguration investieren kann – und warum das am Ende lehrreich war.<!-- endOfPreview -->

**Problem:** Ein Proxy für eine API sollte lokale Anfragen weiterleiten, und dabei traten wiederholt `403 Forbidden`-Fehler auf. Die Ursache? Ein unscheinbarer `Origin`-Header, den wir (fast) übersehen hätten.

![Image](/img/1124/081124-fuckup.png "request error")

---

### Der Plan: Ein Proxy, der mit Zertifikaten und CORS umgehen kann

Unser Setup basierte auf `Vite`, einem beliebten Build-Tool für moderne Frontend-Entwicklung. Die Herausforderung bestand darin, einen Proxy zu konfigurieren, der Anfragen von einem lokalen Frontend an einen entfernten Server (`TARGET_URL`) weiterleitet, ohne an selbstsignierten SSL-Zertifikaten oder Cross-Origin Resource Sharing (CORS)-Problemen zu scheitern. Der Proxy sollte:

1. **SSL-Zertifikat-Fehler ignorieren**: Lokale Entwicklung bringt häufig selbstsignierte Zertifikate mit sich, also wollten wir `secure: false` setzen, um Zertifikatsfehler zu umgehen.
2. **CORS-Anfragen zulassen**: Der Proxy sollte die CORS-Vorgaben für Preflight-Anfragen (`OPTIONS`) unterstützen und die richtigen Header setzen.
3. **Zieladresse umschreiben**: Nur die Anfragen an den API-Pfad `^/centerdevice-rest-server/v2/ai-search` sollten umgeleitet und die Basispfade korrekt angepasst werden.

### Der Weg dorthin: 403 Forbidden und die Suche nach dem Übeltäter

Mit unserer Proxy-Konfiguration standen wir am Anfang vor einem ständigen `403 Forbidden`-Fehler. Trotz gefühlt endloser Anpassungen von `changeOrigin`, `secure`, und `rewrite`, konnte der Proxy die Anfrage einfach nicht durchbringen. Der Server lehnte die Anfrage weiterhin ab, als ob wir an ein unsichtbares Hindernis stießen.

Was wir ausprobiert haben:

-   **CORS-Header setzen**: Zuerst schien es logisch, dass der `403`-Fehler durch fehlende CORS-Header verursacht wurde. Also ergänzten wir `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, und `Access-Control-Allow-Headers`.
-   **Preflight-Anfragen beantworten**: Wir fügten eine `OPTIONS`-Antwort hinzu, um den Browser zufriedenzustellen, der jedes Mal mit einem Preflight-Test das Feld abfragte.
-   **changeOrigin**: Wir schalteten `changeOrigin: true`, damit der Proxy alle Anfragen so weiterleitete, als ob sie vom Ziel-Host kämen. Doch der Server blieb stur.

### Die Lösung: Den `Origin`-Header entfernen

Nach einer ausgiebigen Inspektion von `curl`-Befehlen und einer genauen Überprüfung der `Proxy-Req`-Header fiel uns ein unscheinbarer Verdächtiger auf: der `Origin`-Header. Anders als `curl`, das ohne diesen Header arbeitet, schickte der Proxy ihn hartnäckig mit. Das Problem: Der entfernte Server akzeptierte die Anfragen nur, wenn der `Origin`-Header weggelassen wurde. Eine Regel, die in der API-Dokumentation nicht erwähnt war und die nur durch Ausschlussverfahren herauszufinden war.

Also: **`proxyReq.removeHeader("origin");`**

Sobald wir den `Origin`-Header entfernt hatten, war der Weg frei. Kein `403` mehr. Die Anfrage ging durch, als wäre nie etwas gewesen.

### Der finale Code

Hier ist der endgültige Proxy-Setup in `vite.config.js`, der das Problem umgeht, indem der `Origin`-Header explizit entfernt wird und alle notwendigen CORS- und Fehler-Handler berücksichtigt:

```javascript
import { defineConfig } from "vite";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
    server: {
        port: process.env.PORT || 5000,
        proxy: {
            "^/derkuba-rest-server/v2/ai-search": {
                target: process.env.TARGET_URL,
                changeOrigin: true,
                secure: false,
                rewrite: (path) =>
                    path.replace(/^\/derkuba-rest-server\/v2\/ai-search/, ""),
                configure: (proxy) => {
                    // Setzt CORS-Header für jede Anfrage
                    proxy.on("proxyReq", (proxyReq, req, res) => {
                        proxyReq.removeHeader("origin"); // Entfernt den Origin-Header

                        res.setHeader("Access-Control-Allow-Origin", "*");
                        res.setHeader(
                            "Access-Control-Allow-Methods",
                            "GET, POST, PUT, DELETE, OPTIONS",
                        );
                        res.setHeader(
                            "Access-Control-Allow-Headers",
                            "Origin, X-Requested-With, Content-Type, Accept, Authorization",
                        );

                        console.log(
                            `[Incoming Request] ${req.method} ${req.url}`,
                        );
                        console.log(
                            `[Outgoing Request] ${proxyReq.method} ${proxyReq.getHeader("host")}${proxyReq.path}`,
                        );
                    });

                    // Preflight-Anfragen für CORS beantworten
                    proxy.on("proxyRes", (proxyRes, req, res) => {
                        if (req.method === "OPTIONS") {
                            res.writeHead(200, {
                                "Content-Type": "text/plain",
                            });
                            res.end();
                        }
                    });

                    // Fehler-Handler mit CORS und Content-Type
                    proxy.on("error", (err, req, res) => {
                        console.error(`Proxy error: ${err.message}`);

                        if (res && !res.headersSent) {
                            res.writeHead(500, {
                                "Content-Type": "text/plain",
                                "Access-Control-Allow-Origin": "*",
                            });
                            res.end("Something went wrong with the proxy.");
                        }
                    });
                },
            },
        },
    },
});
```

### Fazit

Der `Origin`-Header mag unscheinbar sein, kann aber bei serverseitigen API-Beschränkungen den Unterschied zwischen Erfolg und einem `403 Forbidden`-Fehler machen. Der heutige _Fuckup der Woche_ ist eine Erinnerung daran, dass die kleinen Details oft die entscheidenden sind. Manchmal liegt die Lösung in der genauen Untersuchung des Request-Formats und in der geduldigen Fehlersuche – und nicht immer in großen Codeänderungen.

Für Feedback bin ich immer dankbar.
Gerne an jacob@derkuba.de

Viele Grüße

Euer Kuba
