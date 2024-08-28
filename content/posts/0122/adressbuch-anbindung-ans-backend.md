---
title: "StencilJS: Anbindung Adressbuch ans Backend"
description: Wie binde ich eine API mit StencilJS an.
date: 2022-01-06
tags: ["stenciljs"]
layout: layouts/post.njk
---

Der letzte Artikel des Jahres 2021 zeigte wie man ein einfache und kleine REST-API mit Koa baute. Diese Backend werde ich heute verwenden, um die Adressbuch-Applikation dran anzubinden.  <!-- endOfPreview -->
Zur Erinnerung, die Adressbuch-Applikation nutzt eine globalen Store, um seine Daten zu speichern. An diesem Punkt werde ich ansetzen. Die Anbindung sieht diese Punkte vor:

-   Beim Öffnen der Seite wird per Request bestehende Kontakte abgefragt
-   Sollten welche vorhanden sein, werden diese in den Store geschrieben
-   Speichern/Editieren sendet einen Request gegen die API, legt,bzw. editiert dort einen (neuen) Kontakt (an).
-   Löschen sendet einen Delete-Request und bekommt die bereinigte Kontaktliste zurück

Da sich die API nun um das Verwalten der Kontakte kümmert, kann man einige Codestellen löschen. Es wird zum Beispiel die Generierung der UUIDS nicht mehr benötigt.

#### Laden der Kontakte

Die Adressbuch-Route _Home_ ist der Einstieg für die Anzeige der Liste. In diese Komponente wird die _kuba-list_ eingehangen. An dieser Stelle sollen die Kontakte abgerufen werden. Wenn man sich den Lifecycle von StencilJS anschaut, findet man dort die Lifecycle-Methode _componentWillRender_. Sie wird immer vor dem Rendering aufgerufen und ist die richtige Stelle für den Request, der alle Kontakte lädt:

```ts
// kuba-home.ts: vereinfacht
import addressStore from "../../store/address-store";

@Component({
    tag: "kuba-home",
    styleUrl: "kuba-home.css",
    shadow: true,
})
export class KubaHome {
    async componentWillRender() {
        try {
            const response = await fetch("http://localhost:3000/contacts");
            if (response.ok) {
                const contacts = await response.json();

                addressStore.contacts = [...contacts];
            }
        } catch (error) {
            console.log(error);
        }
    }
    render() {}
}
```

In die _KubaHome_-Klasse wird die zuvor erwähnte Methode eingefügt. Zusätzlich muss diese als _async_ deklariert werden, damit wir dort mit _await_, bzw. Promises arbeiten können. Für das Ausführen von _HTTP-Request_ verwende ich die [browserinterne Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch). Dort finde ich alle nötigen Funktionen:

```ts
// fetch beispiel
const response = await fetch(url, {
    // HTTP-Request-Methodenarten: GET, POST, PUT, DELETE, etc.
    method: 'POST',
    headers: {
        // welchen Datentyp sende ich ab
      'Content-Type': 'application/json'
    },
    // hier kommen die Daten rein
    // sollten zum header passen
    body: JSON.stringify(data)
  });
}
```

Dieses Request-Skelett nimmt man nun und wendet es auf die GET-Route der Kontakte an:

```ts
const response = await fetch("http://localhost:3000/contacts");
if (response.ok) {
    const contacts = await response.json();

    addressStore.contacts = [...contacts];
}
```

Die Fetch-Funktion bekommt lediglich die URL des Backends übergeben. Idealerweise lagert man diese URL in die Environment Variablen aus, da localhost nur im lokalen Setup läuft. Fürs erste Verständnis reicht es aber so.
Das Response-Objekt hat ein Attribut eingebaut, dass mitteilt, ob der Request erfolgreich war oder nicht _.ok_. Das ist eine Abzweigung, an der man die Daten ausliest oder in der Applikation einen Fehler anzeigt. Ist alles in Ordnung musst man die JSON-Daten noch als Promise abrufen und schreibt die Daten in den globalen Store. Da dies alles vor dem Rendern (blockierend) abläuft, sieht man die Seite erst sobald die Daten da sind. Das ist im Falle einer langsamen Internetleitung ein Problem. Viele Applikationen zeigen eine leere Hülle, eine leere Tabelle oder einen Ladespinner an, solange die Daten geladen werden.

#### Speichern des Kontaktes

Das Speichern findet in der _kuba-address-from.tsx_ statt. Der Unterschied zur bisherigen Implementierung ist, dass nicht mehr zwischen Anlegen oder Editieren unterschieden werden muss. Die Schnittstelle stellt dafür genau eine Route zur Verfügung. Man muss sich auch nicht mehr um die Generierung der ID kümmern. Die Benutzerführung wird dadurch beeinflusst. Wenn man einen neuen Kontakt anlegt und speichert, befindet man sich automatisch im Editieren-Modus. Wenn man einen weiteren Kontakt anlegen möchte, muss man über die Hauptseite zurück navigieren.

```ts
  private onSubmit = async () => {

    const id =
      this.idState === undefined
        ? this.match?.params.id
          ? this.match?.params.id
          : null
        : this.idState;

    let data = {
      firstName: this.firstNameState,
      lastName: this.lastNameState,
      address: this.addressState,
      id: id,
    };

    const contactResponse = await fetch("http://localhost:3000/contacts", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (contactResponse.ok) {
      const contact = await contactResponse.json();
      this.addressState = contact.address;
      this.firstNameState = contact.firstName;
      this.lastNameState = contact.lastName;
      this.idState = contact.id;
    }
  };
```

Die Anbindung an die API erfolgt in der Submit-Methode des Speichern-Knopfes. Die ID des Kontaktes wird aus dem State gelesen. Sollte dieser Leer sein, wird in der URL nachgeschaut und dort die ID ausgelesen. Sollte beide Fälle leer sein, wird die ID mit "null" belegt. Die Daten der Felder werden aus den entsprechenden State-Felder ausgelesen und der bekannten Fetch-Funktion übergeben. Die Methode der Fetch-Funktion ist diesmal "POST". Damit kann das Backend die Routen unterscheiden. Wenn ein Request erfolgreich war, werden die State-Felder mit dem zurückgegebenen Kontakt aus der API gefüllt. An dieser Stelle könnte man eine Benachrichtigung für den Nutzer einbauen.

#### Löschen des Kontaktes

Die Funktionalität zum Löschen eines Kontaktes befindet sich in der _kuba-list.tsx_-Datei. Bisher wurde anhand der übergebenen ID das Kontakt-Array im Store durchsucht und der dazugehörige Eintrag entfernt.

```ts
deleteContact = async (id: string) => {
    // alte Implementierung
    // const filteredArray = addressStore.contacts.filter(
    //   (item) => item.id !== id,
    // );
    // addressStore.contacts = filteredArray;

    const response = await fetch(`http://localhost:3000/contacts/${id}`, {
        method: "DELETE", // *GET, POST, PUT, DELETE, etc.
    });

    if (response.ok) {
        const newContactList = await response.json();
        addressStore.contacts = [...newContactList];
    }
};
```

Die API funktioniert so, dass nachdem man einen DELETE-Request gesendet hat, die neue Kontaktliste zurückgeliefert wird. So muss nur die Kontaktliste im Store aktualisiert werden.

#### Fazit

Die Änderungen zur Anbindung des Backends sind nicht sehr umfangreich, aber haben eine weitreichende Konsequenz. Die Datenhaltung wurde aus der Hand des Frontends gegeben. Die Komplexität der Logik, aber auch der Datenspeicherung und Verwaltung gehören den Problemen des Backends an.

Ihr habt Fragen oder Anregungen? Schreibt mir bei [Twitter](https://twitter.com/der_kuba).
\
\
Tausend Dank fürs Lesen!

Kuba
