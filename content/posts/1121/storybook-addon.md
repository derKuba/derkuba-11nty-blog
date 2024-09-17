---
title: Storybook Addon erstellen und veröffentlichen
description: Wie erweitert man Storybook um ein Addon
date: 2021-11-09
tags: ["stenciljs", "storybook"]
layout: layouts/post.njk
---

Heute zeige ich wie man ein Storybook Addon schreibt. Jedes Projekt ist individuell und einzigartig sind auch die Anforderungen. Storybook bietet einen breiten Katalog an [Addons](https://storybook.js.org/addons) an. Ein tolles Feature, das das Entwicklungsteam anbietet, ist die Möglichkeit weitere Addons selber zu schreiben. <!-- endOfPreview -->Dabei kann man dann selber entscheiden, ob man es in den Katalog aufnehmen lassen möchte, oder ob man es einfach nur in sein Projekt integriert. Aber wie erstellt man nun ein Addon?
Dazu gibt es [eine Anleitung und auch eine API](https://storybook.js.org/docs/react/addons/writing-addons/). Es gibt zum Starten zwei Möglichkeiten. Man kann auf einer grünen Wiese starten oder man klont das [Starterprojekt](https://github.com/storybookjs/addon-kit) und ergänzt dieses. Wir machen heute ersteres.

#### Initiales Setup

Analog zu den vorherigen Artikeln legen wir einen Ordner an, initalisieren ein NPM-Projekt und beginnen dann die Storybook Addons dependencies hinzuzufügen.

```bash
mkdir storybook-addon-hello-world
cd storybook-addon-hello-world
npm init
```

Damit steht das Gerüst. Unser Addon wird in React geschrieben und mit Hilfe von Babel transpiliert. Als nächstes fügen wir Babel zum Projekt hinzu.

```bash
npm install -D @babel/cli @babel/preset-env @babel/preset-react
```

Anschließend legen wir eine Babel-Konfigurationsdatei (.babelrc.js\_) an und füllen diese mit Leben.

```bash
touch .babelrc.js
```

```js
module.exports = {
    presets: ["@babel/preset-env", "@babel/preset-react"],
};
```

In Zeile 2 sehen wir nun, dass die zuvor installierten Presets zum Zug kommen. Ein Preset ist eine kleine Sammlung von Plugins, um eine Sprache zu unterstützen. In unserem Fall [ES6+](https://www.w3schools.com/js/js_es6.asp).

Jetzt tragen wir den Babel-Befehl, das Babel-Skript, in unsere package.json ein.

```json
...
scripts:{
"build": "babel ./src --out-dir ./dist --ignore '**/*.spec.jsx'",
},
....
```

In Zeile 3 sehen wir den Befehl. Der erste Parameter ist das Quellverzeichnis _/src_. Es folgt das Zielverzeichnis, _/dist_. Daneben gesellt sich eine Ignorierliste: die Tests. Diese müssen nicht transpiliert werden. Um es zu testen benötigen wir noch etwas Code und das Quellverzeichnis.

```bash
mkdir src
cd src
touch presets.js
touch register.js
```

Jetzt existiert das Quellverzeichnis und wir haben die Einstiegsdatei _presets.js_. Diese Datei sucht Storybook für den Einstieg. In dieser registrieren wir unser Plugin. In der _register.js_-Datei beginnt React.

```ts
// presets.js
function managerEntries(entry = []) {
    return [...entry, require.resolve("./register")];
}

module.exports = { managerEntries };
```

Jetzt können wir mal den build-Befehl ausführen.

```bash
npm run build
```

Es entsteht ein Ordner _/dist_ in dem sich die Datei _presets.js_ und hat nun etwas mehr Inhalt.

```js
"use strict";

function _toConsumableArray(arr) {
    return (
        _arrayWithoutHoles(arr) ||
        _iterableToArray(arr) ||
        _unsupportedIterableToArray(arr) ||
        _nonIterableSpread()
    );
}

function _nonIterableSpread() {
    throw new TypeError(
        "Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.",
    );
}

function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
        return _arrayLikeToArray(o, minLen);
}

function _iterableToArray(iter) {
    if (
        (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null) ||
        iter["@@iterator"] != null
    )
        return Array.from(iter);
}

function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) {
        arr2[i] = arr[i];
    }
    return arr2;
}

function managerEntries() {
    var entry =
        arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    return [].concat(_toConsumableArray(entry), [
        require.resolve("./register"),
    ]);
}

module.exports = {
    managerEntries: managerEntries,
};
```

Der Inhalt ist transpiliertes und im Browser lauffähiges Javascript. Damit funktioniert unser Setup. Ich schlage noch eine kleine Erweiterung vor: einen Watcher.
Im aktuellen Setup muss man nach jeder Änderung den Befehl ausführen, um zu transpilieren. Es gibt ein npm-Modul, das eine Änderung am Sourcecode erkennt und den Build-Befehl ausführt.

```bash
npm install -D npm-watch
```

In die _package.json_ fügen wir noch die Watch-Konfiguration.

```json
// package.json
 "watch": {
    "build": {
      "patterns": [
        "src"
      ],
      "extensions": [
        "js,jsx"
      ]
    }
  },
```

Unter watch kommt der Befehl, der nach einer Änderung ausgeführt werden soll. Es ist der bekannte, und oben genannte Build-Befehl. Um das Watching zu starten, benötigen wir einen weiteren Skritpbefehl.

```bash
"dev": "npm-watch build",
```

Ich hab mir angewöhnt meine Arbeitstasks immer "dev" zu nennen.
Mit _npm run dev_ starte ich den Watcher, der beobachtet die Dateien unter _patterns_ mit der Dateiendung (_extensions_) _.js, .jsx_.

Das erhöht ungemein die Arbeitsgeschwindigkeit und den Komfort.

#### Plugin Development

Jetzt geht es an die Fachlichkeit. Wie bereits erwähnt ist die _register.js_ die Einstiegsdatei für das UI.

```js
// register.js
import React from "react";
import { addons, types } from "@storybook/addons";
import { AddonPanel } from "@storybook/components";

const ADDON_ID = "myaddon";
const PANEL_ID = `${ADDON_ID}/panel`;

addons.register(ADDON_ID, (api) => {
    addons.add(PANEL_ID, {
        type: types.PANEL,
        title: "My Hello World",
        render: ({ active, key }) => (
            <AddonPanel active={active} key={key}>
                <div> hello world </div>
            </AddonPanel>
        ),
    });
});
```

Die ersten vier Zeilen beinhalten die imports der Kernbibliothek React und die Elemente von Storybook. Das Addon benötigt eine ID um sich aufzubauen. In dem Callback der _register_-Funktion hat man nun die Möglichkeit [drei Hauptelemente](https://storybook.js.org/docs/react/addons/addon-types#ui-based-addons) zu erweitern:

-   [das Panel](https://derkuba.de/content/posts/1021/component-lib-storybook/) zu gestalten.
-   die Toolbar
-   die Tabs

In unserem Fall erweitern wir das Panel. In den Zeilen 14-16 sehen wir die Storybook-Panelkomponente. Im Bauch dieser Komponente beginnt unsere grüne Wiese. Dort platzieren wir das DIV mit Hello-World.

#### Addon im Einsatz

Wir haben jetzt eine erste lauffähige Version. Doch wie bekommen wir diese nun zu sehen. Ich habe dafür mein bestehendes [Storybook-Projekt](https://github.com/derKuba/stenciljs-tutorial/tree/main/component-lib) genutzt. Aber jedes andere bestehende Storybook-Projekt ist dafür geeignet.

Um das Addon nicht auf NPM zu packen und es erstmal lokal zu testen, gibt es einen Trick: **npm link**.

Man linkt das Addon-Projekt mit dem bestehenden Projekt. Dafür muss man jeweils im Addonprojekt und im "Zielprojekt" einen npm Befehl ausführen.

```bash
//addonverzeichnis

(sudo) npm link

// im Zielverzeichnis

(sudo) npm link [NAME IN DER PACKAGE.JSON]
```

Ich habe sudo in Klammern geschrieben, weil es auf meiner Kiste nicht funktioniert. Auf anderen Rechnern soll es auch ohne funktionieren. Einfach mal ausprobieren.

Jetzt muss das Addon nur noch im Zielprojekt in der Storybook-Konfiguration eingetragen werden.

```js
// .storybook/main.js
module.exports = {
    stories: [
        "../src/**/*.stories.mdx",
        "../src/**/*.stories.@(js|jsx|ts|tsx)",
    ],
    addons: [
        "@storybook/addon-links",
        "@storybook/addon-essentials",

        // einfach unter die eingetragenen Addons hinzufügen
        "NAME-DES_ADDONS/dist",
    ],
};
```

Wenn man nun das Zielprojekt startet, sollte man in jeder Story ein drittes Paneltab sehen, in dem Hello World steht. Durch das Watchskript sieht man nun auch jede Änderung am Addonquellcode direkt beim Neuladen der Seite. Ein Traum zum Entwickeln.

Jetzt steht euren Ideen nichts mehr im Weg.

#### Veröffentlichung

Um das Plugin in den [Storybook Addon Katalog](https://storybook.js.org/docs/react/addons/addon-catalog) zu bekommen, muss man noch zwei Dinge tun:

-   die Storybook-Metainformation in die package.json ergänzen
-   das Addon bei NPM hosten

#### Storybook Metainformation

Damit Storybook euer Addon findet müsst erstmal in der _package.json_ die Felder _name_, _description_, _author_, _keywords_, _repository_ ausfüllen.

```json
// Beispiel aus meinem Addon
{
    "name": "storybook-addon-custom-event-broadcaster",
    "description": "storybook addon for broadcasting custom events",
    "main": "dist/preset.js",
    "keywords": ["storybook-addons", "custom-events", "code", "debug"],
    "author": "Jacob Pawlik <jacob@derkuba.de> (http://derkuba.de)",
     "repository": {
    "type": "git",
    "url": "git+https://github.com/derKuba/storybook-custom-event-broadcaster.git"
  },
  ...
}
```

Für die richtige Anzeige im Katalog werden noch die Attribute _displayName_, _icon_, _unsupportedFrameworks_, _supportedFrameworks_ zur Verfügung gestellt. Diese sind aber Optional.

```json
// Beispiel aus meinem Addon
{
    "storybook": {
        "displayName": "Custom Events Broadcaster",
        "supportedFrameworks": ["react", "angular", "stenciljs"],
        "icon": ""
    }
}
```

#### NPM

Um ein package (so heißen dort die Pakete - es handelt sich aber um euer Addon) bei [npmjs](https://www.npmjs.com/) abzulegen, benötigt man ein Konto dort. Man registriert sich und (WICHTIG) bestätigt die E-Mailadresse. Wenn man dies nicht tut bekommt man eine kryptische Fehlermeldung.

```ts
npm ERR! code E403
npm ERR! 403 403 Forbidden - GET
npm ERR! 403 In most cases, you or one of your dependencies are requesting
npm ERR! 403 a package version that is forbidden by your security policy.
```

Nein, ihr habt dann keine verbotenen Pakete, sondern eure E-Mailadresse wurde nicht bestätigt ( dankt mir später :-) ).

Als nächstes müsst ihr euch per npm einloggen. Auch hier gibts 2 Möglichkeiten.

1. ihr führt _npm login_ aus und gibt eure Credentials ein
2. ihr hinterlegt eure Credentials in eurer globalen (im Homeverzeichnis) ~/.npmrc

```ts
registry=https://registry.npmjs.com/
_auth="<token>"
email=<email>
always-auth=true
```

Den Token könnt ihr in eurem Benutzerprofil auf der Webseite erstellen.

Wenn das alles geklappt hat, muss man es noch veröffentlichen.

```bash
// für die vorsichtigen
npm publish -- dry run
```

Das simuliert eine Veröffentlichung und man bekommt Feedback ob alles passt.

```bash
npm publish --access public
```

Veröffentlicht euer package. Ihr findet das nun unter eurem Benutzerkonto unter _packages_. Manchmal benötigt es einige Zeit, bis ihr über die NPM-Suche fündig werdet. Ein bisschen Geduld ist gefragt. Um sicher zu gehen gibt es die Möglichkeit zu versuchen das Paket anzuzeigen oder zu installieren.

```ts
npm install packageName
npm show packagename
```

Das wars. Bei mir hat es gut 30 Stunden gedauert und mein Plugin war im Katalog zu finden.

#### Fazit

Ich hoffe, dass dieser Artikel helfen kann weitere tolle Addons für Storybook zu schreiben und Storybook helfen noch besser zu werden. Es ist sehr einfach und schafft einen Spielplatz für viele Möglichkeiten und Ideen.

Schaut gerne mal in unser Addon rein und gebt mir gerne Feedback.

https://storybook.js.org/addons/storybook-addon-custom-event-broadcaster/

https://www.npmjs.com/package/storybook-addon-custom-event-broadcaster

\
Der Code hierzu liegt auf [Github](https://github.com/derKuba/).

Ihr habt Fragen oder Anregungen? Schreibt mir bei [Twitter](https://twitter.com/der_kuba) oder per <a href="mailto:jacob@derkuba.de"> E-Mail</a> .

\
Tausend Dank fürs Lesen!

Kuba
