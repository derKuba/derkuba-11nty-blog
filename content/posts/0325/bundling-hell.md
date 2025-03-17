---
title: "Parcel, Vite oder Webpack – Welcher Bundler passt zu deinem Projekt?"
description: Warum wir uns trotz schnellerer Alternativen bewusst für Webpack entschieden haben – und wie wir dahin kamen.
date: 2025-03-16
tags: ["bundler"]
layout: layouts/post.njk
lang: "de"
alternate_lang: "en"
alternate_url: "/posts/en/0325/bundling-hell"
---

Vor einiger Zeit haben wir bei [TOPIC PRO](https://www.mountbarley.de/) unser altes **AngularJS-Frontend** gegen einen moderneren Stack ausgetauscht. Unsere Wahl fiel dabei auf **Solid.js**, ein Framework, das ich besonders schätze, weil es mir im Gegensatz zu Angular nicht vorschreibt, welches Module und Tools ich einsetzen darf. <!-- endOfPreview -->Solid.js gibt mir alle Freiheiten, genau die Werkzeuge einzusetzen, die ich selbst wähle.

Vor etwa einem Jahr war ich total begeistert von **Parcel**. Alle Artikel schwärmten damals von der einfachen Bedienbarkeit und der schnellen Einrichtung ganz ohne aufwendige Konfiguration. Besonders charmant fand ich, dass bei Parcel quasi die `index.html` die komplette Steuerung übernimmt. Ein einfaches Verlinken meines Script-Moduls und meiner SCSS-Dateien genügte, und alles lief direkt. Es klang perfekt für unsere Zwecke.

Doch im Laufe der Zeit traten immer häufiger Probleme mit Abhängigkeiten auf. Mal funktionierte Solid.js plötzlich nicht mehr richtig, mal brauchte Parcel plötzlich zusätzliche Module, je nachdem, auf welchem Betriebssystem man arbeitete. Sobald wir minimal vom Standardverhalten abweichen wollten, mussten wir plötzlich eigenartige Konfigurationen in der `package.json` vornehmen, und Parcel installierte ungefragt immer wieder neue Module. Der anfängliche Charme war somit schnell dahin.

Aus Frust darüber entschieden wir uns, Parcel aus dem Projekt zu verbannen und stattdessen **Vite** eine Chance zu geben. Immerhin gilt Vite als moderner und besonders schneller Dev-Server, der gleichzeitig noch einiges an Flexibilität verspricht. Wir setzten also unseren Proxy-Server (für unser Basic Auth-geschütztes Backend), SCSS, verschachtelte Web Components und TypeScript auf – und waren ziemlich enttäuscht, als Vite nicht wie erhofft funktionierte.

Nach viel Hin und Her und Austausch mit ChatGPT über Alternativen wie Esbuild (das aber leider keinen kompletten Dev-Server mitbringt), griff ich schließlich wieder auf das gute alte **Webpack** zurück. Eigentlich hatte ich ja immer gedacht, Webpack wäre kompliziert oder langsam. Waren das vielleicht nur Vorurteile oder ein Mythos? Überraschenderweise funktionierte Webpack auf Anhieb – bis plötzlich wieder dieselben Probleme auftauchten, die wir schon bei Vite hatten. Letztendlich stellte sich heraus, dass weder Webpack noch Vite schuld waren, sondern das Problem tatsächlich an der neuesten Version von Solid.js lag.

Damit stand fest: Webpack und Vite sind funktional etwa gleich gut, es gibt jedoch einen entscheidenden Unterschied – und der steckt schon im Namen: die Geschwindigkeit beim initialen Starten des Dev-Servers.

| Bundler | Startzeit |                                                           |
| ------- | --------- | --------------------------------------------------------- |
| Parcel  | 395 ms    | ![parcel build](/img/0325/parcel.png "parcel runtime")    |
| Vite    | 170 ms    | ![vite build](/img/0325/vite.png "vite runtime")          |
| Webpack | 2548ms    | ![webpack build](/img/0325/webpack.png "webpack runtime") |

Ja, Webpack ist beim initialen Start am langsamsten. Doch ich entscheide mich trotzdem bewusst dafür, denn Webpack bietet mir maximale Kontrolle. Diese langsame Startzeit nehme ich dafür gerne in Kauf, denn so bin ich nicht mehr den Launen automatischer Nachinstallationen oder undurchsichtiger Config-Magie ausgeliefert.

#### Als Empfehlung ziehe ich folgendes Fazit:

-   **Parcel** ist ideal, wenn man schnell und unkompliziert starten möchte und kaum spezielle Anforderungen hat.
-   **Vite** empfehle ich, wenn Geschwindigkeit wichtig ist und man trotzdem genügend Kontrolle behalten möchte.
-   **Webpack** ist mein persönlicher Favorit für komplexe Projekte, bei denen maximale Kontrolle und Transparenz wichtiger sind als die reine Startgeschwindigkeit.

Manchmal erkennt man eben erst nach einigen Umwegen, wo das eigentliche Problem liegt – und was man wirklich braucht. Für [TOPIC PRO](https://www.mountbarley.de/) passt Webpack deshalb perfekt.

Für Feedback bin ich immer dankbar.
Gerne an jacob@derkuba.de

Viele Grüße

Euer Kuba
