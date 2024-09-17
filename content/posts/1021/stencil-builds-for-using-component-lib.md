---
title: Verwendung der Component Library aus dem StencilJS Build
description: Wie verwende ich die gebauten Komponenten?
date: 2021-10-31
tags: ["stenciljs", "storybook"]
layout: layouts/post.njk
---

In den letzten beiden Artikeln habe ich gezeigt wie man eine Komponentenbibliothek aufsetzt und wie man Storybook benutzt. Damit ist die Grundlage geschaffen. Was ist der nächste logische Schritt, wenn man einige (oder alle) Komponenten fertig hat? Richtig! Man möchte diese verwenden.
Die Grundidee ist die Arbeitsteilung. Ein Team/Spezialist kümmert sich um die Komponentenbibliothek und stellt diese anderen Teams zur Verfügung.<!-- endOfPreview -->
Die anderen Teams haben dadurch mehr Zeit sich um die Implementierung der Fachlichkeit und Businesslogik zu kümmern.

Ich habe den Artikel in drei Teile gegliedert:

1.  [Was sind die StencilJS-Builds a.k.a. Output-Targets?](#stencil-builds)
2.  [Wie wende ich diese an?](#wie-wende-ich-diese-an%3F)
3.  [Fazit](#fazit)

#### Was sind die StencilJS-Builds, bzw, Output-Targets?

Langer Rede kurzer Sinn. Die Ausgangslage sieht so aus, dass wir einige Komponenten in [unserem component-lib Projekt](https://github.com/derKuba/stenciljs-tutorial/tree/main/component-lib) (Kuba-Button, My-Component, Kuba-Input) liegen haben. Diese stellen wir nun zur Verfügung. Dazu müssen wir uns anschauen, wie [StencilJS](https://stenciljs.com/docs/output-targets) dies ermöglicht.

| Build parameter             |                      Output                       | Funktion                                                                                                                                                                   |
| --------------------------- | :-----------------------------------------------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| dist                        | - cjs, collection, component-lib, types, index.js | Komponenten als wiederverwendbare Bibliothek inklusive Lazy Loading                                                                                                        |
| dist-custom-elements        |  - index.js, \*.js (jede einzelne Komponente.js)  | Empfohlene Einstellung zur Verwendung der Komponenten in Frameworks. tree-shaking-optimiert. Jede Komponente wird einzeln importierbar aus ihrer eigenen Datei             |
| dist-custom-elements-bundle |  - index.js, \*.js (jede einzelne Komponente.js)  | Dasselbe wie zuvor, nur dass die Komponenten in einem großen Bundle zusammen sind.                                                                                         |
| www                         |                       ./www                       | Eine fertig gepackte Webseite. Dient zum Debugging, aber auch zum adaptieren zum eingen Zweck. Die Einbindung und Benutzung der Komponenten wird hier am Beispiel gezeigt. |
| docs-readme                 |                     readme.md                     | Erzeugt neben jeder Komponente eine Dokumentationsdatei. Die weiteren Docs-Properties erstellen analoge Dokumentationsdateien.                                             |

Wenn man sich diese breite Palette an Build-Optionen anschaut, wird man im ersten Moment erschlagen. Man muss ganz genau wissen, welchen Zweck man verfolgt. Benutze ich Komponenten in einem Web-Framework oder in einer Webanwendung. Benötige ich die Komponenten zum Bauen einer Webseite?
Jede Variante hat seine Vor- und Nachteile.

**dist**

**\+** Große Auswahl an Einbindungsmöglichkeiten
<b>-</b> Es wird mehr erzeugt als man wohl möglich benötigt
<b>-</b> sehr unspezifisch

**dist-custom-elements**
**\+** Gute Möglichkeit einzelne Komponenten zu bauen
**\+** Man hat nur den Code den man braucht
<b>-</b> Benötigt einen Bundler, damit es im Browser läuft
<b>-</b> stencil-core wird benötigt

**dist-custom-elements-bundle**
**\+** Stellt alle Komponenten zur Verfügung
<b>-</b> Benötigt einen Bundler, damit es im Browser läuft
<b>-</b> stencil-core wird benötigt

**www**
**\+** Erzeugt einen Webseiten-Skeleton
**\+** Benötigt keinen Bundler, keinen zusätzlichen Code
**\+** Lazy Loading optimiert
<b>-</b> Keine einzelnen Komponenten extrahierbar
<b>-</b> Erzeugt sehr viele Dateien, die einzeln nachgeladen werden (automagisch)

#### Wie wende ich diese an?

Für die Präsentation der Anwendung habe ich im Beispielprojekt einen Unterordner ["component-lib-usage" angelegt](https://github.com/derKuba/stenciljs-tutorial/tree/main/component-lib-usage). In diesem befinden sich die Beispiel HTML-Seiten, die das jeweilige Build-Ziel einbinden. Dazu gibt es noch den Bundling-Code.

Die Anwendung umfasst immer drei Teile:

1. Konfiguration Build-Ziel
2. optional Bundling
3. Einbindung in eine HTML

Für das Bundling verwende ich [Webpack](https://webpack.js.org/) und zum Anzeigen der Webseite (um das Nachladen der Module zu simulieren) den Python SimpleHTTPServer. Aber es ist total egal was man hier verwendet. Das Bundling muss das Importieren von Modulen ermöglichen und ein Webserver muss Dateien an den Browser ausliefern können.

#### Konfiguration der Builds

Die Konfiguration der Build-Ziele erfolgt in der StencilJS-Konfigurationsdatei und wird unter dem Key _outputTargets_ gesteuert. Da das _dist_ quasi die folgenden drei Möglichkeiten umfasst, beschreibe ich diese einzeln.

```ts
// stencil.config.ts
import { Config } from "@stencil/core";

export const config: Config = {
    namespace: "component-lib",
    outputTargets: [
        {
            type: "dist",
            esmLoaderPath: "../loader",
        },
        {
            type: "dist-custom-elements",
        },
        {
            type: "dist-custom-elements-bundle",
        },
        {
            type: "www",
            serviceWorker: null, // disable service workers
        },
        {
            type: "docs-readme",
        },
    ],
};
```

```ts
npm run build
// oder
stencil build
```

Den Inhalt des dist-Verzeichnissen, kopiere ich unter component-lib-usage.

**dist-custom-elements**
Wenn man den Stencil-Bau-Befehl ausführt, erhält man unter /dist/components/ alle Komponenten als einzelne Dateien. Im Beispielprojekt erscheinen so die Dateien _kuba-button.js, kuba-input.js, kuba-wizard.js, ..._ . Durch das Kopieren befinden sich dieser Dateien nun unter /component-lib-usage/components.
Laut der Dokumentation von Stenciljs können diese über folgenden Code geladen werden:

```ts
// init_kuba_button.js
import { KubaButton } from "./kuba-button";

customElements.define("kuba-button", KubaButton);
```

Das stellt dem Browser die neuen Elemente vor und diese können dann einfach im HTML aufgerufen werden. Wenn man das so naiv macht, wie ich das gemacht habe, spuckt der Browser (Chrome) den Fehler aus, dass er _import_ nicht kennt. Hier kommt Webpack zum Einsatz. Als Beispiel möchte ich den Kuba-Button verwenden.
Ein Bundler braucht eine Einstiegsdatei, um alle Imports aufzulösen. Dazu kopieren ich den Code in die neue Datei _init_kuba_button.js_. Jetzt benötige ich eine Webpack-Konfig und einen NPM befehl, um webpack zu starten:

```ts
// webpack.component.config
const path = require("path");

module.exports = {
    entry: "./components/init_kuba_button.js", // Entry File
    output: {
        path: path.resolve(__dirname, "dist"), //Output Directory
        filename: "components/bundle.js", //Output file
    },
};

// package.json script
 "build_single_component": "webpack --mode production --config=webpack.component.config.js"
```

Dies erzeugt unter dist/components/ eine _bundle.js_. Diese Datei müssen wir jetzt in ein HTML-Skeleton einbinden:

```html
<!doctype html>
<html dir="ltr" lang="en">
    <head>
        <meta charset="utf-8" />
        <title>Custom Component</title>
        <script src="./dist/components/bundle.js"></script>
    </head>
    <body>
        <h1>Hello Welt components</h1>

        <kuba-button>Hello</kuba-button>
    </body>
</html>
```

In Zeile 6 sehen wir die Einbindung der _bundle.js_ im script-Tag. Das Besondere zeigt die Zeile 11. Hier verwenden wir die Kuba-Komponente als wäre sie ein existierendes HTML Tag.
Schauen wir uns die Datei nun über den Browser an, der auf den Python-Webserver zugreift an, sehen wir, dass auch funktioniert:

```bash
python -m SimpleHTTPServer

// im browser unter
http://localhost:8000
```

![component einstieg](/img/1021/index_component.png "component einstieg")<div class="has-text-right image-subline">Bild 1: Einzelne Komponente</div>

**dist-custom-elements-bundle**
Nach dem build-Befehl entsteht ein Ordner unter /dist/custom-elements mit jeweils einer _index.ts_-Datei und der dazugehörigen _index.d.ts_-Datei. Diesmal sind alle gebauten Komponenten in der Datei gepackt. Aber auch hier bitte ich um Vorsicht. Es ist für Frameworks, bzw. für das moderne JS optimiert und läuft nicht out-of-the-box im Browser. Wir müssen auch hier erst einmal mit Hilfe von Webpack ein browserfähiges Bundle bauen.
Wir kopieren den Inhalt des Ordners in unser neues Projekt.
Auch hier brauchen wir ein Einstiegsdatei:

```ts
// custom-elements/bundler.js
import { defineCustomElements } from "./index";

defineCustomElements();
```

und die dazugehörige Webpack-Config mitsamt package.json Skriptbefehl:

```ts
// webpack.component.config
const path = require("path");

module.exports = {
  entry: "./custom-elements/bundler.js", // Entry File
  output: {
    path: path.resolve(__dirname, "dist"), //Output Directory
    filename: "custom-elements/bundle.js", //Output file
  },
};

// package.json script
  "build_custom_elements": "webpack --mode production --config=webpack.custom-elements.config.js",
```

Wenn wir diesen Befehl ausführen erhalten wir unter /dist/custom-elements eine bundle.js. Diese referenzieren nun in unserem neuen HTML-Skeleton.

```ts
<!DOCTYPE html>
<html dir="ltr" lang="en">
    <head>
        <meta charset="utf-8" />

        <title>Mein HTML Projekt</title>
        <script src="./dist/custom-elements/bundle.js"></script>
    </head>
    <body>
        <h1>Hello Welt custom-elements</h1>

        <my-component
            first="Stencil"
            last="'Don't call me a framework' JS"
        ></my-component>

        <kuba-button>Hello</kuba-button>
    </body>
</html>
```

Analog zu dem vorherigen Beispiel sieht man in Zeile 7 die Einbindung und ab Zeile 11 die Verwendung der "neuen" HTML-Tags.

![Custom Elements Bundle](/img/1021/custom-element-index.png "Custom Elements Bundle")<div class="has-text-right image-subline">Bild 2: Custom Elements Bundle</div>

\
**www build**
Nach dem build-Befehl hat man einen Ordner _www_. Diesen kopieren wir in das neue Projekt. Hier ist schon alles fertig transpiliert. Es ist lauffähig im Browser. Wir benötigen nur einen neuen HTML-Skeleton:

```ts
<!DOCTYPE html>
<html dir="ltr" lang="en">
    <head>
        <meta charset="utf-8" />
        <title>WWW</title>

        <script type="module" src="www/build/component-lib.esm.js"></script>
        <script nomodule src="www/build/component-lib.js"></script>
    </head>
    <body>
        <h1>Hello Welt</h1>
        <my-component
            first="Stencil"
            last="'Don't call me a framework' JS"
        ></my-component>

        <kuba-button>Hello</kuba-button>
    </body>
</html>
```

In Zeile 7 und 8 sieht man die Einbindung. Danach hat man Zugriff auf seinen Komponentenkatalog (Zeile 11-14). Die Darstellung im Browser ist Analog zu Bild 2.

#### Fazit

In diesem Artikel habe ich gezeigt wie man seine eigene Komponentenbibliothek ausliefert und integriert anhand der verschiedenem Builds von StencilJS. Ab jetzt sollte jeder in der Lage sein das Projekt nachzustellen. Vielleicht habe ich die Lust geweckt auf so eine Komponentenbibliothek zu setzen. Wir haben damit bereits sehr gute Erfahrungen gesammelt und folgen diesem Pattern sehr gerne. Ich finde es ist eine tolle Technologie und Methodik.

Der Code liegt wie immer auf [Github](https://github.com/derKuba/stenciljs-tutorial).

Ihr habt Fragen oder Anregungen? Schreibt mir bei [Twitter](https://twitter.com/der_kuba).
\
\
Tausend Dank fürs Lesen!

Kuba
