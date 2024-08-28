---
title: "StencilJS-Tutorial: 1. Projekt aufsetzen"
description: Neues Projekt initiieren
date: 2021-05-29
tags: ["stenciljs"]
layout: layouts/post.njk
---

In der Dokumentation von [StencilJS](https://stenciljs.com/docs/getting-started) wird erklärt wie man ein Projekt neu aufsetzt. <!-- endOfPreview -->Der Befehl

```bash
npm init stencil
```

startet eine Abfrage, in der man sich für eine Auswahl entscheiden muss ob man eine Progressive Web APP, eine Webseite oder eine einfache Komponente bauen möchte. Wir entscheiden uns für die zweite Auswahl.

![Stencil Start](/content/img/stenciljs-tutorial/stencil-starter.png "Stencil Start")<div class="has-text-right image-subline">Bild 1: Auswahl</div>

Nachdem man sich für die zweite Auswahl entschieden hat, muss man noch einen Namen für das Projekt eingeben: address-book und bestätigt mit Y.

![Stencil Start Ende](/content/img/stenciljs-tutorial/stencil-starter-finish.png "Stencil Start Ende")<div class="has-text-right image-subline">Bild 2: fertige Auswahl</div>
Das Stencil-Starter-Projekt wurde erfolgreich heruntergeladen. Es fehlen aber noch die Dependencies.

```bash
cd address-book
npm install
npm start
```

und es startet ein Browser unter der Adresse http://localhost:3333 mit folgendem Inhalt:

![Stencil Start Ende](/content/img/stenciljs-tutorial/stencil-starter-app.png "Stencil Start Ende")<div class="has-text-right image-subline">Bild 2: fertige Auswahl</div>

Nun hat man eine lauffähige Webseite, die nach und nach umgebaut wird. Aber schauen wir mal woraus das Starter-Paket besteht:

![Stencil Starter Dateien](/content/img/stenciljs-tutorial/stencil-starter-files.png "Stencil Starter Dateien")<div class="has-text-right image-subline">Bild 2: Starter Dateien</div>

| Datei                    |                                                               Inhalt |
| ------------------------ | -------------------------------------------------------------------: |
| src/assets/\*            |                                                 bilder, icons, fonts |
| src/components/\*.ts     |                                                   Komponentenklassen |
| src/components/\*.css    |                            Gekapseltes CSS der jeweiligen Komponente |
| src/global/_.css / _.tss | Globales CSS und ein globales Skript (sollte möglichst leer bleiben) |
| src/components.d.ts      |                   Automatisch generierte Typen-Datei der Komponenten |
| src/index.html           |      Zentrale HTML-Datei, in der die Root-Komponente eingehangen ist |
| src/index.ts             |                                       "Main"-Datei des Programmcodes |
| src/manifest.json        |                                      Metadaten-Datei für die Browser |
| src/.editorconfig        |           Formatierungsdatei für den Editor (charset, tab spaces...) |
| src/.gitignore           |                       Welche Dateien sollen nicht eingecheckt werden |
| src/.prettierrc.json     |    Konfigurationsdatei für Prettier (Formatierungsvereinheitlichung) |
| src/package-lock.json    |    Automatisch von npm generiert - beschreibt den Abhängigkeitenbaum |
| src/package.json         |  Beschreibt das Projekt (Abhängigkeiten zu Modulen, Lizenz, Skripte) |
| src/stencil.config.ts    |                             Zentrale Konfigurationsdatei für Stencil |
| src/tsconfig.json        |                          Zentrale Konfigurationsdatei für Typescript |

Im nächsten Artikel geht es dann endlich los mit der eigentlichen Programmierarbeit.

Der Code hierzu liegt auf [Github](https://github.com/derKuba/stenciljs-tutorial). Um es auf diesen Stand zu bringen, müsst ihr das Projekt klonen und einmal auf den Tag 0.9.0 auschecken:

```bash
git clone git@github.com:derKuba/stenciljs-tutorial.git
git checkout -b stencil-starter 0.9.0
```

Ihr habt Fragen oder Anregungen? Schreibt mir bei [Twitter](https://twitter.com/der_kuba).
\
\
Tausend Dank fürs Lesen!

Kuba
