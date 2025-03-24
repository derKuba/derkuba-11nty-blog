---
title: "Solid 1.9 und Web Components: Event-Target-Drama"
description: Wie man Issues bei github einstellt und warum das wichtig ist.
date: "2025-03-23"
tags: ["solid", "github"]
layout: layouts/post.njk
lang: "de"
alternate_lang: "en"
alternate_url: "/posts/en/0325/solid1.9"
---

Solid.js hat sich in den letzten Monaten zu meinem Lieblingsframework gemausert. Trotzdem gab es kürzlich ein kleines Drama bei meinem Update von Solid 1.8.x auf 1.9.x. Was ist passiert?<!-- endOfPreview -->

## Das Problem

Nachdem ich ein scheinbar harmloses Update von Solid auf Version 1.9 gemacht hatte, reagierten plötzlich einige meiner selbstgebauten Web Components nicht mehr richtig. Insbesondere das Auslesen von Werten aus Events funktionierte nicht mehr wie gewohnt:

```js
onInput={(e) => {
  console.log(e.target.value); // => undefined
}}
```

Was vorher problemlos funktionierte, lieferte plötzlich `undefined`. Panik! Zuerst dachte ich natürlich sofort: "Parcel, du bist schuld!"

Doch selbst nach ausgiebigen Experimenten mit Vite und Webpack blieb der Fehler bestehen. Parcel war ausnahmsweise unschuldig.

## Ein Issue fürs Solid-Team

Ratlos und ein wenig verzweifelt wandte ich mich schließlich direkt ans Solid-Team. Ich isolierte das Problem, erstellte ein [Minimalbeispiel auf GitHub](https://github.com/derKuba/solid-eventing-problem) und eröffnete ein [Issue auf GitHub](https://github.com/solidjs/solid/issues/2451).

Was danach geschah, hätte ich nicht erwartet: Innerhalb von wenigen Stunden bekam ich ausführliche Antworten direkt vom Solid-Team – inklusive des Core-Autors Ryan höchstpersönlich! Mein Fanherz schlug definitiv höher.

![Image](/img/0325/ryan.png "Ryan antwortet bei github")

Ryan erklärte mir geduldig, dass die Änderung in Solid 1.9 nicht etwa ein Bug sei, sondern sich vielmehr näher am offiziellen Verhalten des DOM orientiert. Der Grund: Wenn ein Event die Grenzen des Shadow DOMs verlässt, wird der Event-Target automatisch auf das Custom Element gesetzt – und eben nicht mehr auf das innere Element.

## Der alte Code (vorher)

Mein bisheriger Code sah ungefähr so aus:

```js
class KubaTextField extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open", delegatesFocus: true });
        this.shadowRoot.innerHTML = `<input />`;
    }
}

customElements.define("kuba-textfield", KubaTextField);
```

Damit hatte ich stets Zugriff auf den Wert über `e.target.value`. Genau das ging nun nicht mehr.

## Die Lösung (Refactoring)

Um dem neuen Verhalten gerecht zu werden, musste ich meine Web Components leicht anpassen:

-   Einen Getter und Setter für `value` hinzufügen, um das innere Element zu spiegeln.
-   Events vom inneren Element (`input`, `change`) abfangen und neu dispatchen – mit `{ bubbles: true, composed: true }`.

### Angepasster Code (Refactored)

```js
class KubaTextField extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open", delegatesFocus: true });
        this.shadowRoot.innerHTML = `<input />`;

        this._handleInput = this._handleInput.bind(this);
    }

    connectedCallback() {
        this.$input = this.shadowRoot.querySelector("input");
        this.$input.addEventListener("input", this._handleInput);
    }

    disconnectedCallback() {
        this.$input.removeEventListener("input", this._handleInput);
    }

    get value() {
        return this.$input.value;
    }

    set value(val) {
        this.$input.value = val;
    }

    _handleInput(event) {
        this.dispatchEvent(
            new Event("input", { bubbles: true, composed: true }),
        );
    }
}

customElements.define("kuba-textfield-working", KubaTextField);
```

Mit diesem Refactoring konnte ich wieder problemlos auf den Wert über `e.target.value` zugreifen:

```js
onInput={(e) => {
  console.log(e.target.value); // endlich wieder korrekt!
}}
```

## Mein Learning

Was zuerst wie ein Solid- oder Parcel-Problem aussah, entpuppte sich letztlich als das Standardverhalten des DOM im Zusammenspiel mit Shadow DOM und Web Components. Das schnelle Feedback des Solid-Teams hat mir nicht nur die Lösung gebracht, sondern auch gezeigt, wie wichtig und wertvoll direkter Support von Framework-Autoren ist.

Wer die vollständige, funktionierende Implementierung sehen möchte, findet sie in meinem [Reproduktions-Repo](https://github.com/derKuba/solid-eventing-problem) unter der Komponente `kuba-textfield-working`.

Für Feedback bin ich immer dankbar.
Gerne an jacob@derkuba.de

Viele Grüße

Euer Kuba
