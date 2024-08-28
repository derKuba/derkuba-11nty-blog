---
title: "Storybook im Einsatz"
description: Wie stellt man Storybook ein?
date: 2021-10-15
tags: ["stenciljs", "storybook"]
layout: layouts/post.njk
---

In meinem letzten Artikel habe ich [Storybook](https://storybook.js.org/) vorgestellt. Heute möchte ich die Bedienung erklären. Es ist ein tolles Tool mit vielen Möglichkeiten, um eure Komponenten zu entwickeln, zu katalogisieren oder sogar zu testen.<!-- endOfPreview --> Dazu gibt es die Möglichkeit das Programm durch Addons zu erweitern. Es gibt eine große Auswahl an bestehenden Addons und dazu noch eine API, um selber eigenen Addons zu entwickeln. Dazu gibt es bald einen eigenen Artikel.

Ich stelle euch jetzt vor:

-   Wie ist Storybook aufgebaut?
-   Wie ist meine Komponente dokumentiert?
-   Wie dynamisiere und dokumentiere ich die Properties meiner Komponente?
-   Wie installiere ich ein Addon?

#### Wie ist Storybook aufgebaut?

![Storybook aufbau](/content/img/1021/storybook-overview.png "Aufbau Storybook")

<div class="has-text-right image-subline">Bild 1: Aufbau Storybook</div>

Ich habe Storybook in seine wesentlichen Bereiche eingeteilt:

**Grün - linker Bereich**
Die Seitenleiste enthält eine **_Suche_**, die alle bestehenden Komponenten durchsucht. Dabei wird nach der Zeichenkette innerhalb des Namens gesucht.
Über der Suchleiste ist ein Burger-Icon, das ein Menü öffnet. Darin befinden sich Links zu den Releasenotes und der About-Seite. Aber viel wichtiger sind die **_Shortcuts für die Tastatur_**

**Rot - oberer Bereich**
Die obere Leiste enthält die **_Navigation_** zur Malfläche, in denen die Komponente gerendert wird oder zur Dokumentationsansicht, in der man weitere Informationen zur Komponente hinterlegen kann. Die übrigen Icons enthalten **_Werkzeuge zur Darstellung_**.

![Storybook Tools](/content/img/1021/storybook-tools.gif "Storybook Tools")

Sie beinhalten von links nach rechts folgende Funktionen:

-   Vergrößern / Zoomen
-   Verkleinern / Zoomout
-   Zurücksetzen des Zooms
-   Hintergrund der Malfläche ändern (hell/dunkel)
-   Gitternetz ein/ausblenden
-   Anzeige/Größe der Komponente in mobiler Ansicht (klein, groß) oder Tablet
-   Messfunktion (Komponenten werden markiert und die Pixelgröße angegeben)
-   Umrandung der Komponente anzeigen
-   Vollbild
-   Komponente im neuen Tab/Reiter öffnen
-   Link zur Seite kopieren

<div class="has-text-right image-subline">Bild 2*: Animation Tools</div>

\
**Blau - mittlerer Bereich**
In diesem Bereich, das Canvas oder die Malfläche, befindet sich die gerenderte Komponente, mit der man interagieren kann.

**Gelb - unterer Bereich**
Der gelbe Bereich beinhaltet die Addon-Leiste. Hier sind standardmäßig der Controls und der Actions Tab vorhanden. Ersterer ermöglicht das dynamische Übergeben von Parametern an die Komponente (Beispiel folgt). Der Actions-Tab gibt dem Nutzer die Möglichkeit Events (Click, Mouseover, etc.) auszuloggen. Ich persönliche arbeite nur mit der Controls-Leiste.

Insgesamt muss man sagen, dass es sehr übersichtlich gestaltet ist.

#### Wo ist meine Komponente dokumentiert?

Klickt man in dem rot markierten Bereich auf den Knopf **_Docs_** kommt man in die Beschreibung der Komponente:

![Storybook Docs](/content/img/1021/storybook-docs.png "Storybook Docs")

<div class="has-text-right image-subline">Bild 3: Dokumenationsansicht</div>

Der Aufbau ist übersichtlich. Es beginnt mit einer Leiste, die eine Zoom-Funktion hat. Darunter befindet sich die gerenderte Komponente. Diese Ansicht hat im rechten, unteren Rand einen Knopf, der den dazugehörigen Code einblendet (im Bild bereits ausgeklappt). Wiederum unter der Malfläche ist eine Tabelle, in der man die Properties der Komponente konfigurieren kann. Allerdings erscheint diese Tabelle nur, wenn dies konfiguriert wird.

#### Wie dynamisiere und dokumentiere ich die Properties meiner Komponente?

Zunächst muss man wissen welche Properties die Komponente hat und welche man dynamisieren möchte. Mit Dynamisierung meine ich die Möglichkeit die Properties zur Laufzeit zu verändern. So kann man zum Beispiel das Design herausfordern und extra lange Labels ausprobieren. In den großen Frameworks wie React werden die Controls sogar automatisch erkannt. Ist dies nicht möglich (wie z.B. in StencilJS) muss man dies händisch machen. Dazu erweitert man in der Story der Komponente _\*.stories.tsx_ das anonyme Objekt um das Attribut **_argTypes_**.

```ts
export default {
    title: "Content/My-Component",
    parameters: {},
    argTypes: {},
};
```

Jede Property erhält nun einen eigenen Eintrag bestehend aus diesen Feldern:

-   name ->
-   type -> Datentyp und required
-   defaultValue -> vorbelegter Wert
-   Beschreibung -> hier wird dokumentiert
-   control -> Welcher Input-Type wird benötigt

Ausgefüllt habe ich es exemplarisch für die StencilJS-Starter-Komponente **_my-component_**, die einen Vornamen, Mittelnamen und Namen als Property annimmt, um dann eine Grußformel auszugeben:

```ts
export default {
    title: "Content/My-Component",
    parameters: {},
    argTypes: {
        firstname: {
            name: "firstname",
            type: { name: "string", required: false },
            defaultValue: "Max",
            description: "der Vorname", 3*
            control: {
                type: "text",
            },
        },
        middlename: {
            name: "middlename",
            type: { name: "string", required: false },
            defaultValue: "Dabelju",
            description: "zweiter Vorname",
            control: {
                type: "text",
            },
        },
        lastname: {
            name: "lastname",
            type: { name: "string", required: false },
            defaultValue: "Nachname",
            description: "von Adelher",
            control: {
                type: "text",
            },
        },
    },
};
```

Der Code erklärt sich selbst. Wer weitere Input-Felder für Select-Listen, Checkboxes, Radiobuttons etc. benötigt, schaut kurz in die [Doku](https://storybook.js.org/docs/html/essentials/controls).

Die Control-Ansicht in Aktion sieht so aus:

![Storybook Controls](/content/img/1021/storybook-controls.gif "Storybook Controls")

<div class="has-text-right image-subline">Bild 3*: Animation Eingabe</div>

Zur Eingabe wird die Komponente neu gerendert.

<br/>

#### Wie installiere ich ein Addon?

Storybook bietet eine bunte Palette an Erweiterungen an. Ich empfehle jedem mal durch den [Katalog](https://storybook.js.org/addons) zu blättern. Ich habe bei der Vorbereitung für diesen Artikel in der [Storybook Demo](https://next--storybookjs.netlify.app/official-storybook/) ein zusätzlichen Addon gesehen, dass ich euch vorstellen möchte: [**Storysource**](https://storybook.js.org/addons/@storybook/addon-storysource).

Es fügt dem Addon-Panel den Reiter _Story_ hinzu. In diesem befindet sich nun der Quellcode der Story. So hat man sofort den Einblick wie Storybook funktioniert und auch wie die Komponente aufgebaut ist. Ja, es redundant, weil es so etwas im _Docs_-Reiter zu finden gibt. Aber dort ist alles in HTML ummantelt. Hier ist der echte Code.

Wie füge ich das Addon nun hinzu?

Erst einmal muss ich es meinem Projekt hinzufügen:

```bash
npm install @storybook/addon-storysource
```

Dann muss es in der _.storybook/main.js_ als Addon hinzugefügt werden:

```ts
module.exports = {
    stories: [
        "../src/**/*.stories.mdx",
        "../src/**/*.stories.@(js|jsx|ts|tsx)",
    ],
    addons: [
        "@storybook/addon-links",
        "@storybook/addon-essentials",

        // für die Standardkonfiguration anhängen
        "@storybook/addon-storysource",
    ],
};
```

Möchte man Einstellungen der Standardkonfiguration ändern, empfiehlt sich folgende Schreibweise:

```ts
module.exports = {
    stories: [
        "../src/**/*.stories.mdx",
        "../src/**/*.stories.@(js|jsx|ts|tsx)",
    ],
    addons: [
        "@storybook/addon-links",
        "@storybook/addon-essentials",

        {
            name: "@storybook/addon-storysource",
            options: {
                rule: {
                    // test: [/\.stories\.jsx?$/], This is default

                    // achtung, hier benötigt man noch
                    // const path = require('path');
                    include: [path.resolve(__dirname, "../src")], // You can specify directories
                },
                loaderOptions: {
                    prettierConfig: { printWidth: 80, singleQuote: false },
                },
                sourceLoaderOptions: {
                    injectStoryParameters: false,
                },
            },
        },
    ],
};
```

Das war auch schon alles. Wenn man alles richtig eingestellt hat, erhält man folgendes Bild:

![Storybook Story Addon](/content/img/1021/storybook-story-addon.png "Storybook Story Addon")

<div class="has-text-right image-subline">Bild 4: Richtig installiert</div>

Ich habe Storybook aufgsetzt und es bei [Github](https://github.com/derKuba/stenciljs-tutorial/tree/main/component-lib) für euch zur Verfügung gestellt. Auschecken, npm install und los geht es.

#### Fazit

Mit der Beantwortung der oberen Fragen, habe ich versucht einen leichten Einstieg in Storybook zu schaffen. Ich habe es in allen professionellen Projekte, an denen ich arbeiten durfte, im Einsatz und möchte es auch nicht missen. Es ist ein sehr gutes Werkzeug.

Ihr habt Fragen oder Anregungen? Schreibt mir bei [Twitter](https://twitter.com/der_kuba).
\
\
Tausend Dank fürs Lesen!

Kuba

\* Die kleinen Gif-Animation wurden mit [Peek erstellt - einem Screen Recorder](https://github.com/phw/peek).
