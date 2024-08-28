---
title: "StencilJS-Tutorial: Real World Unit Tests"
description: Wir testen die Komponenten unserer App
date: 2021-08-21
tags: ["stenciljs", "testing", "jest"]
layout: layouts/post.njk
---

Nachdem wir [im letzten Artikel](https://derkuba.de/content/posts/stenciljs/jest-intro/) die Grundlagen des Testing-Frameworks Jest gelernt haben, wenden wir dieses Wissen in unserem Beispielprojekt _Adressbuch_ an. <!-- endOfPreview -->Kleine Warnung vorab. [Zurzeit (21.08.21 15:37Uhr)](https://github.com/ionic-team/stencil/issues/2942) gibt es Probleme zwischen dem _stencil-core_ und der Jest-Version 27. Aktuell bekommt man einen Fehler angezeigt, wenn man die Tests ausführt. Ein Downgrade auf die Version 26 ist die Lösung:

```ts
// package.json
...
"devDependencies": {
    "jest": "^26.0.0",
    "jest-cli": "^26.0.0",
}
...
```

Wir haben jetzt die klassische Situation. Wir betreten ein bestehendes Projekt und es sind keine Tests vorhanden. Die Gründe wurden im letzten Artikel erläutert. Aber was nun? Wo und wie geht man vor. Ich empfehle an dieser Stelle erst einmal Jest zu installieren. Häufig ist es im Projekt-Skeleton bereits enthalten. Wenn dies nicht der Fall ist, bitte den [vorherigen Artikel](https://derkuba.de/content/posts/stenciljs/jest-intro/) lesen.

#### Überlick verschaffen

Aber wie?

Ich empfehle die Coverage anschauen. Es handelt sich um eine statische Analyse des Codes und das Ergebnis ist ein Überblick welche Teile des Codes Tests durchlaufen.
Das Zauberwort ist **--coverage**.

```bash
npm run test --coverage
```

Das Ergebnis sieht in meinem Fall so aus:

```bash
----------------------------------|---------|----------|---------|---------|----------------------------
File                              | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------------------------------|---------|----------|---------|---------|----------------------------
All files                         |   54.55 |    15.79 |   39.47 |   54.64 |
 components/kuba-address-form     |   30.56 |        0 |   27.27 |   30.56 |
  kuba-address-form.tsx           |   30.56 |        0 |   27.27 |   30.56 | 26,34,38,43-47,54-63,67-85
 components/kuba-button           |     100 |      100 |     100 |     100 |
  kuba-button.tsx                 |     100 |      100 |     100 |     100 |
 components/kuba-home             |     100 |      100 |     100 |     100 |
  kuba-home.tsx                   |     100 |      100 |     100 |     100 |
 components/kuba-input            |   66.67 |        0 |      40 |   63.64 |
  kuba-input-functional.tsx       |      50 |        0 |       0 |      40 | 16-19
  kuba-input.tsx                  |   83.33 |      100 |   66.67 |   83.33 | 20
 components/kuba-list             |   55.56 |      100 |      40 |   55.56 |
  kuba-list.tsx                   |   55.56 |      100 |      40 |   55.56 | 12-15,37
 components/kuba-table-attributes |      50 |       25 |      25 |      50 |
  kuba-table-attributes.tsx       |      50 |       25 |      25 |      50 | 18-26
 components/kuba-table-options    |   60.87 |    33.33 |      40 |   63.64 |
  kuba-table-options.tsx          |   60.87 |    33.33 |      40 |   63.64 | 25,37,49-73
 components/kuba-table-slot       |     100 |      100 |     100 |     100 |
  kuba-table-slot.tsx             |     100 |      100 |     100 |     100 |
 store                            |     100 |      100 |     100 |     100 |
  address-store.ts                |     100 |      100 |     100 |     100 |
----------------------------------|---------|----------|---------|---------|----------------------------
Test Suites: 7 failed, 1 passed, 8 total
Tests:       7 failed, 1 passed, 8 total
Snapshots:   1 passed, 1 total
Time:        2.799 s

```

Wir sehen in der Tabelle, das bereits einige Tests bestehen und wir eine Gesamtabdeckung von 54.55% haben.
Aber das reicht uns natürlich nicht. Zur besseren Übersicht müssen wir noch etwas an der Konfiguration der Tests schrauben:

```ts
// stencil.config.ts
export const config: Config = {
...
 testing: {
    coverageDirectory: "./reports",
    coverageReporters: ["html", "text"],
  },
...
}
```

Führen wir erneut den Testbefehl aus, erhalten wir unter /reports allerlei Dateien. Öffnen wir nun im Browser die _index.html_:

Diese Einstellung gibt dem Reporter, einem Tool der eine übersichtliche Auswertung innerhalb einer HTML-Seite erstellt, einen Speicherort. Das Flag "text" lässt weiterhin die obige Tabelle auf der Konsole erscheinen.

![jest_html_report](/content/img/stenciljs-tutorial/jest_html_report.png "Jest HTML Reporter")<div class="has-text-right image-subline">Bild 1: Jest HTML Reporter</div>

![jest-kuba-adress-form-report](/content/img/stenciljs-tutorial/jest-kuba-adress-form-report.png "Jest HTML Reporter")<div class="has-text-right image-subline">Bild 2: Jest HTML Reporter: Adressbuch-Eben</div>

![jest-adress-form-snippet](/content/img/stenciljs-tutorial/jest-adress-form-snippet.png "jest-adress-form-snippet")<div class="has-text-right image-subline">Bild 3: Code-Auszug</div>

Das erste Bild zeigt die kunterbunte Auswertung. Es enthält die gleichen Daten wie die Tabelle auf der Konsole. Klickt man aber auf die Komponenten, z.B. auf die _components/kuba-adress-form_ wandert man eine Ebene tiefer (Bild 2). Die Ebenen entsprechen der Ordnerstruktur. Ein weiterer Klick auf den _kuba-address-form.tsx_ lässt den wirklichen Mehrwert erkennen. Wir sehen jetzt auf Code-Ebene welche Teile, wie oft ausgeführt werden. Zusätzlich zeigen die roten Stellen welche Stellen, Funktionen, Verzweigungen ausgelassen wurden. Das ist der Fahrplan für unsere Tests. Man kann sich jetzt Datei für Datei durchhangeln.
Wir starten mit einem einfachen Beispielstest.

#### Snapshot-Tests

Als ich das erste Mal auf diese Art der Tests gestoßen bin, habe ich mich sofort verliebt.

Schauen wir jetzt mal folgenden Test an:

```ts
import { newSpecPage } from "@stencil/core/testing";
import { KubaButton } from "../kuba-button";

describe("kuba-button", () => {
    it("should render the button", async () => {
        const page = await newSpecPage({
            components: [KubaButton],
            html: `<kuba-button></kuba-button>`,
        });
        expect(page.root).toMatchInlineSnapshot();
    });

    it("should render the button", async () => {
        const page = await newSpecPage({
            components: [KubaButton],
            template: () => <kuba-button handleSubmit={() => {}}></kuba-button>,
        });
        expect(page.root).toMatchSnapshot();
    });
});
```

Wir erkennen den bekannten Testrahmen mit einem _describe_-Block und zwei _it_-Blöcke. Wir importieren die zu testende Komponente in Zeile 2 - den KubaButton. In Zeile 7 und 15 wird die Referenz auf diesen Button dem _newSpecPage_-Objekt des Stencil-Testing-Cors übergeben. Diese wird benötigt, damit Stencil eine Instanz dieser Klasse erstellen kann. Zugriff darauf erhalten wir anschließend über _page.rootInstance_. Als zweiten Übergabeparameter (Korrekt wäre zu schreiben, dass _newSpecPage_ ein Konfigurationsobjekt mit mehreren Parametern erhält ) können wir zwischen _html_ oder _template_ wählen. Ersteres erhält die zu rendernde Komponente als String. Der Nachteil ist, dass man nur statische String-Parameter übergeben kann. Diesen Nachteil gleicht die zweite Variante _template_ aus. Hier kann man Objekte übergeben. Damit kein Fehler geworfen wird, muss noch das {h} aus dem Core _"@stencil/core"_ importiert werden.
Ein weiterer Unterschied in der Art und Weise dieser Tests findet sich in den Zeilen 10 und 18: _toMatch(Inline)Snapshot_.

Der Snapshot-Mechanismus speichert ein Abbild des Objekts oder des HTML-Gerüsts in genau diesem Zustand. In der ersten Variante wird das Schnipsel dann als Parameter erzeugt. Im zweiten wird eine Datei unter /**snapshots**/kuba-button.spec.tsx.snap erzeugt, die so aussieht:

```ts
// Jest Snapshot v1, https://goo.gl/fbAQLP

exports[`kuba-button renders 2`] = `
<kuba-button>
  <mock:shadow-root>
    <button>
      <slot></slot>
    </button>
  </mock:shadow-root>
</kuba-button>
`;

exports[`kuba-button should render the button 1`] = `
<kuba-button>
  <mock:shadow-root>
    <button>
      <slot></slot>
    </button>
  </mock:shadow-root>
</kuba-button>
`;
```

Diese Datei wird eingecheckt. Bei der nächsten Ausführung des Tests wird dann gegen diese Datei verglichen. Sollte es sich etwas geändert haben, zeigt der Test dies auf. So erhält man Feedback, ob die Codeänderung Auswirkung auf die Komponente hatte. War dies gewollt, wird die Datei überschrieben. Wenn nicht, hat man die Gelegenheit seinen Fehler zu korrigieren.

Warum wird dies von mir so gefeiert?

Früher, als jQuery noch state of the art war sah ein Test in PseudoCode so aus:

```ts
// jasmine

describe {

    it{
        const htmlSnippet = '<div><button class="kuba-button"></button></div>';
        renderSnippet(htmlSnippet);

        expect($(".kuba-button").toBeTruthy();

        // fügt weiteren HTML-Code dazu
        $(".kuba-button").click();

        expect($(".kuba-button").classes()).contains("active");
        expect($(".kuba-button > .neuesKindA").innerText).toBe("Neuer Text")
         expect($(".kuba-button > .neuesKindB").innerText).toBe("Ladespinner")
    }
}
```

Zugegebenermaßen es sieht sehr ähnlich aus. Worauf ich aber hinaus möchte ist, dass man jede Änderung an der Komponente in einem eigenen Expect abprüfen musste. Jetzt wird der Zustand hergestellt und alle Knoten, die neu dazukommen oder sich ändern, müssen nicht einzeln abgefragt werden.

#### Unit-Tests

Bisher haben wir uns nur um das "Aussehen" der Komponente gekümmert. Aber wie testen man jetzt das Verhalten. Wir bleiben am einfachen Beispiel des "kuba-buttons". Dieser hat eine private Methode, die das Property aufruft:

```ts
...
class KubaButton {
    @Prop() handleSubmit;

    private handleClickEvent = () => {
        this.handleSubmit();
    };

    render() {
        return (
            <Host>
                <button onClick={this.handleClickEvent}>
                    <slot />
                </button>
            </Host>
        );
    }
}
```

Der Test für diese Klasse sieht dann so aus:

```ts
it("should handle click", async () => {
    const clickMock = jest.fn();
    const page = await newSpecPage({
        components: [KubaButton],
        template: () => <kuba-button handleSubmit={clickMock}></kuba-button>,
    });

    page.body
        .querySelector("kuba-button")
        .shadowRoot.querySelector("button")
        .click();

    expect(clickMock).toHaveBeenCalled();
});

it("should handle alternatively", async () => {
    const clickMock = jest.fn();

    const kubaButton = new KubaButton();
    kubaButton.handleSubmit = clickMock;

    kubaButton.handleClickEvent();

    expect(clickMock).toHaveBeenCalled();
});
```

Wir sehen wieder die bekannte Teststruktur. Die Zeilen 2 und 17 zeigen ein weiteres elementares Feature von Jest: _jest.fn()_. Die genaue Funktion beschreibe ich im nächsten Artikel. Für den Moment reicht es zu wissen, dass diese Funktion ein Mock ist und den Übergabeparameter simuliert. Zusätzlich kann bei diesem Mock erfragt werden, ob der Mock in der Implementierung des Buttons aufgerufen wurde.

Aber wie führt man den Aufruf der Methode _handleClickEvent_ herbei? Dazu möchte ich zwei Möglichkeiten aufzeigen:

1. Operation auf dem DOM.
   Wir instanziieren eine SpecPage (Zeile 3). Auf dieser Page stehen uns die bekannten DOM-Operationen zur Verfügung. Wir selektieren den Button (Zeile 9). Achtung! Der Rest der HTML-Struktur ist im [shadow Dom](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM) gekapselt. Dieser muss erst angesteuert werden, um dann darauf den Button zu selektieren ( Zeile 10 ). Da wir den Button im DOM erreicht haben, können wir die native _.click()_-Funktion aufrufen ( Zeile 11). Damit haben wir das Event ausgelöst. Der Mock sollte ausgelöst worden sein. Dies erfragen wir mit dem _expect_ (Zeile 13).

2. Bei der zweiten Implementierung sollten die Alarmglocken los schrillen. Denn einerseits testet man hier die Implementierung und andererseits eine private Funktion. Ich bin der Meinung, dass man lieber gegen dieses Paradigma verstößt, als dass man auf den Test verzichtet. Ein Aufruf einer privaten Funktion ist in Typescript möglich und der Test läuft auch grün.

#### Kleine Kniffe

Hier noch ein paar kleine Tipps, die den Umgang erleichtern.

Man kann einzelne Tests innerhalb eines _describe_-Blocks ausschalten/ignorieren:

```ts
    xit("should ...", async () => { // oder
    it.skip("should ...", async () => { ...}// oder gar den ganzen describe-Block
    xdescribe("kuba-button", () => {...}
```

Man kann einen Test auch forcieren:

```ts
    fit("should ...", async () => { // oder
    it.only("should ...", async () => { ...}
```

Man kann beim Ausführen eine Wildcard mitgeben und es wird nach einem Test mit dem Namen als Wildcard gesucht:

```ts
  npm run test kuba-button
```

#### Fazit

Wir haben in diesem Artikel einiges gelernt. Mit diesem Wissen sind wir im Stande die Meisten Tests der Anwendung nachzuholen. Aufgeschoben ist immer besser als aufgehoben. Meiner Meinung nach sind Tests, die nachgeholt werden sehr wertvoll. Man muss sich die Implementierung nochmal anschauen und findet gegebenenfalls Verbesserungen. Man bekommt mehr Sicherheit, um überhaupt Refactoring anzugehen.

Was haben wir gelernt?

-   Snapshot-Tests: Was, warum und wie?
-   Einfache Unit Tests
-   Test-Coverage und wie sie bei der Initiierung von Tests hilft.
-   Tests forcieren und einzelne Tests ausführen

Im nächsten Artikel möchte ich tiefer in das Thema Mocking einsteigen und noch weitere Tests zeigen.

Der Code hierzu liegt auf [Github](https://github.com/derKuba/stenciljs-tutorial).

Ihr habt Fragen oder Anregungen? Schreibt mir bei [Twitter](https://twitter.com/der_kuba).
\
\
Tausend Dank fürs Lesen!

Kuba
