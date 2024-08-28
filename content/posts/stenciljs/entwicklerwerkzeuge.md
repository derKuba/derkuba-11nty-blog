---
title: "StencilJS-Tutorial: Entwicklungswerkzeuge einrichten"
description: Skripte einrichten
date: 2021-06-04
tags: ["stenciljs"]
layout: layouts/post.njk
---

Nachdem wir das StencilJS-Starter-Projekt aufgesetzt haben, fügen wir jetzt noch die nötigen Entwicklerwerkzeuge und ein CSS-Framework zum Projekt hinzu. Ziel dieser Werkzeuge ist ein einheitlicher und qualitativ-hochwertiger Code. <!-- endOfPreview -->

Die Entwicklungswerkzeuge sind folgende:

1. [Prettier](https://prettier.io/docs/en/install.html)
2. [Eslint](https://eslint.org/docs/user-guide/getting-started)
3. [JEST](https://jestjs.io/)
4. An dieser Stelle steht in meinen Real-Life-Projekten immer [Storybook](https://storybook.js.org/)

Zum installieren folge ich den Anleitungen auf der jeweiligen Seite.

### Prettier

Prettier ist ein Formatierungswerkzeug und sorgt dafür, dass alle Code-Dateien im gleichen Stil geschrieben werden. Auf die Regeln sollte man sich im Team vorher einigen und dann befolgen.

```bash
# Module zu den dev-dependencies hinzufügen
npm install --save-dev --save-exact prettier

# Konfigurationsdatei hinzufügen
echo {}> .prettierrc.json

# Ausnahme-Datei hinzufügen ( es sollen ja nicht alle Dateien analysiert und formattiert werden)
echo node_modules> .prettierignore
```

Damit ist Prettier installiert. Jetzt muss man es noch konfigurieren, d.h. Regeln und Ausnahmen hinzufügen. In die ignore schreibe ich standardmäßig für ein StencilJS-Projekt folgende Ausnahmen:

```bash
node_modules
dist
www
build
public
node_modules
coverage
*.svg

# This file is changed by the stencil compiler
src/components.d.ts
```

Bei [den Konfigurationsregeln](https://prettier.io/docs/en/options.html) gibt es kein richtig oder falsch. Diese sollten individuell diskutiert werden und zum Projektstart aber feststehen. Ich habe mich jetzt für folgende Regeln entschieden:

```bash
{
    "printWidth": 80,
    "useTabs": false,
    "semi": true,
    "tabWidth": 2,
    "singleQuote": false,
    "trailingComma": "all",
    "bracketSpacing": true,
    "arrowParens": "always",
    "jsxSingleQuote": false,
    "jsxBracketSameLine": false
}
```

Die Zeilenlänge habe ich auf 80 Zeichen gesetzt, verwende Leerzeichen statt Tabs, verlange ein Semikolon nach jedem Statement, Tabweite liegt bei 2 Zeichen, verwende " statt ' , etc.

Die Prettier-Konfiguration kann in jeder IDE übernommen werden und dann automatisch beim Speichern ausgeführt werden. Ich mag zusätzlich noch die Option es per NPM auszuführen.

```bash
// package.json

....
scripts: {
...
 "prettier": "prettier --write src",
...
}
```

Wenn ich nun **npm run prettier** in der Konsole ausführe, wird der gesamte Code (ohne die Ausnahmen) analysiert und durch das _--write_-Flag auch korrigiert. ACHTUNG: Es werden mitunter sehr viele Dateien angefasst. Das verfälscht den Merge-Request.

### ESLINT

ESLINT ist ein Werkzeug zur statischen Code-Analyse. Es untersucht neben dem Programmierstil noch die Qualität und gibt sogar Tipps für eine bessere Implementierung. Ein MUSS in jedem Projekt. Es ist komplett Konfigurierbar. Jede Regel lässt sich ein- und ausschalten oder eine Warnung werfen. Zusätzlich kann man sich Regelsätze von anderen Projekten installieren. Ich nehme immer Regelpakete der großen Softwarehäuser wie Google, Microsoft, etc.

```bash
// installieren
npm install eslint --save-dev

// initiieren
npx eslint --init
```

![eslint init](/content/img/stenciljs-tutorial/eslint-init.png "eslint init")<div class="has-text-right image-subline">Bild 1: Eslint Init CLI</div>

Nachdem man diesen Installations-Wizard ausgeführt hat, erscheint eine Konfigurationsdatei **eslintrc.js** im Root des Projekts.

```json
module.exports = {
    "env": { // Wo läuft der Code ? => im browser in ES6+
        "browser": true,
        "es2021": true
    },
    "extends": [ // welches Regelwerk wird verwendet?
        "standard",
        "eslint:recommended"
    ],
    "parser": "@typescript-eslint/parser", // Wir verwenden Typescript!
    "parserOptions": { // Konfigurationen
        "ecmaVersion": 12,
        "sourceType": "module"
    },
    "plugins": [ // Plugins
        "@typescript-eslint"
    ],
    "rules": { // Individuelle Erweiterung der Regeln
    }
};
```

Jetzt fügen wir noch ein Script in die package.json hinzu:

```bash
// package.json

...
scripts: {
    ...
    "eslint": "eslint --ext .tsx --ext .ts src/",
    ...
}
```

Nun kann man ESLINT auf der Konsole laufen lassen: **npm run eslint**. In dieser Konfiguration werden Fehler nur gemeldet. Aber ESLINT kann noch mehr. Es kann auch "einfache" Fehler selber beheben. Dafür fügt man dem oberen Script noch den Parameter "--fix" hinzu. Wie durch Magie sind nun aus 173 Fehlern, nur noch 30 Fehler übrig.

In diesem Zustand kommt es noch zu vielen Warnungen und Fehlern. So sind zb. (sollte man vorher prettier ausgeführt haben) die Anführungszeichen einfach, aber wir haben uns im Projekt auf doppelte geeinigt. Im Moment schreibt Prettier doppelte Semikola und ESLINT überschreibt sie mit einfachen. Jetzt muss man beide Werkzeuge verbinden.
Die Lösung lautet ["eslint-plugin-prettier"](https://github.com/prettier/eslint-plugin-prettier).

Dazu müssen wir folgendes ausführen, bzw. in die .eslintrc.js-Config schreiben:

```bash
npm install --save-dev eslint-config-prettier
npm install --save-dev eslint-plugin-prettier

// .eslintrc.js
...
    "extends": [
        "standard",
        "eslint:recommended",
        "plugin:prettier/recommended"
    ],
...

```
Wenn man nun **npm run eslint** ausführt, folgt der Linter den in Prettier definierten Regeln. Die Semikola bleiben doppelt.

Im aktuellen Setup treten aber noch Fehler, die in Verbindung mit dem Testframework JEST und JSX stehen, auf. Der Linter sagt, dass er weder *it*, noch *describe* kennt und auch ein 'h' nicht definiert ist. Ersteres löst man, in dem an in der *.eslintrc.js* in das *"env"* Property ein **"jest": true** ergänzt.

Da dieses Projekt auf StencilJS setzt habe ich noch die [empfohlenen StencilJS-Regeln](https://github.com/ionic-team/stencil-eslint) hinzugefügt.

```
npm i eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react @stencil/eslint-plugin --save-dev

// Ergänzung in der .eslintrc.js
{
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "extends": [
    "plugin:@stencil/recommended"
  ]
}
```

### JEST
Für die Unit-Tests, aber auch für die E2E Tests empfehle ich JEST. Ich benutze es seit 2016. Es hat alles was man sich wünscht. Man arbeitet sich sehr schnell ein. Die Verwendung von Mocks, Spys, Stubs war nie einfacher. Die Syntax ist angelehnt an JasmineJS.

Um es in diesem Projekt zu Starten muss man lediglich "npm run test" ausführen. Es würde alle Tests, die am Dateinamen ein *.spec.* oder *.e2e.* haben ausgeführt. Da ich kein großer Fan der StencilJS E2E Tests bin, aber ich das Flag "--e2e" aus dem Skript in der package.json entfernt.

Beim initialen Start verlangt NPM noch das nachinstallieren gewisser Module. In meinem Fall:

```
[ ERROR ]  Please install missing dev dependencies with either npm or yarn.
npm install --save-dev @types/jest@26.0.21 jest@26.6.3 jest-cli@26.6.3 @types/puppeteer@5.4.3
puppeteer@5.5.0
```

Die Lösung für das Problem steht direkt dabei. Nachdem man die Module installiert hat, und nochmal *npm run test* ausgeführt hat, sollte folgende Erfolgsmeldung erscheinen:

```
Test Suites: 4 passed, 4 total
Tests:       11 passed, 11 total
Snapshots:   0 total
Time:        2.099 s
```

Das wären alle meine empfohlenen Werkzeuge zum Start des Projektes. Natürlich lassen diese sich nachträglich in bestehende Projekte einbauen. Der initiale Aufwand sollte beim Starten eines neuen Projektes auf keinen Fall umgangen werden. Ich habe diese Tools bei Kunden in bestehende Projekte eingebaut und durfte dann erstmal 12000 Fehler beheben, was ein immenser Aufwand ist. Von nicht vorhandenen Tests möchte ich erst gar nicht anfangen. Viele Projekte mussten wegen fehlender Tests neugestartet werden.

Im nächsten Artikel geht es aber dann endlich mit der eigentlichen Entwicklung los.

Der Code hierzu liegt auf [Github](https://github.com/derKuba/stenciljs-tutorial). Um es auf diesen Stand zu bringen, müsst ihr das Projekt klonen und einmal auf den Tag 0.9.1 auschecken:

Ihr habt Fragen oder Anregungen? Schreibt mir bei [Twitter](https://twitter.com/der_kuba).
\
\
Tausend Dank fürs Lesen!

Kuba
