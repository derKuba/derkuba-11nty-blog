---
title: "StencilJS-Tutorial: Tabellen-Komponente"
description: Skripte einrichten
date: 2021-07-02
tags: ["stenciljs"]
layout: layouts/post.njk
---

Das Wissen um die Erstellung einer neuen Komponente wollen wir nun nutzen, um eine Tabelle umzusetzen. Wenn man sich die [Scribbles](https://derkuba.de/content/posts/stenciljs/introduction/) anschaut, erkennt man sofort die Notwendigkeit einer Tabelle. Wir ignorieren an dieser Stelle, dass man es auch ohne HTML-Tabellen-Element umsetzen könnte. Schließlich wollen wir was lernen :-)  <!-- endOfPreview -->

Als Vorlage nehme ich das HTML-Tag _table_, entscheide mich für die Variante mit getrennten Kopf und Körper und bediene mich aus der [W3C-School](https://www.w3schools.com):

```html
<!-- https://www.w3schools.com/tags/tag_thead.asp -->
<table>
    <thead>
        <tr>
            <th>id</th>
            <th>Name</th>
            <th>Vorname</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>1</td>
            <td>Max</td>
            <td>Mustermann</td>
        </tr>
        <tr>
            <td>2</td>
            <td>Maxine</td>
            <td>Mustermann</td>
        </tr>
    </tbody>
</table>
```

Diese Struktur muss nun in eine Web-Component gepresst werden. Die große Herausforderung ist die Datenübergabe. Wie bekommt man zum Teil große Datenmengen in diese Struktur, bzw. an die Komponente übergeben? Ich habe zur Veranschaulichung drei Vorschläge erarbeitet. Jede hat seine Vor- und Nachteile und man sollte individuell je nach Art des Projektes entscheiden.

1. Datenübergabe der HTML-Struktur in Slots
2. Datenübergabe über HTML-Attribute
3. Datenübergabe über das HTML-Tag _option_

Ich werde zunächst den Aufruf, sowie die Übergabe der Komponente beschreiben und dann im nächsten Schritt die Implementierung.

#### 1. HTML als Kindelemente an die Komponente übergeben:

```html
<kuba-table-slot>
    <tr slot="table-head">
        <th>id</th>
        <th>Name</th>
        <th>Vorname</th>
    </tr>
    <tr>
        <td>1</td>
        <td>Max</td>
        <td>Muster</td>
    </tr>
    <tr>
        <td>2</td>
        <td>Maxine</td>
        <td>Muster</td>
    </tr>
    <tr>
        <td>3</td>
        <td>Momo</td>
        <td>Muster</td>
    </tr>
</kuba-table-slot>
```

Wie man sieht existiert eine Komponente _kuba-table-slot_. Diese bekommt die Titel der Spalten im tr-tag mit dem Zusatz _slot="table-head"_ übergeben. Die dazugehörigen Daten werden in der bekannten HTML-Struktur übergeben.

#### 2. Datenübergabe über HTML-Attribute:

```html
<kuba-table-attributes head="{head}" body="{body}" />
```

Die Komponente _kuba-table-attributes_ hat 2 Properties, bzw. 2 Attribute "head" und "body" und bekommt die Werte als Javascript Array übergeben.

```js
const head = ["id", "Name", "Vorname"];
const body = [
    ["1", "Max", "Muster"],
    ["2", "Maxine", "Muster"],
    ["3", "Momo", "Muster"],
];
```

#### 3. Datenübergabe über das HTML-Tag _option_

```html
<kuba-table-options>
    <kuba-table-options-head>
        <option value="id" />
        <option value="name" />
        <option value="vorname" />
    </kuba-table-options-head>

    <kuba-table-options-body>
        <option value="1" />
        <option value="Max" />
        <option value="Muster" />

        <option value="2" />
        <option value="Maxine" />
        <option value="Muster" />

        <option value="3" />
        <option value="Max" />
        <option value="Muster" />
    </kuba-table-options-body>
</kuba-table-options>
```

Die Komponente _kuba-table-options_ hat 2 Kind-Komponenten. Diese nenne ich mal Pseudo-Komponenten, da diese nicht als Klassen bestehen, sondern nur zur Unterscheidung der Daten für Titel und Inhalt dienen. Diese wiederum haben _option_-Elemente als Kindelement. Das Option-Tag ist nur den HTML-Tags _select_, _optgroup_ oder _datalist_ vorbehalten. Wir wollen es aber gar nicht rendern, sondern nutzen es als gültiges HTML-Element zum Datentransport.

## Implementierung

![Tabellenkomponente](/content/img/stenciljs-tutorial/table-component.png "Tabellenkomponente")<div class="has-text-right image-subline">Bild 1: Gerenderte Tabellen-Komponenten</div>

#### 1. Slots

```ts
// kuba-table-slot.tsx

import { Component, Host, h } from "@stencil/core";
@Component({
    tag: "kuba-table-slot",
    styleUrl: "kuba-table-slot.css",
    shadow: true,
})
export class KubaTableSlot {
    render() {
        return (
            <Host>
                <table>
                    <thead>
                        <slot name="table-head" />
                    </thead>
                    <tbody>
                        <slot />
                    </tbody>
                </table>
            </Host>
        );
    }
}
```

Diese Komponente gleicht [der allerersten Komponente](https://derkuba.de/content/posts/stenciljs/erste-stencil-komponente/). Der einzige Unterschied sind die Slot-Tags. Einmal handelt es sich um einen benannten Slot (Zeile 15), und den Standard-Slot (Zeile 18).

| Vor-                    |                                  Nachteile                                   |
| ----------------------- | :--------------------------------------------------------------------------: |
| leichte Implementierung |                 Tabellenkomponente macht nicht wirklich Sinn                 |
|                         | das CSS der Tabellenkomponente greift nicht auf die durchgereichten Elemente |
|                         |                   Logik ausserhalb der Tabellen-Komponente                   |

#### 2. Attribute

```ts
import { Component, Host, h, Prop } from "@stencil/core";

@Component({
    tag: "kuba-table-attributes",
    styleUrl: "kuba-table-attributes.css",
    shadow: true,
})
export class KubaTableAttributes {
    @Prop() head;
    @Prop() body;

    render() {
        return (
            <Host>
                <table>
                    <thead>
                        <tr>
                            {this.head.length > 0 &&
                                this.head.map((row) => <th>{row}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {this.body.length > 0 &&
                            this.body.map((row) => (
                                <tr>
                                    {row.map((cell) => (
                                        <td>{cell}</td>
                                    ))}
                                </tr>
                            ))}
                    </tbody>
                </table>
            </Host>
        );
    }
}
```

Die Besonderheit dieser Variante ist, dass die Daten über die Properties hereingereicht werden (Zeilen 10+11). Mit Hilfe dieser zwei Properties werden in den Zeilen 19-21 und 25-29 die HTML-Tabellenstruktur erstellt. Für den Head sind die Daten ein eindimensionales Array. Es wird per Schleife durchlaufen und es wird der Titel in die "th"-Tags gewrappt. Der zweite Teil hat eine aufwendigere Datenstruktur. Hierbei handelt es sich um ein zweidimensionales Array. Dieses wird durch eine verschachtelte Schleife durchlaufen. Die erste Ebene entspricht der Reihe und die zweite Ebene dem Inhalt der Spalte.

| Vor-                      |                Nachteile                |
| ------------------------- | :-------------------------------------: |
| leichte Implementierung   | Konfiguration programmatisch über TS/JS |
| übersichtliche Komponente |                                         |
| CSS gekapselt             |                                         |

#### 3. Option Tag

Wie bereits geschrieben, wird das Option Tag als gültiges HTML-Tag zum Transport von Daten "missbraucht". Aber da es nicht gerendert werden soll, stört es mich nicht. Wie man die Daten übergibt, kann man weiter oben sehen.
Die Implementierung besteht aus drei wesentlichen Teilen.

1. StencilJS "Element"
2. StencilJS Lifecycle Methode "connectedCallback"
3. Render Methode

Die Klasse _KubaTableOptions_ hat drei Klassenattribute. Das besagte StencilJS Element entspricht dem HTML Knoten, bzw. dem Output von document.querySelector("kuba-table-options"). Jede StencilJS-Component darf genau eins dieser Attribute besitzen. Die zwei weiteren Klassenattribute sind Arrays, in denen man sich den Inhalt des Tabellenkopfes und des Tabellenbodys merkt.

```ts
  @Element() $el: HTMLKubaTableOptionsElement;

  private headItems = [];
  private bodyItems = [];
```

Die _connectedCallback_ ist eine [LifeCycle-Methode](https://stenciljs.com/docs/component-lifecycle), die genau einmal nach der Initialisierung der Klasse aufgerufen wird. Diesen Moment nutzen wir, um die übergeben Optionstags abzufragen und umzuwandeln. Ich habe die Inhalte für Kopf und Körper jeweils in ein eigenes PseudoTag (Pseudo, weil keine Implementierung vorliegt) gepackt, damit ich es unterscheiden kann.

```ts
<kuba-table-options-head>
  <option value="id" />
  <option value="name" />
  <option value="vorname" />
</kuba-table-options-head>

<kuba-table-options-body>
  <option value="1" />
  <option value="Max" />
  <option value="Muster" />

  <option value="2" />
  <option value="Maxine" />
  <option value="Muster" />

  <option value="3" />
  <option value="Max" />
  <option value="Muster" />
</kuba-table-options-body>
```

Diese zwei Pseudo-Komponenten werden nun mit Hilfe des Elementattributes ausgelesen und in ein verwertbares Datenformat konvertiert.

```ts
const headOptions = Array.from(
    this.$el.querySelectorAll("kuba-table-options-head option")
);
this.headItems = headOptions.map((item) => item.getAttribute("value"));
```

Da _$el_ ein HTML-Node ist, hat es auch alle dazugehörigen Funktionen. Wir nutzen die Methode "querySelector", um nach dem _kuba-table-options-head_ Tag zu suchen und nach seinen Kindelemente _option_. Anschließend machen wir ein Array daraus, um mit der _map_-Funktion darüber iterieren zu können. Das geschieht in der nächsten Zeile (Zeile 2) und aus jedem Arrayelement, bei dem es sich um weitere HTML-Nodes handelt, wird über die _getAttribute()_-Methode, das _value_-Feld ausgelesen. Diese Values merke ich mir im Klassenattribut _headItems_. Das Auslesen der Werte für den Tabellenbody ist analog dazu. Eine Ausnahme gibt es aber doch. Es handelt sich nicht wie im Head um eine einzeilige Spalte. Die Option-Tags werden alle untereinander geschrieben und man sieht nicht, wann die nächste Zeile beginnt. Um es zu vereinfachen gehe ich davon aus, dass die Anzahl der Head-Spalten auch die Anzahl der übergebenen Datensätze entspricht. Ich nutze eine Funktion, um ein Array in gleichgroße Stücke zu schneiden, die dann die jeweilige Reihe repräsentieren.

```ts
const bodyOptions = Array.from(this.$el.querySelectorAll("kuba-table-options-body option"));
const bodyOptionsValues = bodyOptions.map(item => item.getAttribute("value"));
this.bodyItems = this.splitArrayIntoChunks(bodyOptionsValues, this.headItems.length);

// Hilfsfunktion
// https://ourcodeworld.com/articles/read/278/how-to-split-an-array-into-chunks-of-the-same-size-easily-in-javascript
private splitArrayIntoChunks = (items, size) => {
  let chunks = [];
  while (items.length) {
    chunks.push(items.splice(0, size));
  }
  return chunks;
}
```

Die Renderfunktion entspricht exakt derselben wie in Variante 2.

Die gesamte Klasse sieht dann aus wie folgt:

```ts
// kuba-table-options.tsx
import { Component, Host, h, Element } from "@stencil/core";

@Component({
    tag: "kuba-table-options",
    styleUrl: "kuba-table-options.css",
    shadow: true,
})
export class KubaTableOptions {
    @Element() $el: HTMLKubaTableOptionsElement;

    private headItems = [];
    private bodyItems = [];

    connectedCallback() {
        const headOptions = Array.from(
            this.$el.querySelectorAll("kuba-table-options-head option")
        );
        this.headItems = headOptions.map((item) => item.getAttribute("value"));

        const bodyOptions = Array.from(
            this.$el.querySelectorAll("kuba-table-options-body option")
        );
        const bodyOptionsValues = bodyOptions.map((item) =>
            item.getAttribute("value")
        );
        this.bodyItems = this.splitArrayIntoChunks(
            bodyOptionsValues,
            this.headItems.length
        );
    }

    // https://ourcodeworld.com/articles/read/278/how-to-split-an-array-into-chunks-of-the-same-size-easily-in-javascript
    private splitArrayIntoChunks = (items, size) => {
        let chunks = [];
        while (items.length) {
            chunks.push(items.splice(0, size));
        }
        return chunks;
    };

    render() {
        return (
            <Host>
                <table>
                    <thead>
                        <tr>
                            {this.headItems.length > 0 &&
                                this.headItems.map((row) => <th>{row}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {this.bodyItems.length > 0 &&
                            this.bodyItems.map((row) => (
                                <tr>
                                    {row.map((cell) => (
                                        <td>{cell}</td>
                                    ))}
                                </tr>
                            ))}
                    </tbody>
                </table>
            </Host>
        );
    }
}
```

| Vor-                      |          Nachteile           |
| ------------------------- | :--------------------------: |
| Konfiguration über HTML   | Aufwendigere Implementierung |
| übersichtliche Komponente |                              |
| CSS gekapselt             |                              |

#### Fazit

Viele Wege führen nach Rom. Jede Variante hat Vor- und Nachteile. In meinen letzten Projekten war die dritte Variante mein Favorit, weil es relativ einfach direkt über HTML konfiguriert werden kann. Um die Variante mit den Properties zu füllen, muss vor dem rendern der HTML Knoten mit JS angesteuert werden und programmatisch die Daten übergeben.

Was meint ihr?

Der Code hierzu liegt auf [Github](https://github.com/derKuba/stenciljs-tutorial). Um es auf diesen Stand zu bringen, müsst ihr das Projekt klonen und einmal auf den Tag 1.0.1 auschecken:

```bash
git clone git@github.com:derKuba/stenciljs-tutorial.git
git checkout -b stencil-starter 1.0.1
```

Ihr habt Fragen oder Anregungen? Schreibt mir bei [Twitter](https://twitter.com/der_kuba).
\
\
Tausend Dank fürs Lesen!

Kuba
