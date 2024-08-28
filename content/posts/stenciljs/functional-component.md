---
title: "StencilJS-Tutorial: Functional Component"
description: Was ist eine Function Component. Eine alternative zur Klasse
date: 2021-07-24
tags: ["stenciljs"]
layout: layouts/post.njk
---

Die _functional component_ oder _stateless component_ stellt eine alternative Schreibweise für die StencilJS-Komponente dar. Die Komponente ist dadurch leichtgewichtiger. Aber man verzichtet auch an etwas Funktionalität. <!-- endOfPreview --> Ich habe aus meinem Adressbuch-Projekt die _kuba-input.tsx_ in eine _functional component_ übertragen:

```tsx
// kuba-input-functiona.tsx
import { h } from "@stencil/core";

export const KubaInputFunctional = ({
    componentId,
    label,
    type = "text",
    value,
}: {
    componentId: string;
    label: string;
    type: "text" | "number";
    value: string;
}) => {
    const onInput = (event) => {
        event.document.target.dispatchEvent(
            new CustomEvent("inputEvent", {
                detail: { value: event.target.value },
            })
        );
    };
    return (
        <div class="kuba-input">
            <label htmlFor={componentId}>{label}</label>
            <input
                type={type}
                id={componentId}
                value={value}
                onInput={onInput}
            />
        </div>
    );
};
```

Wie man sieht ist es keine Klasse, sondern ein Funktionsaufruf. Die Properties werden als Parameter übergeben. Die Methoden können als const variablen definiert und dann übergeben werden und sie gibt ein TSX-Element zurück.

Die Komponente kann über folgende Zeilen eingebunden werden:

```tsx
// jede beliebige andere tsx-Datei
import { KubaInputFunctional } from "../kuba-input/kuba-input-functional";

<KubaInputFunctional
    componentId="street"
    label="Straße:"
    value={"Musterstreet"}
    type={"text"}
></KubaInputFunctional>;
```

Der Aufruf erfolgt über den Funktionsnamen und agiert dann wie eine gewöhnliche Komponente.

Ich habe die wesentlichen Unterschiede in eine Tabelle gepackt und werde diese im Anschluss einzeln nochmal erklären:

| Class Component                  |                  Functional Component                   |
| -------------------------------- | :-----------------------------------------------------: |
| Schwergewichtig                  |                     leichtgewichtig                     |
| lifecycles                       |                    keine lifecycles                     |
| State                            |                        Stateless                        |
| Aufruf über Annotation steuerbar |               Aufruf über Funktionsnamen                |
| Können schnell Komplex werden    | Sollten einfach gehalten werden, sonst weiter aufspalte |
|                                  |                    leicht zu testen                     |

#### Leichtgewichtig

Es wird keine Klasse und auch keine Annotation benötigt. Daher ist weniger Schreibaufwand nötig. Das Ziel ist sehr kleine Funktionen zu schreiben. Zuviel Code ist ein Indikator dafür, dass die Funktion weiter aufgespalten werden sollte.

#### Stateless

So hat die _stateless component_ keinen eigenen State und muss über die Elternkomponente gesteuert werden. Das wiederum erleichtert die Umsetzung des Container-Pattern.

( Kleiner Exkurs: Das Container-Pattern habe ich bei der React-Entwicklung kennengelernt. Es beschreibt die Trennung innerhalb von Komponenten in Aussehen und Verhalten. Die Elternkomponente besitzt den State, macht die Datentransformation und gibt alle nötigen Props an das Kind weiter. Das Kindelement hat keinen eigenen State und bekommt den Zustand über seine Props mitgeteilt.)

#### Keine Lifecyle-Methoden

Man hat keinen Zugriff auf die [Lifecyle-Methoden](https://stenciljs.com/docs/component-lifecycle). Das sorgt zusätzlich dafür, dass die Komponenten nicht zu komplex werden.

### Fazit

Ich benutze gerne und häufig diese Art der Komponenten. Sie sind schnell zu schreiben, leicht zu verstehen und auch einfach zu testen (Das Thema testen wird ausgiebig in einem späteren Artikel behandelt). Der Einsatz ist jederzeit zu empfehlen.

\
Das Codebeispiel findet ihr auf [Github/derKuba](https://github.com/derKuba/stenciljs-tutorial/blob/main/address-book/src/components/kuba-input/kuba-input-functional.tsx).

\
Ihr habt Fragen oder Anregungen? Schreibt mir bei [Twitter](https://twitter.com/der_kuba).
\
\
Tausend Dank fürs Lesen!

Kuba
