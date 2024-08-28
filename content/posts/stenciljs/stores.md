---
title: "StencilJS-Tutorial: Store"
description: Global State oder der Store
date: 2021-07-17
tags: ["stenciljs"]
layout: layouts/post.njk
---

Der [StencilJS-Store](https://stenciljs.com/docs/stencil-store) ist eine tolle Sache. Dabei handelt sich um einen sehr leichtgewichtigen State-Container ähnlich zu [Redux](https://redux.js.org/), [Redux-Zero](https://github.com/redux-zero/redux-zero) oder dem guten alten [$rootScope in AngularJS](https://docs.angularjs.org/api/ng/service/$rootScope). <!-- endOfPreview -->Die Idee hinter diesen Containern basiert auf der Weitergabe von Daten. Ohne einen Store können Daten nur über die Properties übergeben werden. Das kann dazu führen, dass man im schlimmsten Fall den gesamten Hierarchie-Baum der Komponenten hindurchlaufen muss. (Man könnte an der Stelle noch sagen, dass man Daten über Events übergeben könnte. Diese Modell hat sich aber nicht bewährt.)

Man nehme folgende Situation:

Komponente A hat einen Counter und möchte das Ergebnis an ein Kindelement übergeben, das 4 Ebenen tief verwurzelt ist:

Komponente A
-> Komponente B
---> Komponente D
-----> Komponente E

```tsx
@Component({
    tag: "kuba-a",
})
export class A {
    @State() count;
    render() {
        return <kuba-b counter={this.count} />;
    }
}

@Component({
    tag: "kuba-b",
})
export class B {
    @Prop() counter;
    render() {
        return <kuba-c counter={this.counter} />;
    }
}

@Component({
    tag: "kuba-c",
})
export class C {
    @Prop() counter;
    render() {
        return <kuba-d counter={this.counter} />;
    }
}

@Component({
    tag: "kuba-d",
})
export class D {
    @Prop() counter;
    render() {
        return (
            <div>
                <h2>{this.counter}</h2>
            </div>
        );
    }
}
```

Man spricht von Prop-Drilling. Die Daten kommen an, aber alle "Zwischen-Komponenten" (zwischen A und E) müssten das Property _counter_ ebenfalls implementieren. Hier kommt der Store ins Spiel. Ich werde ihn in das Adressbuch integrieren und einen Anwendungsfall skizzieren. Konkret möchte ich die Eingaben des Formulars in den Store ablegen und dann die Liste, bzw. die Tabelle daraus abrufen.

#### Integration

Zuerst muss der Store installiert werden:

```bash
npm install @stencil/store --save-dev
```

Dann erstellen wir eine store Datei:

```ts
// myState.ts
import { createStore } from "@stencil/store";

// hier gibts die Möglichkeit für etwas Typsicherheit.
type myStore = {
    counter: number;
};

// Definition und Vorbelegung mit Default-Werten
const myStore: myStore = {
    counter: 0,
};

// Übergabe an den Store
const { state, on, onChange, get, set, use } = createStore(myStore);

// const  { state } = createStore(myStore); // reicht völlig aus

export default state;
```

Im Gegensatz zur Dokumentation übergebe ich der Funktion _createStore_ nicht direkt das Objekt, sondern definiere es darüber. Zur besseren Anschauung habe ich den dazugehörigen Type drübergeschrieben. Das Ermöglicht deiner IDE die Autovervollständigung und sorgt dafür, dass keine falschen Werte übergeben werden. Die Zeile 14 zeigt die weiteren Funktionen des Stores.

| Funktion |                  Parameter / aufruf                   |                                          Bedeutung                                           |
| -------- | :---------------------------------------------------: | :------------------------------------------------------------------------------------------: |
| state    |                     state.counter                     |               Das Store-Objekt, in dem sich die übergreifenden Daten befinden                |
| on       |     on(EventName, callback) - on("set", ()=>{}))      |               Watcher-Funktion, die auf get, set und reset des Stores lauscht                |
| onChange | onChange(property, callback) - on("counter", ()=>{})) |        Führt ein zu übergebendes Callback aus, sobald sich ein Wert im Store ändert.         |
| get      |            get(property) - get("counter")             |                            Gibt den Wert für das Property zurück                             |
| set      |       set(property, value) - set("counter", 5)        |                                                                                              |
| use      |                 use(...subscription)                  | Eine _subscription_ ist ein oder mehrere Objekte, die get, set und reset implementiert haben |

Das Store-Objekt verhält sich jetzt wie jedes andere Objekt, das aus einer Datei exportiert wird. Der einzige Unterschied ist, dass es den Applikationsscope mit sich trägt. Um beim obigen Beispiel zu bleiben mit den Klassen A,B,C,D würde der State wie folgt übergeben:

```ts
// a.ts
import myState from "./myState";

@Component({
    tag: "kuba-a",
})
export class A {
    inc = () => {
        myState.counter++;
    };

    render() {
        return (
            <div>
                <button onClick={this.inc}>Hochzählen</button>
                <kuba-b counter={myState.counter} />
            </div>
        );
    }
}

// d.ts
import myState from "./myState";
@Component({
    tag: "kuba-d",
})
export class D {
    render() {
        return (
            <div>
                <h2>{myState.counter}</h2>
            </div>
        );
    }
}
```

Wie man sieht, ist das Durchreichen als Property nicht mehr möglich. Die Datenweitergabe ist keine Hierarchy mehr, sondern man könnte sie als Bus sehen, der neben den Komponenten herfährt und bei Bedarf hält. Ein Veränderung des States führt zum Rerendering der betreffenden (den Store importierenden) Komponenten.
Ein kleiner Pitfall beim setzen des States, war dass bei komplexeren Datenstrukturen es nicht reicht den Wert zu setzen, sondern das gesamte Objekt zu überschreiben:

```ts
const myState = {
    a: {
        b: 23,
        c: 34,
    },
    e: 34,
};

myState.a.b = 25; // führt zu keinem Rerender

mystate.a = {
    // führt rerender aus
    ...myState.a,
};
```

Ich möchte den neuen State nicht missen. Zu Beginn von Stenciljs gab es noch einen Statetunnel, der in jede Komponente injiziert werden musste:

```ts
// stateProvider
import { h } from "@stencil/core";
import { createProviderConsumer } from "@stencil/state-tunnel";

export interface State {
    counter: number;
}

export default createProviderConsumer<State>( // eslint-disable-line @stencil/ban-side-effects
    {
        counter: 0,
    },
    (subscribe, child) => (
        <context-consumer subscribe={subscribe} renderer={child} />
    )
);

// sehr verkürzte Darstellung
@Component...
class A {}

Tunnel.injectProps(A, ["counter"]);
```

Die Weiterentwicklung sieht komfortabler aus, ist sehr performant, sehr leichtgewichtig und echt leicht zu bedienen. Ich habe diesen Store in all meinen StencilJS-Projekten im Einsatz.

\
Ihr habt Fragen oder Anregungen? Schreibt mir bei [Twitter](https://twitter.com/der_kuba).
\
\
Tausend Dank fürs Lesen!

Kuba
