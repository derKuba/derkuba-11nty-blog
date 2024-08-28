---
title: "StencilJS-Tutorial: E2E Tests mit Playwright - Intro"
description: Wie installiere ich Playwright
date: 2021-09-09
tags: ["stenciljs"]
layout: layouts/post.njk
---

Mit den End2End-Tests sollte, meiner Meinung nach, sofort begonnen werden, sobald man die erste Seite gebaut hat. Wie der Name schon sagt wird das Zusammenspiel der Komponenten und die Anbindung an Schnittstellen getestet.<!-- endOfPreview --> Dabei geht man davon aus, dass man die Implementierung nicht kennt. Für alle die mit dem Begriff nichts anfangen können, erkläre ich es: Man steuert die Anwendung über den Browser (programmatisch) und zwar genau so wie ein Nutzer sie bedienen würde. Dazu nutzt man verschiedenen Frameworks, die Schnittstellen zum Browser bereitstellen. Das bekannteste Framework hierfür ist [Selenium](https://www.selenium.dev/). Die Programmiersprache ist mittlerweile egal. Es gibt für alle großen Sprachen eine Implementierung. Mein Gedanke beim Thema Full-Stack-Entwickler ist, dass ich gerne alle Bereiche (Frontend, Backend, QA) in derselben Sprache schreiben möchte. Was gibt es hierzu im Bereich Javascript/Typescript. In den letzten Jahren hat sich da wirklich viel getan. Die Browserhersteller haben eingesehen, dass es einen Bedarf an Headless-Browsern ( Browser ohne Benutzeroberfläche ) gibt. PhantomJS hat sehr viel dazu beigetragen (Möge es in Frieden ruhen :-) ). Ich habe mit eine zeit lang mit [Puppeteer](https://github.com/puppeteer/puppeteer#readme) gearbeitet. Microsoft hat einige Entwickler aus diesem Projekt übernommen und seine Variante davon entwickelt: [Playwright](https://playwright.dev/). Ich benutze gerne Software, die von großen Unternehmen betrieben wird, da sie genug Ressourcen aufbringen können, um es weiterzuentwickeln.

Playwright tut auch genau was es soll. Es hat eine einfache API, ist komplett mit Typescript kompatibel und einsteigerfreundlich. Ich zeige euch heute wie man es installiert und wie ein erster Test damit aussieht. Wie immer empfehle ich die [hauseigene Dokumentation](https://playwright.dev/docs/intro) zu durchstöbern.

Genug Text, jetzt hauen wir in die Tasten.

#### Installation

Laut Dokumentation reicht ein install-Befehl. Wir legen erstmal einen neuen Ordner an und initialisieren ein node-Projekt und bestätigen und durch den Node-Projekt-Wizard:

```bash
mkdir E2E
cd E2E
npm init
```

Im Anschluss installieren wir Playwright:

```bash
npm i -D @playwright/test

// Browser installieren mit
npx playwright install
```

Jetzt müsste man über ein _package.json_-Skript oder direkt über npx starten können:

```bash
// in package.json ergänzen:
"scripts": {
    "test:local": "PWDEBUG=console playwright test"
}
```

```bash
npm run test:local
// oder
npx playwright test
```

Bei mir auf der Konsole erschien direkt ein Fehler:
**Error: Cannot find module 'playwright'**

Dieser Fehler lässt sich einfach weginstallieren:

```bash
npm install -D playwright
```

Jetzt sollte das Ausführen klappen und diese Meldung erscheinen:

```bash
=================
 no tests found.
=================
```

Als nächstes legen wir die Konfigurationsdatei an.

```bash
touch playwright.config.ts
```

Wer keine Befehle mag, kann es gerne in der IDE per "neue Datei" anlegen versuchen.

Der Inhalt dieser Datei sieht bei mir so aus:

```ts
// playwright.config.ts
import { PlaywrightTestConfig, devices, expect } from "@playwright/test";

const config: PlaywrightTestConfig = {
    forbidOnly: true,
    retries: 3,
    reporter: "line",

    use: {
        // Browser options
        headless: true,

        // Context options
        viewport: { width: 1280, height: 1920 },
        ignoreHTTPSErrors: true,

        // Artifacts
        screenshot: "only-on-failure",
        video: "retry-with-video",
    },
    projects: [
        {
            name: "Chrome Stable",
            use: {
                browserName: "chromium",
                // Test against Chrome Stable channel.
                channel: "chrome",
                launchOptions: {
                    slowMo: 300,
                },
            },
        },
        {
            name: "Desktop Safari",
            use: {
                browserName: "webkit",
                viewport: { width: 1200, height: 750 },
            },
        },
        // Test against mobile viewports.
        {
            name: "Mobile Chrome",
            use: devices["Pixel 5"],
        },
        {
            name: "Mobile Safari",
            use: devices["iPhone 12"],
        },
        {
            name: "Desktop Firefox",
            use: {
                browserName: "firefox",
                viewport: { width: 800, height: 600 },
            },
        },
    ],
};
export default config;
```

Jeder sollte unbedingt in die [Doku](https://playwright.dev/docs/test-configuration#global-configuration) schauen. Dort sind die meisten Flags erklärt. Ich gehe aber auch auf meine Auswahl ein:

-   forbidOnly: Schutz vor mir selbst, damit ich keine einzelnen Tests erzwinge.
-   retries: 3: Das ist eine der Stärken. Failing Tests werden 3 mal wiederholt. Oft ist es einfach ein Timing-Problem
-   use: Konfiguration, die für alle folgenden Browser gilt
-   headless: Starte den Browser ohne Oberfläche
-   viewport: Auflösung des Browsers
-   ignoreHTTPSErrors: Lokal umgehe ich damit HTTPS und Zertifikatsprobleme
-   screenshots: Fotografiere den Fehler
-   video: Schneide den Retry mit
-   projects: Ab hier werden die individuellen Browser eingestellt
-   name: Mein Name für den Browser
-   use: Überschreibt die obere Konfiguration
-   browserName: Der wirkliche Name des Browsers
-   channel: Installationsquelle
-   launchOptions: Browserindividuelle Befehle
-   slowMo: Der Browser lässt sich die einstellte Zeit in MS zwischen dem Ausführen der Befehle
-   use: devices["Pixel 5"]: Möglichkeit auch mobile Browser zu verwenden

Welche Browser man unterstützt möchte ist sehr unterschiedlich. Es gibt kein Richtig oder Falsch. Das muss projektindividuell entschieden werden.

Playwright sucht beim Start automatisch nach der Datei **playwright.config.ts**. Man kann die Datei benennen wie man möchte. Dies muss man Playwright aber über einen Kommandozeilenparameter mitteilen:

```ts
npx playwright test --config=meine.neue.konfigurationsdatei.ts

// oder in der package.json
...
scripts: {
"test:alternative": "playwright test --config=meine.neue.konfigurationsdatei.ts",
}
...
```

#### Erster Test

Ich fasse zusammen. Es ist alles installiert und konfiguriert. Wir legen jetzt mit dem Testen los.

Wir legen unter /src/specs eine Datei an. Das machen wir wir analog zu Jest. Die Testdateien enden auf _.spec.ts_ und sehen vom Aufbau auch genauso aus.

```ts
import { test, expect } from "@playwright/test";

// besser in einer env variable aufgehoben
const TEST_URL = "http://localhost:3333";

test.describe("Lucky Path Test", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(TEST_URL);
    });

    test("should check the first page", async ({ page }) => {
        const locator = page.locator("h1");
        await expect(locator).toContainText("Kuba-Home");
    });
});
```

Man findet sich schnell zurecht. Es ist das Describe-Skelett und das Test-Skelett vorhanden. Der Aufbau ist auch wieder derselbe. Man hat einen Initialisierungsteil, einen Zustandherbeiführungsteil und einen Erwartungsteil. Unterschied zu Jest ist, dass die Describe Methode aus dem "test"-Objekt kommt. Gleichermaßen ist es mit dem "beforeEach". Die Tests bekommen als Parameter ein _page_-Objekt injiziert. Mit diesem haben wir Zugriff auf die Webseite.
Wir müssen dem Test sagen, wohin er im Browser navigieren soll. Als Default wird auf einer leeren Webseite gestartet. Vor jedem Test soll er in unserer Applikation starten. Die URL ist hart kodiert. Dies sollte, wie der Kommentar sagt, in eine Environment-Variable ausgelagert werden, damit man die Applikation auf verschiedenen Umgebungen testen kann und diese Parameter von außen einlesen kann. Der eigentliche Test startet nun auf der Seite der Applikation.
In Zeile 12 sehen wir einen _Locator_. Das ist ein HTML-Knoten, der selektiert wird über CSS-Selektoren. Für den ersten einfachen Test suche ich auf der Seite die Überschrift. Den Locator übergebe ich dem expect-Block und erwarte, dass _Kuba-Home_ im Titel steht. Wenn wir nun den Test ausführen, passiert nichts außer, dass in der Konsole das hier erscheint:

```ts
Using config at /home/jacob/stenciljs-tutorial/E2E/playwright.config.ts

Running 1 test using 1 worker

  1 passed (2s)
```

Wollen wir etwas mehr Effekte, können wir den Debug-Modus anschmeißen:

```ts
"test:local": "PWDEBUG=console playwright test"
```

Der Parameter _PWDEBUG=console_ öffnet den Browser und man bekommt etwas mehr Output in der Konsole.

Das war unser erster Test.

#### Was haben wir gelernt?

-   Wie installiert man Playwright?
-   Wie wird es Konfiguriert?
-   Was sind die verschiedenen Parameter der Konfiguration?
-   Wie verwende ich welche Browser?
-   Wie sieht ein Test aus?

#### Ausblick

Im nächsten Artikel testen wir die Adressbuch-Applikation über Playwright durch.

<br/>

#### Nachtrag 01.01.2022

Vielen Dank an [Huluvu424242](https://github.com/Huluvu424242) für das Feedback und das Beheben meiner Vertipper!

\
Der Code hierzu liegt auf [Github](https://github.com/derKuba/stenciljs-tutorial).

Ihr habt Fragen oder Anregungen? Schreibt mir bei [Twitter](https://twitter.com/der_kuba).

\
Tausend Dank fürs Lesen!

Kuba
