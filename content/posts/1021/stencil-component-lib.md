---
title: Component Library mit Storybook und StencilJS
description: Wie teilt man wiederverwendbare Komponenten
date: 2021-10-08
tags: ["stenciljs", "storybook"]
layout: layouts/post.njk
---

Heute zeige ich wie man mit Hilfe von StencilJS und [Storybook](https://storybook.js.org/) eine wiederverwendbare Komponenten-Bibliothek aufbaut, die aus Web-Components besteht. Im ersten Teil setzen wir das Projekt auf und verbinden die StencilJS mit Storybook. Im nächsten Teil zeige ich dann wie man die Webcomponents installiert und benutzt. <!-- endOfPreview -->

Zunächst klären wir was Storybook ist. Es beschreibt sich selbst als Entwicklungsumgebung für UI-Komponenten (_Storybook is a development environment for UI components_). Genauso würde ich es auch beschreiben. Es ist ein Framework, das einen Rahmen um deine Komponenten legt. Es hilft bei der Darstellung oder Katalogisierung, Entwicklung, Dokumentation und sogar beim Testen. Ich habe 2017 einige Alternativen ausprobiert, die es mittlerweile nicht mehr gibt. Aber Storybook hatte die besten Features. Es ist schnell aufgesetzt und konfiguriert. Um einen ersten Eindruck von den Fähigkeiten zu erhalten, empfehle ich [die offizielle Storybook Komponentenbibliothek](https://next--storybookjs.netlify.app/official-storybook/?path=/story/addons-a11y-basebutton--default).

Genug geredet. Hands on!

#### Vorgehen

1. Installation StencilJS
2. Installation Storybook
3. Verdrahtung und Stories

#### Installation StencilJS Projekt

Für die Installation habe ich [mein eigenes Tutorial genutzt](https://derkuba.de/content/posts/stenciljs/projekt-aufsetzen/).

```bash
npm init stencil

# wir wählen die dritte Option:
component     Collection of web components
              that can be used anywhere

Pick a starter › component
✔ Project name › comp-lib

✔ All setup  in 21 ms

cd comp-lib
npm install

# stencil starten für die Hello-World Anwendung
npm run start
```

#### Installation Storybook

Wir wählen als Projektgrundlage die Entwicklung von Komponenten (3. Option), vergeben einen Namen "comp-lib", bestätigen, gehen in den Ordner und installieren die Abhängigkeiten:

Genau in diesen Ordner installieren wir auch Storybook.

```bash
npx sb init

? Do you want to manually choose a Storybook project type to install? Y
? Please choose a project type from the following list:
    ember
    web_components
    mithril
    marionette
    marko
❯   html <-------
    riot
    preact
    svelte
  ↓ rax

```

Wir wählen die manuelle Auswahl, um den Projekttyp zu bestimmen. Storybook kennt StencilJS nicht. Wer dasselbe mit einem React-Projekt ausführt, bekommt alles automatisch erstellt.
Wir wählen deswegen HTML als Projekttyp. Wenn man versehentlich _web-components_ auswählt, läuft in einen Dependency-Fehler _storybook Module not found: Error: Can't resolve 'lit-html' mit web components_ und muss erneut den Wizard ausführen. Anschließend lädt der Wizard das halbe Internet herunter. Anschließend lässt sich Storybook starten:

```bash
npm run storybook

╭─────────────────────────────────────────────────────╮
│                                                     │
│   Storybook 6.3.10 started                          │
│   5.46 s for preview                                │
│                                                     │
│    Local:            http://localhost:6006/         │
│    On your network:  http://192.168.178.48:6006/    │
│                                                     │
╰─────────────────────────────────────────────────────╯
```

Ruft man die URL im Browser auf sieht man dies:

![Storybook Start](/content/img/1021/storybook.png "Storybook")<div class="has-text-right image-subline">Bild 1: Aufruf http://localhost:6006</div>

Man bekommt diese Oberfläche geschenkt. Sie ist übersichtlich aufgebaut. Im linken Bereich sieht man die angelegten Komponenten. Button, Header und Page kommen aus dem Storybook-Starter. Es befindet sich eine Suche oben links, die die bestehenden Komponenten filtert. Rechts sieht man dann die Komponenten. Unter Canvas ist die gerenderte Komponente. Unter Docs kann man zusätzliche Informationen sehen, die man selber anlegen kann. Die restlichen Icons dienen der Veränderung der Darstellung. Bitte einmal alles an- und durchklickern.

#### Verdrahtung

Da wir jetzt beide Applikation installiert haben und starten können, wollen wir diese beiden jetzt verbinden. Ich stelle mir folgenden Entwicklungsablauf vor.

1. Erstellen/Verändern einer StencilJS Komponente
2. Building-Process
3. Aktualisierung in Storybook ohne Neustart

Ich habe noch nichts über die angelegten Dateien erzählt. Man findet sich im StencilJS-Projekt zurecht. Storybook legt zwei wesentliche Ordner an:

-   _.storybook_ => enthält die Konfiguration
-   _src/stories_ => enthält das Beispielskeleton (lösche ich direkt)

Für den ersten Punkt müssen wir nichts tun. Es ist bereits eine Beispielkomponente vorhanden. Der zweite Schritt erfolgt über den bereits angelegten Befehl:

```bash
// inital einmal
npm run build
```

Es gibt auch einen Befehl, der die Dateien von StencilJS bewacht und automatisch bauen lässt. Aber diesen habe ich etwas abgeändert, weil der Parameter _--dev_ keine Dateien anlegt.

```bash
  "dev:stencil": "stencil build --watch",
```

Parallel dazu gibt es den Befehl um Storybook zu starten:

```bash
  "storybook": "start-storybook -p 6006",
```

Jetzt müsste man zwei Konsolen öffnen, in den Ordner navigieren und beide Befehle parallel ausführen. Achtung. Es muss mindestens vorher einmal _npm run build_ ausgeführt werden, sonst kommt es zu einem Fehler, da eine Dateistruktur erwartet wird, die initial nicht vorhanden ist.
Da dies aber kein pragmatischer Weg ist, empfehle ich folgendes Paket zu installieren: **npm-run-all**. Mit diesem kleinen Tool, kann man zwei Befehle parallel ausführen.

```bash
    // run-p ist nur ein shortcut
    "dev": "run-p dev:stencil storybook",
```

Über **npm run dev** haben wir jetzt genau das, was wir haben wollten. Wir könnten jetzt bequem mit der Arbeit starten und Komponenten schreiben. Aber eine Kleinigkeit fehlt noch. Wir müssen die gebauten Web-Components mit Storybook bekannt machen. Dazu öffnen wir die date _.storybook/preview.js_ und ergänzen das Initialskript:

```js
import { defineCustomElements } from "../dist/esm/loader";

defineCustomElements();
```

Damit haben wir jetzt auch die Frameworks verheiratet.

Damit Storybook die Komponenten findet, benötigen wir Stories. Eine Story ist eine Datei, die man neben seine Komponente legt. In dieser hat man die Möglichkeit die Komponente mit dynamischen Eingaben/Properties zu füttern und diese noch zu Dokumentieren. Nehmen wir die bestehende _my-component_ und versuchen diese in Storybook darzustellen.
Dazu legen wir die Story-Datei an mit der Namenskonvention _-stories.tsx_.

```ts
// my-component.stories.tsx
export default {
    title: "Content/My-Component",
    parameters: {},
    argTypes: {},
};

const Template = (args) =>
    `<my-component first="Max" middle="Wolfgang" last="Muster"></my-component>`;
export const MyComponent = Template.bind({});
```

Diese kleine Code-Snippet sorgt dafür, dass Storybook dies einsammelt und uns eine Seite erstellt.

Im nächsten Artikel zeige ich wie man die Properties dynamisch erzeugt, weitere Punkte dokumentieren kann und auch die gebauten Web-Components in einem eigenen, weiteren Projekt verwenden kann.

\
Der Code hierzu liegt auf [Github](https://github.com/derKuba/stenciljs-tutorial/tree/main/component-lib).

Ihr habt Fragen oder Anregungen? Schreibt mir bei [Twitter](https://twitter.com/der_kuba).

\
Tausend Dank fürs Lesen!

Kuba
