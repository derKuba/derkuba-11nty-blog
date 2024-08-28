---
title: "Jest Testing Setup für Typescript"
description: Die ersten Schritte bis zum ersten Tests
date: 2022-11-14
tags: ["test", "typescript"]
layout: layouts/post.njk
---

Meine Erfahrung der letzten Jahre zeigt, dass die größte Hürde beim Schreiben von Tests das Testingframework und das Setup sind. Die Clients der drei großen Frameworks React, Vue und Angular liefern diese defaultmäßig aus. In diesem Artikel zeige ich wie man sich ganz einfach und schnell ein [Jest-Setup](https://jestjs.io/) mit Typescript aufsetzt. Anschließend zeige ich auch einige Tests. <!-- endOfPreview -->

### Projekt aufsetzen

Zuerst benötigen wir einen neuen Ordner und ein NPM-Projekt:

```bash
mkdir fun-with-testing
cd fun-with-testing/

// -y bedeutet, dass wir alles bejaen, was der kleine Wizard uns vorschlägt
npm -y init
```

Damit hat unser Projektordner eine _*package.json*_, die so aussieht:

```json
{
    "name": "fun-with-testing",
    "version": "1.0.0",
    "description": "",
    "main": "index.js",
    "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1"
    },
    "keywords": [],
    "author": "",
    "license": "ISC"
}
```

Die Anforderungen an dieses Testprojekt:

-   Typescript Code
-   lauffähig über nodeJS
-   web-technologien werden nicht benötigt

#### TS-NODE

Man könnte jetzt das typescript-Paket installieren, Webpack, Babel und Komplizen. Wir nehmen aber eine Abkürzung über das [ts-node](https://typestrong.org/ts-node/)-Paket. ts-node kann typescript direkt ausführen und das ist genau das was wir an dieser stelle brauchen. Fügen wir nun das Paket als development dependencie hinzu:

```bash
npm i -D ts-node
```

Um zu testen ob es funktioniert legen wir unter /src eine _hello.ts_ an mit folgendem Inhalt:

```ts
// src/hello.ts
const sayHello = (name: string) => `Hello ${name}!`;
const greeting = sayHello("Kuba");
console.log(greeting);
```

Zum Ausführen gibts jetzt wieder viele Weg:

Man könnte das _ts-node_-Paket global installieren und direkt ausführen:

```bash
// i would not do this, but you can :-)
npm install -g ts-node

ts-node src/hello.ts
```

Man kann es aus den _node_modules_ heraus ausführen:

```bash
./node_modules/.bin/ts-node src/hello.ts
```

Oder eben den [npx](https://typestrong.org/ts-node/)-Shortcut verwenden. NPX schaut in dem node_modules/.bin Order nach oder versucht das benötigte Paket nachzuinstallieren:

```
npx ts-node src/hello.ts

> Hello Kuba!
```

#### TS-JEST

Für Jest gilt das gleiche wie für nodeJS. Man könnte jetzt aufwendig JEST mit Babel, Webpack, etc. aufsetzen und JEST beibringen TypeScript zu verstehen. Oder man verwendet einfach das [ts-jest](https://www.npmjs.com/package/ts-jest)-Paket. Das erledigt das ganze mühsame konfigurieren für uns.

```bash
npm i -D ts-jest
```

Zum Testen der Installation fertigen wir noch schnell einen Test an:

```ts
// _src/hello.test.ts_
import { sayHello } from "./hello";

describe("SayHello", () => {
    it("should say hello", () => {
        expect(sayHello("Kuba")).toBe("Hello Kuba!");
    });
});
```

Danach muss noch jest in die _package.json_ als Skript eingetragen werden:

```ts
// package.json

// aus:

  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },

// machen wir

  "scripts": {
    "test": "jest"
  },

```

Ausführen:

```bash

npm run test
```

Leider führt dies zu einem Fehler:

```bash

    Jest encountered an unexpected token

    Jest failed to parse a file. This happens e.g. when your code or its dependencies use non-standard JavaScript syntax, or when Jest is not configured to support such syntax.

    Out of the box Jest supports Babel, which will be used to transform your files into valid JS based on your Babel configuration.

    By default "node_modules" folder is ignored by transformers.
```

Es fehlt noch die Jest-Config und eine Einstellung, die Jest erklärt wie es mit TypeScript umgehen soll:

```
// anlegen einer jest.config.js

npx ts-jest config:init
```

```ts
// jest.config.js
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",

    // das hier ist einzufügen
    transform: {
        // "^.+\\.jsx?$": require.resolve("babel-jest"),
        "^.+\\.tsx?$": "ts-jest",
    },
};
```

Mit dem Transform-Key wird Jest erklärt, dass alle .ts und .tsx ( sollte man JSX verwenden wollen -> ja, ich weiß, oben steht kein Web-Bezug als Anforderung #yagni :-) )

Nochmal ausführen und genießen:

```bash
npm run test

> fun-with-testing@1.0.0 test
> jest

  console.log
    Hello Kuba!

      at Object.<anonymous> (src/hello.ts:3:9)

 PASS  src/hello.test.ts
  SayHello
    ✓ should say hello (1 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        1.118 s
Ran all test suites.
```

Damit existiert jetzt das Basis-Setup und wir können mit dem Testen starten.

Der Code hierzu liegt auf [Github](https://github.com/derKuba/fun-with-jest/tags). Um es auf diesen Stand zu bringen, müsst ihr das Projekt klonen und das Tag "0.0.9" auschecken.

Ihr habt Fragen oder Anregungen? Schreibt mir bei [Twitter](https://twitter.com/der_kuba).
\
\
Tausend Dank fürs Lesen!

Kuba
