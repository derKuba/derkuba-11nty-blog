---
title: "StencilJS-Tutorial: JEST"
description: Unit Testing Einführung
date: 2021-08-14
tags: ["stenciljs", "testing"]
layout: layouts/post.njk
---

[Jest ist DAS Javascript Testing-Framework](https://jestjs.io/). Wenn man mit Javascript/Typescript arbeitet, kommt man an diesem Schweizer-Taschenmesser des Testens nicht vorbei. Ich bin ein riesen Fan seitdem wir uns 2016 das erste mal begegnet sind. Ich habe davor mit diversen Test-Framework gearbeitet.<!-- endOfPreview --> Dazu zählen:

-   [Mocha](https://mochajs.org/),
-   [Jasmine](https://jasmine.github.io/),
-   [Karma](https://karma-runner.github.io/latest/index.html),
-   [Sinon](https://sinonjs.org/),
-   [Chai](https://www.chaijs.com/),

Die Entwickler bei Facebook, die Jest entwickelt haben, haben sich all diese Frameworks angeschaut. Sie haben die Essenz des jeweiligen Frameworks verstanden und es in ein eigenes Framework gepackt. Jest hat das Look and Feel von Jasmine, einen Runner wie Karma, Mock- und Spy-Mechanismen wie Sinon und ist so stabil wie Mocha. Vor Jest hat man vor jedem Projektstart erstmal kompliziert die verschiedenen Testframeworks gemischt, und konfiguriert. Das ist jetzt alles Geschichte. Jest ist in sekundenschnelle installiert und läuft sofort los. In Vorbereitung auf diesen Artikel habe ich das [Github-Repo](https://github.com/facebook/jest) von Jest durchwühlt. Der erste Commit war am 14.05.2014 mit dem Titel "FIRST!". Das erste Release ging mit der Version 0.4.0 einen Jahr später am 19.02.2015 an den Start. Seitdem hat es sich stetig weiterentwickelt. Stand heute befindet sich Jest bei Version 27.0.
Ein besonderes Merkmal ist die Vielseitigkeit. Nicht nur, dass es all die Features der aufgelisteten Frameworks vereint, es ist auch mit den großen Web-Frameworks wie React, Angular, Vue, Svelte, StencilJS, Express, Playwright etc. kompatibel. Es führt einfach kein Weg an Jest vorbei :-)

\
Testen von, durch und mit Javascript ist ein Thema, das jedem Web-Entwickler bekannt sein muss. In allen meinen Bewerbungsgesprächen habe ich danach gefragt. Sei es als Kandidat oder als Interviewer. Schockierend waren dabei immer die Ausreden, warum nicht getestet wurde. Dies hier sind meine drei Top Ausreden, bzw. Selbstlügen:

1. Keine Zeit
2. Machen wir später
3. Zeitverschwendung (Kosten-Nutzen-Abwägung)

Test-Schreiben bedeutet, dass man Code schreiben muss. Das dauert natürlich. Aber man erkauft sich dadurch Sicherheit, Wartbarkeit und die Möglichkeit für Refactorings. Tests haben mich bereits unzählige Male gerettet, weil sie Fehler sofort sichtbar machen. Ich war einmal in einem Projekt, das schon über ein Jahr lief und der Code bereits über 100.000 Zeilen gewachsen war. Keine Zeile war getestet. Eine Einarbeitung war nicht möglich, da keine Dokumentation vorhanden war. Also blieb uns nur das Wegschmeißen und ein Neustart.

Ich kann nachvollziehen, dass das Einarbeiten in eine neue Technologie manchen Angst macht. Es benötigt etwas Zeit und Fleiß. Aber ich möchte an dieser Stelle helfen einen Einstieg zu bekommen.

#### Genug geredet, Hands on

**Installieren**

```js
npm install --save-dev jest

// aus den Node-Modules heraus starten
./node_modules/.bin/jest --init
```

Der zweite Befehlt startet einen Installations-Wizard, der die Konfiguration übernimmt. Am Ende entsteht eine Jest-Config-Datei **jest.config.js**.

**Erster Test**

```
// index.spec.ts
describe("My first test", () => {
    test("is really", () => {
        expect(true).toBe(true);
    });

    it("should be true", () => {
        expect(true).toBe(true);
    });
});
```

Die Tests von Jest sind BDD (Behaviour Driven) aufgebaut. Man beschreibt Was passiert und welches Verhalten man sich "erhofft". Der Code muss in eine Datei, die ein **.spec.** oder ein .**test.** im Dateinamen stehen hat.
Der _describe_ Block beschreibt das WAS (Modul, Komponente, Script). Dieses lässt sich beliebig Schachteln und so Subkomponenten, oder Subtests abbilden. Das Schlüsselwort _test_ oder alternativ _it_ beschreibt den eigentlichen Test. Für die Übersicht sollte man genau immer nur eine Sache, Funktion, Verhalten, etc. testen. Zum Einstieg haben ich keinen Code getestet. Der _expect_-Block beinhaltet den eigentlichen Vergleich. Dieser Block sagt dem Test, ob es erfolgreich war oder gescheitert ist. Der Parameter für den _expect_-Block bekommt einen Wert und muss dann durch eine Funktion verglichen werden. Konkret in diesem Beispiel durch _.toBe()_. Es gibt eine ganze Palette an [Vergleichfunktionen](https://jestjs.io/docs/expect). So gibts es z.B. _.toEqual()_, ._toBeFalsy_ oder _.toBeNull()_.

Führt man diesen Code nun aus, erhält man folgendes Bild:

```js
// über das package.json script
npm run test

// oder
npm test
```

![jest in console](/content/img/stenciljs-tutorial/jest-first.png "Erster Jest-Test")<div class="has-text-right image-subline">Bild 1: npm run test</div>

Man findet die Beschreibung des Tests und des Verhaltens. Der grüne Pfeil zeigt, dass alles durchgelaufen ist und das Verhalten stimmt. Zusätzlich gibt es eine sogenante _Code-Coverage_, die eine Statistik darstellt, welche Zeilen des zu testenden Codes durchlaufen und getestet wurden. Da wir keinen Code ausgeführt haben, steht überall eine 0.

In der Realität werden nicht immer alle Tests durchlaufen. Fügen wir nun einen _failenden_ Tests hinzu und führen diesen aus:

```js
it("should be false", () => {
    expect(true).toBe(false);
});
```

![jest in console](/content/img/stenciljs-tutorial/jest-fail.png "Erster Jest-Test")<div class="has-text-right image-subline">Bild 2: failed</div>

Hier sehen wir nun, dass wir zwei erfolgreiche und einen fehlenden Test haben. In einer [CI/CD-Pipeline](https://de.wikipedia.org/wiki/Kontinuierliche_Integration) würde der Build nun scheitern und die Entwickler würden benachrichtigt werden.

**Echter Code**
Wir bauen einen kleinen Taschenrechner. Der Code soll unter nodeJS laufen und sieht aus wie folgt:

```js
// index.js
const add = (a, b) => a + b;

const sub = (a, b) => a - b;

module.exports = {
    add,
    sub,
};
```

Der dazugehörige Test ist folgendermaßen aufgebaut:

```js
// index.spec.js
describe("Mini-Calculator", () => {
    test("should add two numbers", () => {
        const sum = add(25, 17);
        expect(sum).toBe(42);
    });

    test("should sub two numbers", () => {
        const diff = sub(59, 17);
        expect(diff).toBe(42);
    });
});
```

![jest in console](/content/img/stenciljs-tutorial/jest-first-code.png "Erster Jest-Test")<div class="has-text-right image-subline">Bild 3: Sub und Add-Test</div>

Wie man sieht, rechnen die Funktionen wie sie sollen. Möchte man nun noch weitere Eck-Fälle testen würden man die Testblöcke kopieren, den Text und die Testdaten anpassen. Leider erhält man so sehr viel redundanten Code. Dazu hat Jest auch die richtige Lösung: **it.each**.

```js
test.each`
    summe | summand | expected
    ${1}  | ${8}    | ${9}
    ${2}  | ${9}    | ${11}
    ${3}  | ${10}   | ${13}
    ${4}  | ${11}   | ${14}
    ${5}  | ${12}   | ${17}
    ${6}  | ${13}   | ${19}
    ${7}  | ${14}   | ${21}
`("should add $summe to $summand", ({ summe, summand, expected }) => {
    expect(add(summe, summand)).toBe(expected);
});
```

Der Code zeigt den schleifenartigen Aufbau. Man erspart sich viel Redundanz. "summe", "summand" und "expected" definieren die Variablen. Diese müssen genauso heißen, wie im Tabellenkopf angegeben. Dann hat man im Test-Body zugriff auf die Werte und kann einen _expect_-Ausdruck darum bauen. In der Beschreibung werden die Werte über das _$_-Prefix referenziert. Führt man diesen Block nun aus, erhält man folgendes Bild:

![it each](/content/img/stenciljs-tutorial/it.each.png "Erster Jest-Test")<div class="has-text-right image-subline">Bild 4: each</div>

In der Konsole wird jeder Fall leserlich aufgelistet. Ich habe mich verzählt und einer der Fälle schlägt fehl. Ich kann die Testwerte ablesen und so meinen Code überprüfen. Außerdem wird mir die Dauer der Ausführung angezeigt. So könnte man auch versuchen die Performance zu verbessern.

Dies war eine kleine und schnelle Einführung in Jest. Es kratzt nur an der Oberfläche der Möglichkeiten und Fähigkeiten dieses Frameworks. Wer es noch nie ausprobiert hat, sollte es jetzt tun. Zur Übung lade ich euch weitere Tests und weiteren Code zu schreiben. Es gibt noch einige Grundrechenarten zum Spielen. Ihr könntet die Multiplikation und Division dem Mini-Taschenrechner beibringen.

Im nächsten Artikel nehme ich dann Bezug zu meinem StencilJS-Projekt.

Der Code hierzu liegt auf [Github](https://github.com/derKuba/stenciljs-tutorial/tree/main/jest).

Ihr habt Fragen oder Anregungen? Schreibt mir bei [Twitter](https://twitter.com/der_kuba).
\
\
Tausend Dank fürs Lesen!

Kuba
