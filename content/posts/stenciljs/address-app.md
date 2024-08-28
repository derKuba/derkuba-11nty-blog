---
title: "StencilJS-Tutorial: das Adressbuch"
description: Alles Gelernte zusammengefasst in einer App
date: 2021-08-05
tags: ["stenciljs"]
layout: layouts/post.njk
---

Die bisherigen Tutorials haben jetzt alle nötigen Bausteine von StencilJS vorgestellt, die wir für unsere Adressbuch-Applikation benötigen. In diesem Artikel werden die diese nun verwendet, um ein funktionierendes Adressbuch zu bauen<!-- endOfPreview -->:

| Baustein               |                    Funktion                    |                                                                     Verwendung                                                                      |
| ---------------------- | :--------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------: |
| Router                 |  Steuert den Seitenverlauf und die Navigation  |                         [weiterleitung auf /, /contacts, /addresslist](https://derkuba.de/content/posts/stenciljs/routing/)                         |
| Class-Komponenten      | Aufbau, Struktur und Funktion einer Komponente | [Visuelle Elemente mitsamt Interaktion: Input-Felder, Buttons, Seitenrahmen ](https://derkuba.de/content/posts/stenciljs/erste-stencil-komponente/) |
| Functional-Komponenten |   Schlanke Alternative zur Class-Komponente    |                            [Beispielhafte Verwendung](https://derkuba.de/content/posts/stenciljs/functional-component/)                             |
| Store                  |              Applikationszustand               |                            [Datenaustausch zwischen den Komponenten](https://derkuba.de/content/posts/stenciljs/stores/)                            |
| Entwicklerwerkzeuge    |    Einheitlicher Code mit Qualitätsanspruch    |                            [Kleine, aber feine Helfer](https://derkuba.de/content/posts/stenciljs/entwicklerwerkzeuge/)                             |

Die Applikation ist aufgebaut wie im folgenden Bild beschrieben:
![adress app](/content/img/stenciljs-tutorial/address-app.png "das Addressbuch")<div class="has-text-right image-subline">Bild 1: Die Address-App</div>
Es gibt 4 Routen, die auf 2 Komponenten zeigen. Die ersten beiden Routen (**"/"** und **"/address-list"**) zeigen auf die _kuba-home_-Komponente, die die Liste darstellt. Die nächsten beiden Routen (**"/contact"** und **"/contact/:id"**) zeigen auf die _kuba-address-form_-Komponente, die das Eingabeformular darstellt.

#### Die Kontakt-Liste

Die grundlegende Funktion der Listenseite ist die Anzeige aller bestehenden Kontakte. Dafür ist diese Komponente an den Store angebunden, der diese Kontakte beinhaltet. Zusätzlich gibt es die Möglichkeit auf die Detailseite zu kommen. Es gibt eine "Neu-Anlegen-Seitenleeres" mitsamt leeren Formular und eine "Editier-Seite" mit vorausgefülltes Formular. Die Komponenten sind so geschachtelt, dass die _kuba-home_, die _kuba-list_ inkludiert und diese wiederum, die [_kuba-table-options_-Komponente](https://derkuba.de/content/posts/stenciljs/tabellen-komponente/) verwendet.

```ts
// kuba-home.tsx
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

Die KubaHome-Komponente dient als Hülle für die Liste. Man hat hier noch zusätzliche Platz für Texte oder zum Styling. Darauf habe ich aus Übersichtsgründen verzichtet.
Der interessante Teil ist die _kuba-list_-Komponente:

```ts
import { Component, Host, h } from "@stencil/core";

import addressStore from "../../store/address-store";

@Component({
    tag: "kuba-list",
    styleUrl: "kuba-list.css",
    shadow: true,
})
export class KubaList {
    deleteContact = (id: string) => {
        const filteredArray = addressStore.contacts.filter(
            (item) => item.id !== id
        );
        addressStore.contacts = filteredArray;
    };

    render() {
        return (
            <Host>
                <stencil-route-link url="/contact" activeClass="link-active">
                    Neuer Kontakt
                </stencil-route-link>
                <hr />

                <kuba-table-options
                    delete={this.deleteContact}
                    key={addressStore.contacts.length}
                >
                    <kuba-table-options-head>
                        <option value="id" />
                        <option value="name" />
                        <option value="vorname" />
                        <option value="aktion" />
                    </kuba-table-options-head>
                    <kuba-table-options-body>
                        {addressStore.contacts.map((row) => [
                            <option value={row.id} />,
                            <option value={row.firstname} />,
                            <option value={row.lastName} />,
                            <option value={row.id} />,
                        ])}
                    </kuba-table-options-body>
                </kuba-table-options>
                <hr />
            </Host>
        );
    }
}
```

Herzstück der Komponente ist die [Tabellen-Komponte](https://derkuba.de/content/posts/stenciljs/tabellen-komponente/). In den Zeilen 29-34 sieht man wie der Tabellenkopf definiert wird. Es werden 4 Zeilen deklariert (ID, Name, Vorname und Aktion). Das Aktionsfeld beinhaltet Operatoren für die Zeile ( Löschen und Editieren). Die Zeile 20-22 zeigen den Link auf die leere Formularseite.
Der Kopf der Tabellen-Komponente beinhaltet noch 2 Props. Das _delete_-Property ist ein Callback, das gefeuert wird, sobald man auf die Aktionstaste "löschen" klickt. Das Key-Property wird benötigt, damit StencilJS merkt, dass sich etwas geändert hat und ein Rerender ansteuert. Ohne das Key, müsste man vor- und zurücknavigieren, um ein rerender zu erzwingen. Die "deleteContact"-Funktion (Zeile 11-16) manipuliert das Store-Objekt und löscht anhand der übergebene ID den Kontakt aus dem Store-Listen-Objekt. Die Weiterleitung auf das Editier-Formular geschieht über die übergebene ID an Zeile.

#### Das Adress-Formular

Die Adress-Komponente hat zwei Einstiegsmodi. Einmal mit übergebener ID und einmal ohne. In Abhängigkeit von dieser ID befinden wir uns auf der "neue Kontakt"-Seite oder auf der "Editier-Seite". Damit eingehend haben wir zwei Grundfunktionen:

1. Speichern der eingegebenen oder veränderten Daten
2. Anzeigen bestehender Daten im Formular

**1. Speichern der eingegebenen Daten:**
In meinem Beispielprojekt verwende ich nur 3 Eingabefelder. Mehr Felder können mit etwas Copy&Paste hinzugefügt werden. Für diese 3 Felder habe ich _States_ angelegt:

```tsx
  @State() addressState: string;
  @State() firstNameState: string;
  @State() lastNameState: string;

  // Zusatzfeld ID, das aber nicht angezeigt wird
  @State() idState: string;
```

Die States finden sich im HTML wieder. Jedes Feld wird von einem Input repräsentiert. Die Input-Komponenten [**kuba-input**](https://derkuba.de/content/posts/stenciljs/erste-stencil-komponente/) und [**KubaInputFunctional**](https://derkuba.de/content/posts/stenciljs/functional-component/) wurden in den vorherigen Tutorials gebaut.

```typescript
<kuba-input
    componentId="first-name"
    label="Vorname:"
    onInputEvent={this.onChangeFirstName}
    value={this.firstNameState}
></kuba-input>

<kuba-input
    componentId="last-name"
    label="Nachname:"
    onInputEvent={this.onChangeLastName}
    value={this.lastNameState}
></kuba-input>

<KubaInputFunctional
    componentId="street"
    label="Adresse:"
    value={this.addressState}
    type={"text"}
    setter={this.onChangeAddress}
></KubaInputFunctional>
```

Die Attribute der Komponenten sind selbsterklärend. Die einzige Auffälligkeit ist der "Setter", bzw. das "onInputEvent". Ersteres ist ein Callback das reingereicht wird, das auf das _onInput_-Event des HTML-Inputs lauscht. Das "onInputEvent" widerum lauscht auf genau dieses Input-Event, das von der _kuba-input_ gefeuert wird. Beide Funktionen werden bei jedem Tastenanschlag innerhalb des Inputs gefeuert.

Die eingegebenen Daten müssen, damit sie in der Tabelle auf der ersten Seite angezeigt werden können, in das Store-Objekt geschrieben werden. Dies geschieht in den _setter-Funktionen_:

```typescript
// am Anfang der Datei
import addressStore from "../../store/address-store";

// innerhalb der Klasse

// setzen des Vornamens
private onChangeFirstName = ({
    detail: { value },
}: {
    detail: { value: string };
}) => {
    this.firstNameState = value;
};

// setzen des Nachnamens
private onChangeLastName = ({
    detail: { value },
}: {
    detail: { value: string };
}) => {
    this.lastNameState = value;
};

// setzen der Adresse
private onChangeAddress = ({
    value,
}: {
    value: string;
}) => {
    this.addressState = value;
};
```

Wie man oben sieht wird einfach der bestehende Wert durch den neuen Wert überschrieben.

**Werte speichern**
Es existiert ein klassischer Speichern-Button, der _onClick_ eine Funktion ausführt:

```ts
<kuba-button handleSubmit={this.onSubmit}>speichern</kuba-button>
```

Diese _onSubmit_-Funktion teilt sich in zwei Teile. Wie oben beschrieben in _Neu_ und _Editieren_.
Wenn man einen neuen Kontakt anlegt, brauchen wir zum eindeutigen Zuweisen eine ID. Dafür habe ich mir eine Funktion ausgeliehen, die wir als Blackbox-Funktion behandeln (Aufbau und Funktionalität interessieren uns nicht - sie tut was sie soll). Sie wird aufgerufen und gibt uns eine eindeutige Id.

```ts
// erzeuge eindeutige ID
const uuid = this.create_UUID();

// füge die Inhalte der einzelnen States in ein Objekt.
addressStore.contacts.push({
    firstname: this.firstNameState,
    lastName: this.lastNameState,
    id: uuid,
    address: this.addressState,
});

// StencilJS triggert ein Neurendern nur bei neuen Objekten
addressStore.contacts = [...addressStore.contacts];
```

Wie der obige Code zeigt, holen wir uns eine ID und fügen anschließend dem Array aus dem Store ein weiteres Objekt hinzu. Die Zeile 13 ist dabei noch interessant. Der Kommentar beschreibt den Grund. Der Store von Stenciljs bekommt die Änderung zwar mit, aber das Framework triggert keinen Rerender. Daher wird eine neue Referenz in _addressStore.contacts_ hinterlegt, bzw. eine Kopie des bestehenden Arrays. Wenn wir nun zurück klicken würden, würden wir einen neuen Antrag in der Tabelle sehen.

**Anzeigen und editieren bestehender Daten:**
Für die Anzeige und editieren bestehender Daten müssen wir aus der URL den Parameter auslesen. Dabei hilft uns die Router-API. Mithilfe von der Property match vom Typ _MatchResults_.

```tsx
// Klassenproperty
@Prop() match: MatchResults;

// Aufruf des Parameters aus dem Pattern /contacts/:id
this.match.params.id
```

Dies brauchen wir im zweiten Teil der _onSubmit_-Funktion
Wenn in der _this.match.params.id_ eine ID vorhanden ist, befinden wir uns im Editier-Modus und gehen davon aus, dass der Store bereits einen Eintrag mit genau dieser ID enthält. Wir müssen nun an die Stelle im Array iterieren und die Werte ersetzen:

```ts
addressStore.contacts.forEach((contact, index) => {
    if (contact.id === this.match.params.id) {
        addressStore.contacts[index] = {
            ...addressStore.contacts[index],
            firstname: this.firstNameState,
            lastName: this.lastNameState,
            address: this.addressState,
        };
    }
});
```

Gehen wir nun wieder zurück und schauen in die Tabelle. Haben wir andere Werte im Formular eingetippt, spiegelt sich dies nun wieder.

Für eine bessere Übersicht zeige ich im folgenden die gesamte Funktion:

```ts
  private onSubmit = () => {
    if (this.match.params.id === undefined) {
      const uuid = this.create_UUID();

      addressStore.contacts.push({
        firstname: this.firstNameState,
        lastName: this.lastNameState,
        id: uuid,
        address: this.addressState,
      });
      addressStore.contacts = [...addressStore.contacts];

      this.firstNameState = "";
      this.lastNameState = "";
      this.idState = "";
      this.addressState = "";
    } else {
      addressStore.contacts.forEach((contact, index) => {
        if (contact.id === this.match.params.id) {
          addressStore.contacts[index] = {
            ...addressStore.contacts[index],
            firstname: this.firstNameState,
            lastName: this.lastNameState,
            address: this.addressState,
          };
        }
      });
    }
  };
```

Ich habe die Zeilen 13-16 in der obigen Beschreibung ausgelassen. In diesen Zeilen lösche ich die Eingabe nach dem Speichern. Sodass man direkt weiter neue Kontakte hinzufügen kann.

Für das Anzeigen bestehender Daten verwende ich die StencilJS-Lifecycle Methode _connectedCallback_. Diese wird genau einmal aufgerufen, beim Initiieren der Klasse. Der Router kümmert sich um das Erzeugen und Abräumen der Klasse und es ist eine geeignete Stelle, um die Daten aus dem Store zu laden und die dazugehörigen States zu setzen. Die Bedingung für das Setzen ist das Vorhandensein der ID in der URL :

```ts
  connectedCallback() {
    addressStore.contacts.forEach((item) => {
      if (item.id === this.match.params.id) {
        this.addressState = item.address;
        this.firstNameState = item.firstname;
        this.lastNameState = item.lastName;
        this.idState = item.id;
      }
    });
  }
```

Fertig ist die erste kleine Applikation, die die Anforderungen aus der Einleitung erfüllt. Sie verwendet alle gelernten Bausteine und funktioniert wie gefordert. Natürlich hat sie einige unschöne Abläufe:

-   beim Laden der Seite verschwinden alle Daten
-   kein Nutzerfeedback, dass etwas gespeichert wurde.
-   kein einziger Unit-Test
-   allgemein nicht gestyled

An diesen Macken wollen wir noch arbeiten und das in den kommenden Artikeln.

Der Code hierzu liegt auf [Github](https://github.com/derKuba/stenciljs-tutorial/releases/tag/1.0.3). Um es auf diesen Stand zu bringen, müsst ihr das Projekt klonen und einmal auf den Tag 1.0.3 auschecken:

Ihr habt Fragen oder Anregungen? Schreibt mir bei [Twitter](https://twitter.com/der_kuba).
\
\
Tausend Dank fürs Lesen!

Kuba
