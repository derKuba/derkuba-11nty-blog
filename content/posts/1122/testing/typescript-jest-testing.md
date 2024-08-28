---
title: "Jest Testing mit Typescript: Das kleine Einmaleins"
description: Die ersten Tests
date: 2022-11-21
tags: ["test", "typescript"]
layout: layouts/post.njk
---

Dieser Artikel schließt an den vorherigen Artikel an. Nachdem ein lauffähiges Test-Setup erarbeitet wurde, folgen in diesem Tutorial weitere Testfälle. <!-- endOfPreview -->

### Zusätzliche Einstellungen

#### Fehlende Types

Bevor es mit der eigentlichen Implementierung los geht, werden noch ein paar Konfigurationen am aktuellen Setup vorgenommen. Damit der Compiler aufhört zu meckern werden für _Jest_ noch die Types installiert:

```bash
npm i -D @types/jest
```

#### Coverage

Damit man sieht wie viel Code getestet wurde, wird noch die Code-Coverage ausgegeben.
Dafür muss die _jest.config.js_ um einige Zeilen erweitert werden:

```json
// jest.config.js
    ...
    coverageDirectory: "coverage",
    coverageReporters: [
    "json",
    "text",
    "html"
    ],
```

Es werden die Speicherort und die Darstellungsart der Coverage eingestellt. _json_ erzeugt eine Json-Datei ( es lohnt nicht wirklich ein Blick da rein). _text_ gibt die Coverage auf der Konsole aus und _html_ zaubert eine sehr empfehlenswerte und übersichtliche Webseite.

Um die Generierung anzustoßen wird noch die _package.json_ um ein keines Skript erweitert:

```json
 "scripts": {
    "test": "jest",
    "test:coverage": "jest --coverage"
  },
```

Führt man es aus, erscheint ein Ordner _coverage_.

```bash
npm run test:coverage
```

#### Testfälle

Damit es was zum Testen gibt, wird eine kleine Klasse geschrieben. Anhand dieser Klasse zeige ich einige Testfälle:

-   Umgang mit externen Libs
-   API-Aufruf
-   Rendern von HTML
-   Testen mit einer Schleife

Damit wird die Grundlagen für sehr viele Tests erlernt.

##### Externe libs

Als externe Bibliotheken werden [node-fetch](https://github.com/node-fetch/node-fetch) und [UUID](https://github.com/uuidjs/uuid#readme) verwendet. Ersteres ist eine HTTP-Client Bibliothek und zweiteres ein Tool, um eine eindeutige ID zu generieren.

```bash
npm i -D node-fetch uuiid

// zusätzlich noch ein paar passende Types:
npm install --save-dev @types/node-fetch@2.x
```

<br/>

#### Implementierung

##### Die Klassenhülle

Die zu testende Logik wird in eine Klasse gepackt:

```ts
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

class Fun {
    private id: string = "";
    constructor() {
        const random = Math.floor(Math.random() * 100);
        this.id = random % 2 === 1 ? "odd" : "even";
    }
}
```

Die Datei _fun.ts_ importiert die zwei zuvor beschriebenen Bibliotheken. Die Klasse heißt _Fun_ und besitzt ein Attribut _id_. Dieses Attribut wird im Konstruktor nach dem Zufallsprinzip mit den Zeichenketten _odd_ oder _even_ befüllt. Es dient als Beispiel zum Testen, wenn man keinen Einfluss auf den Inhalt hat.

#### Die Methoden

Es folgen nun einige einfache Methoden.

Es wird das Attribut _ID_ ausgegeben:

```ts
printId() {
  return this.id;
}
```

Mithilfe der Bibliothek _uuid_ wird eine zufällige UUID erzeugt:

```ts
createUUID() {
  return `kuba_${uuidv4()}`;
}
```

Das Summieren zweier Zahlen wird abgebildet:

```ts
sum(a: number, b: number) {
  return a + b;
}
```

Es wird eine lange Zeichenkette zurückgegeben und simuliert das Erzeugen von HTML:

```ts
renderHTML({ title, name }: { title: string; name: string }) {
  return `
          <html>
              <head>
                  <title>${title}</title>
              </head>
              <body>
                  Hello ${name}
              </body>
          </html>
      `;
}
```

Ein API-Call wird ausgeführt. Als URL habe ich mich aus einer langen Liste von freien [APIs](https://mixedanalytics.com/blog/list-actually-free-open-no-auth-needed-apis/) bedient. Es spielt auch keine Rolle was zurückgegeben wird. In einem Unit-Test sollte man vermeiden irgendwelche Requests abzusetzen!

```ts
async fetchCharacter() {
  return await axios.get(`https://randomuser.me/api/`);
}
```

Zu guter Letzt muss die Klasse noch exportiert werden:

```ts
export default Fun;
```

#### Fertige Klasse

```ts
import { v4 as uuidv4 } from "uuid";

import fetch from "node-fetch";

class Fun {
    private id: string = "";
    constructor() {
        const random = Math.floor(Math.random() * 100);
        this.id = random % 2 === 1 ? "odd" : "even";
    }

    printId() {
        return this.id;
    }

    createUUID() {
        return `kuba_${uuidv4()}`;
    }

    sum(a: number, b: number) {
        return a + b;
    }

    renderHTML({ title, name }: { title: string; name: string }) {
        return `
            <html>
                <head>
                    <title>${title}</title>
                </head>
                <body>
                    Hello ${name}
                </body>
            </html>
        `;
    }

    async fetchCharacter() {
        const response = await fetch(`https://randomuser.me/api/`, {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        });

        if (response.ok) {
            return await response.json();
        }

        return null;
    }
}

export default Fun;
```

Um die einzelnen Methoden mal auszuprobieren, habe ich noch eine kleine Ausführungsmain-Datei erstellt:

```ts
import Fun from "./fun";

const main = async () => {
    const fun = new Fun();

    console.log(fun.printId());
    console.log(fun.createUUID());
    console.log(fun.sum(1, 2));
    console.log(fun.renderHTML({ title: "Hello World", name: "Der Kuba" }));
    console.log(await fun.fetchCharacter());
};

main();
```

### TESTS

Die Datei _fun.test.ts_ enthält den üblichen bdd-Testskeleton:

```ts
import Fun from "./fun";

describe("Fun", () => {
    // für jeden Tests gibts immer eine neue und saubere Instanz der Klasse
    let fun;
    beforeEach(() => {
        fun = new Fun();
    });
});
```

<br/>

#### Test printId

```ts
it("should printId", () => {
    const expected = ["odd", "even"];
    expect(expected).toContain(fun.printId());
});
```

Die ID der Klasse wird per Zufall gesetzt und besteht aus einem von zwei Werten. Es wird ein Array erstellt, das aus den beiden möglichen Werten enthält. Im Test überprüfe ich anhand der Methode _toContain_ den Inhalt des Arrays. Achtung. Das ist nur eine simple Möglichkeit. Eine weitere wäre _Math.random_ zu überschreiben und jeweils die ID zu testen. Wie man solche Funktionen mockt, zeige ich weiter unten.

<br/>

#### Test sum

```ts
test.each([
    [1, 1, 2],
    [1, 2, 3],
    [2, 1, 3],
])(".add(%i, %i)", (a, b, expected) => {
    expect(fun.sum(a, b)).toBe(expected);
});
```

Das Produkt zweier Zahlen zu testen ist nicht mit einem Aufruf getan. Oftmals möchte man Randbereiche und andere Extremen testen (Ja, ich habe es nicht getan :-) ). Man könnte den _it_-Block in eine Schleife setzen und so verschiedene Kombinationen testen. _Jest_ bietet zum Glück einen eigenen Mechanismus dafür: _it.each_. Es wird zweidimensionales Array übergeben und dann werden die Variablen _a_, _b_ und expected auf die Werte innerhalb des Array gemapped:

Testdurchlauf 1 mappt:
a: [0][0]
b: [0][1]
expected: [0][2]

Testdurchlauf 2 mappt:
a: [1][0]
b: [1][1]
expected: [1][2]

....

Alternativ kann man direkt die Variablen zuweisen:

```ts
test.each([
    { a: 1, b: 1, expected: 2 },
    { a: 1, b: 2, expected: 3 },
    { a: 2, b: 1, expected: 3 },
])(".add($a, $b)", ({ a, b, expected }) => {
    expect(a + b).toBe(expected);
});
```

Oder man übergibt eine Template-String-Tabelle:

```ts
test.each`
    a    | b    | expected
    ${1} | ${1} | ${2}
    ${1} | ${2} | ${3}
    ${2} | ${1} | ${3}
`("returns $expected when $a is added $b", ({ a, b, expected }) => {
    expect(a + b).toBe(expected);
});
```

<br/>

#### Test renderHTML

```ts
// bevor der Test jemals ausgeführt wurde
it("should make a snapshot of renderHTML", () => {
    expect(
        fun.renderHTML({ title: "Jest", name: "jacob" })
    ).toMatchInlineSnapshot();
});
```

Um einen Zustand von HTML zu speichern, bietet _Jest_ mehrere Möglichkeiten. Man könnte _toBe_ verwenden und dann hart HTML als String vergleichen. Aber es gibt auch eine galantere Alternative. Im Werkzeugkasten von _Jest_ liegen noch _toMatchInlineSnapshot_ und _toSnapshot_. Aber warum möchte man das überhaupt tun?
Die drei beliebten Frameworks wie _Angular_, _React_ oder _Vue_ erzeugen HTML und manipulieren es auch. Wie teste man nun eine Methode, die z.B. einen Wert ändert oder vielleicht einen ganzen Block austauscht. Zu _jQuery_-Zeiten hat man den gewünschten Zustand einmal hergestellt, kopiert und dann im Test verglichen. Teilweise musste man die gewünschten Knoten im HTML-Baum ansteuern und die Werte jeweils überprüfen. Man schreibt viel Code, für wenig Testinhalt.
_Jest_ bietet die Möglichkeit das gewünschte Abbild zu speichern. Einmal kann man es statisch im Code über _toMatchInlineSnapshot_ und einmal gibt es die Möglichkeit den Zustand in eine Datei zu speichern, in _git_ einzuchecken und dann beim nächsten Aufruf als Vergleichsreferenz zu verwenden. Man wird über eine Änderung des HTMLs via scheiternden Tests informiert und kann dann, sollte die Änderung gewünscht sein, einfach den Inhalt überschreiben.

Im oberen Test mit _toMatchInlineSnapshot_ wird zunächst parameterlos gestartet. Nachdem man den Test einmal ausgeführt hat, schreibt _Jest_ den Inhalt als Parameter hin zu.

```html
// nach dem ersten Aufruf it("should make a snapshot of renderHTML", () => {
expect(fun.renderHTML({ title: "Jest", name: "jacob" }))
.toMatchInlineSnapshot(` "
<html>
    <head>
        <title>Jest</title>
    </head>
    <body>
        Hello jacob
    </body>
</html>
"`); });
```

Beim zweiten Aufruf gibt es nun auch das statische HTML. Jetzt kann natürlich das HTML beliebig groß sein und die Testdatei unnötig aufblähen. Dann wählt man _.toMatchSnapshot_ und es wird in eine eigene Datei ausgelagert:

```ts
// bevor der Test jemals ausgeführt wurde
it("should make a snapshot of renderHTML", () => {
    expect(fun.renderHTML({ title: "Jest", name: "jacob" })).toMatchSnapshot();
});
```

<br/>

#### Test createUUID

```ts
it("should create a uuid", async () => {
    const uuid = fun.createUUID();
    expect(uuid).toBe("kuba_42");
});
```

Dieser Tests sieht sehr simpel aus und ist es natürlich auch. Allerdings macht dies nur etwas Vorarbeit möglich. Im oberen Teil der Datei verbirgt sich noch etwas Code:

```ts
jest.mock("uuid", () => {
  const originalModule = jest.requireActual("uuid");
  return {
    __esModule: true,
    ...originalModule,

    v4: () => "42",
  };
});

import Fun from "./fun";
describe("Fun", () => {....

```

Hier geschieht die eigentliche Magie. Mithilfe von _jest.mock_ wird der Import des _uuid_-Moduls "gemockt". Mocken heißt in diesem Kontext, das Überschreiben des Moduls, bzw. das Vorgaukeln einer anderen Implementierung. Man macht das weil man getrennt von der Logik des importierten Moduls losgelöst seine eigene Unit testen möchte. Der Code holt sich die restliche Implementierung des Moduls und überschreibt nur die Erzeugung der UUID. Die neue Implementierung liefert nun immer die Antwort auf alles: 42.

Alternativ könnte man natürlich eine UUID erzeugen und dann quasi die Bibliothek testen. Dafür hat _Jest_ einen Regex-Matcher im Angebot:

```ts
xit("should create a uuid", async () => {
    const uuid = fun.createUUID();
    expect(uuid.replace("kuba_", "")).toMatch(
        /\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/
    );
});
```

Für die Ausführung muss man noch das X in _xit_ entfernen, da der Test deaktiviert ist.

#### Test fetchCharacter

```ts
it("should send a request", async () => {
    const character = await fun.fetchCharacter();
    expect(character).toBe("kuba");
});
```

Wie der vorherige Test ist dieser wieder sehr simpel. Natürlich geht das auch wieder nur durch Vorarbeit im oberen Teil der Testdatei:

```ts
const myPromise = new Promise((resolve, reject) => {
    resolve("kuba");
});

jest.mock("node-fetch", () => {
    const originalModule = jest.requireActual("uuid");
    return {
        __esModule: true,
        ...originalModule,
        default: () => ({
            ok: true,
            json: () => myPromise,
        }),
    };
});
```

Zunächst erzeugen wir ein simples _Promise_, das den String _"kuba"_ zurückliefert. Im nächsten Block wird die _node-fetch_-Bibliothek gemockt und der Aufruf von _fetch_ überschrieben. Es liefert nun die für die Implementierung benötigten Werte _ok_ und _json()_. Da der Wert nun fest gesetzt ist, kann dieser Überprüft werden.

### Fazit

Damit haben wir nun die Fähigkeiten erlangt sehr viele Testfälle zu testen und einem Einstieg in das Reich der Test-Coverage steht nichts mehr im weg. Natürlich gibt es noch viele weitere Möglichkeiten Tests zu schreiben.

Bei weiterem Interesse zum Thema Testing empfehle ich meine Artikel vom letzten Jahr:

https://derkuba.de/tags/jest/
https://derkuba.de/content/posts/stenciljs/address-app-e2e/

Der Code hierzu liegt auf [Github](https://github.com/derKuba/fun-with-jest).

Ihr habt Fragen oder Anregungen? Schreibt mir bei [Twitter](https://twitter.com/der_kuba).
\
\
Tausend Dank fürs Lesen!

Kuba
