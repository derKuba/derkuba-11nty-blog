---
title: "StencilJS-Tutorial: Routing"
description: Wie man zwischen den Seiten hin und herschaltet
date: 2021-07-10
tags: ["stenciljs"]
layout: layouts/post.njk
---

Wir können eigene Komponenten erstellen und haben dazu das StencilJS-Starter-Projekt genutzt. Nun wollen wir etwas aufräumen und uns um das Thema Routing kümmern. <!-- endOfPreview -->Das Starter-Projekt nutzt für dieses Thema den _ionic-team/stencil-router_. Hierbei handelt es sich um ein offizielles Release der Entwickler hinter StencilJS. Aber ich bitte um _VORSICHT_. Das Thema Routing wird vom Ionic-Team sehr stiefmütterlich behandelt und nicht aktiv weiterentwickelt. (Die letzten Commits)[https://github.com/ionic-team/stencil-router] liegen Jahre zurück. Es gibt auch ein weiteres (experimentelles Release _stencil-router-v2_)[https://github.com/ionic-team/stencil-router-v2], aber auch das wird nicht aktiv gepflegt.
Beide Router verfügen über die Grundfunktionalität. Wenn etwas darüber hinaus benötigt wird, muss es selber hinzugefügt oder von Grund auf neu entwickelt werden. Für unsere Zwecke reicht die erste Variante.

Die bisherige Navigationsstruktur sah aus wie folgt:

app-root.tsx // beinhaltet den router
-> app-home.tsx // route für "/"
-> app-profil.tsx // route für /profil

Da wir ein eigenes Namespace nutzen, habe ich diese zwei Route samt dazugehörigen Ordner gelöscht. Über den "generate" Befehl ( _npm run generate ...._) lege ich mir neue Komponenten samt Ordner an:

-   kuba-home
-   kuba-list

Diese müssen nun angesteuert werden können. In der _app-route.tsx_ liegt die Konfiguration dafür vor und sieht aus wie folgt:

```tsx
// render()
<stencil-router>
    <stencil-route-switch scrollTopOffset={0}>
        <stencil-route url="/" component="kuba-home" exact={true} />
        <stencil-route url="/address-list" component="kuba-home" exact={true} />
        <stencil-route url="/contact/:id" component="kuba-address-form" />
        <stencil-route url="/contact" component="kuba-address-form" />
    </stencil-route-switch>
</stencil-router>
```

Der _stencil-router_ bekommt eine _stencil-route-switch_ Komponente übergeben. Diese wiederum hat die Routen als Komponenten im Bauch.
Die Stencil-Route hat folgende Konfigurationsmöglichkeiten:

| Konfiguration  |                           Bedeutung                            |
| -------------- | :------------------------------------------------------------: |
| url            |         Beschreibung der route, zb. "/meine-route/:23"         |
| component      |            welche Komponente soll angezeigt werden             |
| componentProps | Mögliche Übergabe von Parametern für die angegebene Komponente |
| exact          |             die URL soll exakt der Angabe gleichen             |
| routeRender    |     Alternative für component. Direkter Aufruf von Render.     |

Wie wir in der Tabelle ablesen können, haben wir damit zwei Möglichkeiten der Route mitzuteilen was gerendert werden soll.

Nehmen wir einmal die _kuba-home.tsx_:

```tsx
import { Component, Host, h } from "@stencil/core";

@Component({
    tag: "kuba-home",
    styleUrl: "kuba-home.css",
    shadow: true,
})
export class KubaHome {
    render() {
        return (
            <Host>
                <h1>Kuba-Home</h1>

                <kuba-list></kuba-list>
            </Host>
        );
    }
}
```

Um diese anzusteuern brauchen wir die Route:

```tsx
 <stencil-route url="/" component="kuba-home" exact={true} />
 // oder
<stencil-route url="/" exact={true} routeRender={
    (props: { [key: string]: any}) => {
        return <div>
                <h1>Kuba-Home</h1>
                <kuba-list></kuba-list>
            </div>;
        }
  } />
```

Die zweite Möglichkeit finde ich etwas unschön. Aber ich wollte sie trotzdem aufzeigen.

In der Kuba-Home-Komponente befindet sich die Kuba-List. In dieser wird die Tabellen-Komponente integriert. Es gibt einen Link um einen neuen Kontakt hinzuzufügen und man soll über einen "Editier-Button" in der Tabelle auf ein vorausgefülltes Formular weitergeleitet werden.

Dieses Routing ermöglichen wir über diese Konfiguration. Wir nutzen die bestehende Komponente _kuba-address-form_, die das Formular beinhalten wird und die zwei Routen

-   /contact -> für das Anlegen eines neuen Kontakts
-   /contact/:id -> für die Detailansicht und editieren eines bestehenden Kontakts

```tsx
<stencil-route url="/contact/:id" component="kuba-address-form" />
<stencil-route url="/contact" component="kuba-address-form" />
```

Beim Aufruf der Anwendung wird immer die Kuba-Home-Komponente aufgerufen. Um jetzt eine Weiterleitung auf die weiteren Routen zu ermöglichen benötigen wir eine Verlinkung.

```tsx
<stencil-route-link url="/contact" activeClass="link-active">
    Neu
</stencil-route-link>

<stencil-route-link url="/contact/23" activeClass="link-active">
    Editieren
</stencil-route-link>

<stencil-route-link url="/" activeClass="link-active">
    Zurück
</stencil-route-link>
```

Mit diesen drei Links können wir nun vor- und zurücknavigieren.

Jetzt fehlt nur noch die Möglichkeit an die ID aus dem Editierlink zu kommen. Diese ID wird benötigt, um die richtigen Daten des Kontaktes abzufragen.

Um an die URL-Parameter zu gelangen, muss der Component-Klasse das Property _match_ vom Typ MatchResults hinzugefügt werden:

```tsx
import { MatchResults } from "@stencil/router";

...
 @Prop() match: MatchResults;
...
```

Wenn man dieses Property in der Klasse hat, werden die URL-Parameter in diese Variabel injiziert. Wenn die Route Daten übergeben bekommen hat, erhält man nun Zugriff darauf:

```tsx
// /route/:id
this.match.params.id;

// /route/:hello
this.match.params.hello;

// /route/:datensatz
this.match.params.datensatz;
```

Weitere Möglichkeiten zum Übertragen von Daten oder Suchparameter findet ihr hier:

https://github.com/ionic-team/stencil-router/wiki/Passing-data-to-routes

Mit dem neuen Wissen haben wir jetzt eine navigierbare Seite. Diese Seiten haben zudem die Möglichkeit Daten auszutauschen. In den nächsten Schritten wird das Formular durch weitere Felder ergänzt, die Möglichkeit geschaffen die eingegebenen Daten in einen globalen Scope zu schreiben, die Applikation getestet und ein kleines Backend ergänzt.

Der Code hierzu liegt auf [Github](https://github.com/derKuba/stenciljs-tutorial). Um es auf diesen Stand zu bringen, müsst ihr das Projekt klonen und einmal auf den Tag 1.0.2 auschecken:

Ihr habt Fragen oder Anregungen? Schreibt mir bei [Twitter](https://twitter.com/der_kuba).
\
\
Tausend Dank fürs Lesen!

Kuba
