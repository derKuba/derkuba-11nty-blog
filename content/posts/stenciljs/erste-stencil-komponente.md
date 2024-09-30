---
title: "StencilJS-Tutorial: Die erste Komponente"
description: Erste Komponenten
date: 2021-06-11
tags: ["stenciljs"]
layout: layouts/post.njk
---

Wir haben eine funktionsfähige Umgebung und können endlich mit der Entwicklung starten. <!-- endOfPreview --> In der **package.json** ist ein Skript zum Hinzufügen von Komponenten vorhanden: _generate_.

```bash
npm run generate kuba-input
```

Der Befehl startet eine Art Wizard und fragt ab was wir erzeugen möchten:

![generate](/img/stenciljs-tutorial/generate.png "generate")<div class="has-text-right image-subline">Bild 1: Generator</div>

Ich habe mich für Stylesheet und Unit-Test entschieden. Die E2E Tests lasse ich erstmal außen vor.

![kuba-input](/img/stenciljs-tutorial/kuba-input.png "kuba input")<div class="has-text-right image-subline">Bild 2: Meine erste Komponente</div>

"kuba-input" ist meine erste Komponente. Der Name setzt sich aus [namespace]-[Komponentenname] zusammen und entspricht dem zukünftigen HTML-Tag. Man findet einen Ordner kuba-input unter src/components/kuba-input, in dem sich drei Dateien befinden. Die eigentliche Komponente _kuba-input.tsx_, die dazugehörige CSS _kuba-input.css_ und der Unit-Test _kuba-input.spec.tsx_. Wer sich jetzt über die Dateiendung _.tsx_ wundert, sollte sich nicht abschrecken lassen. TSX bedeutet, dass es sich um eine Typescript Datei handelt, in der sich HTML innerhalb des Codes befindet.

Der Inhalt der kuba-input.tsx setzt sich zusammen wie folgt:

```typescript
import { Component, Host, h } from "@stencil/core"; // hole die Komponente aus dem Stencil-Kern

// Annotation die anzeigt, dass es sich um eine Komponente handelt, ...
@Component({
    tag: "kuba-input", // die mit diesem Tag aufgerufen werden kann,
    styleUrl: "kuba-input.css", // ihr CSS aus dieser Datei speißt
    shadow: true, // und im Shadow-Dom gekapselt ist.
})
export class KubaInput {
    // das TSX muss innerhalb von Komponenten immer in der render-methode zurückgegeben werden. Ausnahme hiervon sind sogenannte functional components.
    render() {
        return <Host>Hallo, ich bin die erste Komponente</Host>;
    }
}
```

Wollen wir diese Komponente nun sehen, müssen wir sie als Knoten in unseren DOM hängen. Die aktuelle Starter-App ist aufgebaut wie folgt:

-   < app-root /> ist der Einstiegspunkt in der index.html
    -> in dieser ist Router eingebunden. Für diese Tutorial habe ich es auskommentiert, weil es hier noch nicht benötigt wird.

Fügt man nun innerhalb der render-Methode der app-root.tsx <kuba-input/>, bekommt man das "Hallo, ich bin die erste Komponente" zu sehen.

```typescript
import { Component, h } from "@stencil/core";

@Component({
    tag: "app-root",
    styleUrl: "app-root.css",
    shadow: true,
})
export class AppRoot {
    render() {
        return (
            <div>
                <header>
                    <h1>Adressbuch</h1>
                </header>

                <main>
                    <kuba-input></kuba-input>
                </main>

                {/*
          <stencil-router>
            <stencil-route-switch scrollTopOffset={0}>
              <stencil-route url="/" component="app-home" exact={true} />
              <stencil-route url="/profile/:name" component="app-profile" />
            </stencil-route-switch>
          </stencil-router>
       */}
            </div>
        );
    }
}
```

Für dieses Tutorial möchte ich folgenden Fall umsetzen. Wir legen Komponente an, die ein Inputfeld und einen Button besitzt. Wenn ich den Button drücke, bekomme ich den Inhalt in einem Alert angezeigt.

![simple-input](/img/stenciljs-tutorial/simple-input.png "simple input")<div class="has-text-right image-subline">Bild 3: Use-Case</div>

Dazu brauchen wir drei Komponenten:

1. Kontakt-Formular
2. Inputfeld inklusive Label
3. Button.

Diese werden über den "generate"-Befehl erstellt:

```bash
npm run generate kuba-address-form
npm run generate kuba-button
# falls es bisher nicht angelegt wurde
npm run generate kuba-input
```

Die Einbindung erfolgt über die app-root.tsx und gliedert sich wie folgt:

-   app-root
    -   kuba-address-form
        -   kuba-input
        -   kuba-button

Anhand von kuba-input möchte ich vier grundlegenden Funktionen einer StencilJS-Komponente erklären und im Anschluss erkläre ich wie die Komponenten zusammengesteckt werden.

1. Props bzw. Properties ( oder wie übergebe ich Daten an die Komponente ?)
2. Slots
3. Events ( oder wie versende ich Nachrichten und Interaktionen? )
4. State ( oder wie halte ich den Zustand meiner Komponente).

### Props

Wir bauen HTML Tags. Diese nutzen zur Übergabe von Parametern und Daten Attribute. StencilJS nennt diese Attribute Properties.
Nehmen wir jetzt die kuba-input Komponente. Diese braucht als Parameter ein Label für das Inputfeld, eine ID und den Typ des Inputfeldes (Text oder Zahl). Eine Property ist ein Klassenattribut mit einer _@Prop()_-Annotation. Ich empfehle an dieser Stelle einen Blick [in die offizielle Doku](https://stenciljs.com/docs/properties) zu werfen.

```typescript
@Prop() componentId: string;

@Prop() label: string;

// Akzeptiere nur inputType text oder number
// und belege es mit text vor
@Prop() inputType: "text" | "number" = "text";
```

Als Property können sämtliche Datentypen und Funktionen übergeben werden. Hier ein Beispiel für eine übergebene Funktion:

```typescript
/* kuba-button.tsx */

// Ganz normale Property, die eine Funktion beinhaltet
@Prop() handleSubmit;

// wird an das native onClick des Buttons übergeben.
<button onClick={this.handleSubmit} />

/* kuba-address-form.tsx */

// Definition der Funktion, die übergeben werden soll-
private onSubmit = () => {
alert(this.innerText);
};

// Überreichung der Funktion
<kuba-button handleSubmit={this.onSubmit}>speichern</kuba-button>
```

### Slots

Als [Slot](https://stenciljs.com/docs/templating-jsx#slotshttps://stenciljs.com/docs/templating-jsx#slots) werden HTML-Tags bezeichnet, die im Bauch der angelegten Komponente platziert sind. Wenn ich ein HTML tag...

```typescript
<kuba-input>
    <span>... hier platzieren möchte...</span>
</kuba-input>
```

... kann ich es nicht so tun wie hier beschrieben. Der Span-Block würde ignoriert werden. Damit das nicht passiert muss ich meiner Komponente mitteilen, an welcher Stelle diese "Kinder-Knoten" platziert werden sollen. Die einfachste Variante sind unbenannte Slots:

```typescript
/* kuba-button.tsx */
 <button onClick={this.handleSubmit}>

    <slot/>

</button>

/* kuba-address-form.tsx */

 <kuba-button>speichern</kuba-button>
```

Der "speichern"-Text wird an der Stelle des Slots platziert. Um mehrere Slots innerhalb einer Komponente zu platzieren, werden benannte Slots angeboten. Diese werden innerhalt der Komponente mit einem name-Attribut versehen:

```typescript
<slot name="beliebiger-name" />
<slot name="zweiter" />
```

und können dann an ein beliebiges HTML-Tag gepinnt werden:

```typescript
 <p slot="beliebiger-name">Das ist der zu übertragende Inhalt</p>
 <div slot="zweiter"> Neuer Inhalt</div>
```

### Events

Als Events werden z.B. Tastaturanschläge, Mausklicks, das Verlassen des Inputfeldes bezeichnet, aber auch Nachrichten, die man an andere Komponenten schicken kann, die sich nicht unmittelbar über dem eigenen Knoten befinden.
Im konkreten Fall möchte ich in der Elternkomponente _kuba-address-form_ über Änderungen innerhalb des Inputfeldes von _kuba-input_ informiert werden. Dazu benötigt die Kindkomponente _kuba-input_ einen Event, samt EventEmitter. Die Elternkomponente _kuba-address-form_ benötigt einen Listener auf das Event:

```typescript
/* kuba-input.tsx */
 @Event({ bubbles: true }) inputEvent: EventEmitter;

// interner Listener auf onInput des input-tags
private onInput = (event) => {

    // schicke die Nachricht weiter
    this.inputEvent.emit({ value: event.target.value });
}

// innerhalb der render-methode
...
<input
    ...

    // hier reicht als Parameter die Referenz, da es sich um eine
    // Arrow-Funktion handelt. Ohne Arrow-Funktion fehlt der
    // this-context und es wird ein Fehler geworfen.
    onInput={this.onInput}
/>
```

Damit die Elternkomponente nun die Nachricht bekommt, muss diese drauf lauschen:

```typescript
/* kuba-address-form.tsx */
private onChange = ({ detail: { value } }: { detail: { value: string } }) => {
    console.log(value);
    this.innerText = value;
};

// innerhalb der render-methode

<kuba-input
    ...
    onInputEvent={this.onChange}
></kuba-input>
```

Jetzt bekommt die kuba-address-form mit, wenn etwas in das kuba-input getippt wird und das bei jedem Tastaturanschlag. Dies kann man auch ändern, wenn man z.B. statt auf onInput auf onBlur lauscht.

### States

Die Elternkomponente wird im weiteren Verlauf viel mehr Inputfelder besitzen und um die Informationen aus diesen Feldern weiterzugeben, muss sich die Komponente Informationen merken.
Dazu wird in StencilJS _@State()_ verwendet. Hierbei handelt es sich um den Zustand der einzelnen Komponente. Möchte man sich applikationsweit den Zustand merken, wird ein _Store_ benötigt. Darauf gehe ich in einem späteren Tutorial ein.

Initialisiert, geschrieben und gelesen wird ein State folgendermaßen:

```typescript
// Initalisierung als Klassenattribut
@State() innerText: string;

// innerhalb einer Methode
this.innerText = value;

// Auslesen innerhalb der render-methode
Name: {this.innerText}
```

In konkretem Fall schreibe ich den eingetippten Wert bei jedem Tastenanschlag in den State.

### Zusammenführung

Die zusammengesteckten Komponenten funktionieren nun wie im Use-Case definiert. Die _kuba-address-form_ definiert den Rahmen und inkludiert das _kuba-input_ und den _kuba-button_. Die eingegeben Informationen werden per Event an die Elternkomponente weitergereicht, geloggt, gespeichert und dann beim Betätigen des _kuba-buttons_ via Alert ausgegeben.

```typescript
// kuba-addres-form.tsx
import { Component, Host, h, State } from "@stencil/core";

@Component({
    tag: "kuba-address-form",
    styleUrl: "kuba-address-form.css",
    shadow: true,
})
export class KubaAddressForm {
    @State() innerText: string;

    private onChange = ({
        detail: { value },
    }: {
        detail: { value: string };
    }) => {
        console.log(value);
        this.innerText = value;
    };

    private onSubmit = () => {
        alert(this.innerText);
    };

    render() {
        return (
            <Host>
                <h2>Adress-Formular</h2>
                <kuba-input
                    componentId="name"
                    label="Name:"
                    onInputEvent={this.onChange}
                ></kuba-input>
                <kuba-button handleSubmit={this.onSubmit}>
                    speichern
                </kuba-button>
                <hr />
                <h3>Eingegebene Daten:</h3>
                Name: {this.innerText}
            </Host>
        );
    }
}
```

```typescript
// kuba-input.tsx
import { Component, Host, h, Event, EventEmitter, Prop } from "@stencil/core";

@Component({
    tag: "kuba-input",
    styleUrl: "kuba-input.css",
    shadow: true,
})
export class KubaInput {
    @Prop() componentId: string;

    @Prop() label: string;

    @Prop() inputType: "text" | "number" = "text";

    @Event() inputEvent: EventEmitter;

    private onInput = (event) => {
        this.inputEvent.emit({ value: event.target.value });
    };

    render() {
        return (
            <Host>
                <div class="kuba-input">
                    <label htmlFor={this.componentId}>{this.label}</label>
                    <input
                        type={this.componentId}
                        id={this.componentId}
                        value=""
                        onInput={this.onInput}
                    />
                </div>
            </Host>
        );
    }
}
```

```typescript
// kuba-button.tsx

import { Component, Host, h, Prop } from "@stencil/core";

@Component({
    tag: "kuba-button",
    styleUrl: "kuba-button.css",
    shadow: true,
})
export class KubaButton {
    @Prop() handleSubmit;

    render() {
        return (
            <Host>
                <button onClick={this.handleSubmit}>
                    <slot />
                </button>
            </Host>
        );
    }
}
```

Der Code hierzu liegt auf [Github](https://github.com/derKuba/stenciljs-tutorial). Um es auf diesen Stand zu bringen, müsst ihr das Projekt klonen und einmal auf den Tag 1.0.0 auschecken:

Ihr habt Fragen oder Anregungen? Schreibt mir bei [Twitter](https://twitter.com/der_kuba).
\
\
Tausend Dank fürs Lesen!

Kuba
