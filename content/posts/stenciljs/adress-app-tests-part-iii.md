---
title: "StencilJS-Tutorial: Real World Unit Tests Teil 3"
description: Module mocking
date: 2021-09-03
tags: ["stenciljs", "testing", "jest"]
layout: layouts/post.njk
---

Im vorherigen Artikel haben wir gelernt wie man einzelne Funktionen wegmockt. In einer Komponente befinden sich häufig auch viele importierte Fremdbibliotheken. Ich verlasse mich immer drauf, dass diese getestet sind und möchte diese auch nicht in meinen Tests erneut testen.
In diesem Artikel zeige ich wie man damit umgeht. <!-- endOfPreview -->Als kleinen Zusatz zeige ich noch auf, wie man mit Timeouts umgeht.

#### Module mocken

Jest hat die Möglichkeit den gesamten Import wegzumocken und eine alternative Implementierung anzubieten. Anstatt einen vielleicht komplizierten Algorithmus auszuführen, entscheide ich selber wie die importe Funktion sich verhalten soll.

Schauen wir uns mal ein Beispiel aus unserer Adressbuch-Applikation an. In der Komponente _kuba-address-form_ benötigen wir beim Anlegen eines neuen Kontakts eine ID, um den Kontakt in den Daten zu identifizieren. Dafür habe ich mir eine Funktion ausgeliehen. Wie sie funktioniert interessiert mich nicht. Sie liefert eine UUID zurück und das reicht mir. Die Funktion liegt in einer eigenen Datei und wird in die Komponente importiert. Daneben liegt auch noch der Store, der auch importiert wird. Diesen möchten wir auch nicht direkt im Test verwenden.

```ts
import { create_UUID } from "./utils/create-uuid";
import addressStore from "../../store/address-store";

...

private onSubmit = () => {
    const uuid = create_UUID();
     addressStore.contacts.push({
        firstName: this.firstNameState,
        lastName: this.lastNameState,
        id: uuid,
        address: this.addressState,
      });
}
...
```

Wir sehen hier die Funktion _create_UUID_ aus dem Pfad _/utils/create-uuid_. Es handelt sich um eine selbstgeschriebene Funktion, die auch eigenständig getestet wurde. Sie liefert bei jedem Aufruf eine neue ID zurück und das macht uns beim Test Probleme. Wir bekommen damit keine vergleichbare Daten mehr, da sich die ID nach jedem Aufruf erneuert.
Wir greifen anschließend auf das Store-Objekt zu und beschreiben diese mit den eingegebenen Werten.

Der Test ist so aufgebaut, dass immer zuerst die zu importierenden Module/Funktionen überschrieben werden müssen und erst DANACH wird die zu testende Komponente importiert. Wenn man das umdreht, bekommt die Komponente nicht mehr mit, dass die Importe gemockt wurden. Das ist ein sehr, sehr häufiger Fehlerfall.

Jest bietet für das Überschreiben, bzw. [Mocken von Modulen die jest.mock()-Funktion](https://jestjs.io/docs/mock-functions#mocking-partials). Ich gehe dabei immer so vor, dass ich das zu importierende Modul mocke und direkt eine Implementierung anbiete:

```ts
jest.mock("../utils/create-uuid", () => {
    const originalModule = jest.requireActual("../utils/create-uuid");
    return {
        __esModule: true,
        ...originalModule,

        create_UUID: () => "uuid",
    };
});

const addressStoreMock = {
    contacts: [],
};
jest.mock("../../../store/address-store", () => ({
    __esModule: true,
    default: addressStoreMock,
}));
```

Die Zeilen 1-11 zeigen die genaue Syntax. Der erste Parameter von jest.mock ist der Pfad zum Import. Der zweite Parameter ist eine Funktion, die das Original-Modul lädt und im Return-Statement alle (nicht vorhandenen Funktionen) destrukturiert. Wir überschreiben hierbei die ( einzige ) Funktion des Moduls _create_UUID_. Der aufmerksame Leser wird bemerkt haben, dass die Zeile 2 und 5 keinen wirklichen Sinn macht und dass man sie auch weglassen kann. Das ist korrekt. Ich möchte hier zeigen, wie man nur bestimmte Teile des Moduls mockt. Die Funktion _create_UUID_ wird überschrieben und liefert jetzt bei jedem Aufruf nur "uuid" zurück. Damit ist sichergestellt, dass die Daten vergleichbar sind.

Die Zeilen 14-16 zeigen wie man einen Default-Import überschreibt. Die Zeilen davor sind für ein einfaches Modul-Export. Wir erzeugen ein einfaches Objekt, das eine Property contacts hat und übergeben es dem Default. Damit haben wir den Store überschrieben und haben durch die Variable _addressStoreMock_ Zugriff auf den Store und können ihn für jeden Test anpassen. An der Stelle rufe ich zur Vorsicht auf. Das Store Objekt kann von jedem Test angefasst werden und man läuft schnell in eine Abhängigkeit der Reihenfolge der Tests. Ich empfehle den Store vor jedem Test zurückzusetzen:

```ts
describe("kuba-address-form", () => {
    beforeEach(() => {
        addressStoreMock.contacts = [];
    });
});
```

Jetzt kann man einfach drauf lostesten. Der Test der ein Submit eines neuen Kontaktes testet, sieht dann so aus:

```ts
it("should submit the form on new Contact", async () => {
    const addressForm = new KubaAddressForm();
    addressForm.firstNameState = "Max";
    addressForm.lastNameState = "Muster";
    addressForm.addressState = "HalloWeltWeg 23";
    addressForm.onSubmit();

    expect(addressStoreMock.contacts).toEqual([
        {
            address: "HalloWeltWeg 23",
            firstName: "Max",
            id: "uuid",
            lastName: "Muster",
        },
    ]);
});
```

Durch die geleistete Vorarbeit ist der Test ganz einfach. Zeile 12 zeigt, dass wir uns auf das von der Funktion _create_UUID_ überschriebene "uuid" verlassen können. Der gemockte Store enthält nach Aufruf der Submit-Methode einen weiteren Eintrag mit den erwarteten Werten. Als Matcher habe ich _.toEqual_ verwendet, weil wir hier nicht auf die Gleichheit der Referenz, sondern des Inhalts überprüfen.

#### Weitere Testfälle

**Kontakt editieren**

Um in den Kontakt editieren Fall im Code zu gelangen, benötigt man eine ID in der URL. Doch wie bekommt man das im Test hin? Die Funktionalität kommt ja aus dem Framework Stencil-Router. Doch sie benutzt Stencil-Bordmittel. Die ID kommt aus dem Property _match_ vom Typ Matchresult. Genau da setzen wir an:

```ts
it("should submit the form on Contact edit", async () => {
    // init
    addressStoreMock.contacts.push({
        id: "14",
        firstName: "Max",
        lastName: "Muster",
        address: "Musterstraße 44",
    });

    const addressForm = new KubaAddressForm();

    // hier steht die Lösung
    addressForm.match = {
        ...addressForm.match,
        params: {
            id: "14",
        },
    }; //////////////////////

    addressForm.firstNameState = "Maximilian";
    addressForm.lastNameState = "Neumuster";
    addressForm.addressState = "Musterstraße 44";
    addressForm.onSubmit();

    expect(addressStoreMock.contacts).toEqual([
        {
            address: "Musterstraße 44",
            firstName: "Maximilian",
            id: "14",
            lastName: "Neumuster",
        },
    ]);
});
```

Wir instanziieren die _KubaAddressForm_. In Zeile 12-18 überschreiben wir mit Hilfe des Spread-Operators das Match-Objekt und geben dem Feld _params_ noch das Feld _id_. Damit läuft die Implementierung in den _else_-Fall und wir können wie gewohnt Daten vergleichen.

**Lifecycle-Methoden**

Stenciljs hat einige Laufzeit-Methoden, mit denen man in das Rendering eingreifen kann. Ich verwende zum Laden der Daten aus dem Store anhand der übergebenen ID die Methode _connectedCallback_. Diese wird aufgerufen wenn die Komponente initialisiert oder wieder angehängt wird und vor dem Aufruf der Render-Methode. Damit bleibt genug Zeit die Daten zu laden und in den State zu schreiben. Weitere Laufzeitmethoden sind zum Beispiel _componentWillLoad_, _componentWillRender_ oder _componentDidRender_. Wer sich für weitere interessiert wird [in der Doku fündig.](https://stenciljs.com/docs/component-lifecycle).

Doch wie bringe ich den Test dazu genau diese Methode auszuführen. Nach viel recherchieren und ausprobieren gehe ich immer so vor. Die Lifecycle Methode ist eine einfache Methode der Klasse. Genau so behandle ich sie auch:

```ts
...
// implementierung
connectedCallback() {

    addressStore.contacts.forEach((item) => {
        if (item.id === this.match.params.id) {
        this.addressState = item.address;
        this.firstNameState = item.firstName;
        this.lastNameState = item.lastName;
        this.idState = item.id;
        }
    });
    this.logger("connectedCallback");
}
...

it("should trigger connectedCallback", async () => {

    //init
    ...

    // rufe die Methode direkt auf

    // hier laufen wir in den else Block
    addressForm.connectedCallback();

    addressForm.match = {
        ...addressForm.match,
        params: {
        id: "23"
        }
    }

    // hier sind wir im if
    addressForm.connectedCallback();

    // jetzt erwarten wir Daten
    expect(addressForm.addressState = "Musterstraße 44");
    expect(addressForm.firstNameState = "Max");
    expect(addressForm.lastNameState = "Muster");
    expect(addressForm.idState = "23");

});
```

#### Regex matcher

Wir haben eine Methode, die UUIDS ausspuckt. Nach jedem Aufruf gibt es eine neue ID. Folglich können wir im Test keine Daten vergleichen, weil diese sich nie gleichen werden. Aber die UUIDs folgen einem festen Pattern. Das ist unser Ansatzpunkt.

```ts
describe("create-uuid", () => {
    it("should create a uuid", async () => {
        const uuid = create_UUID();
        expect(uuid).toMatch(
            /\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/
        );
    });
});
```

Wir rufen eine neue ID ab. Die vergleichen wir über den Matcher _toMatch()_ (Zeile 4) mit einer REGEX, die ich mir im Internet ausgeliehen habe. Siehe da - ein erfolgreicher Test.

#### Timeouts

Sollte man aus welchen Grund auch immer Timeouts verwenden, bietet Jest auch hier die Möglichkeit zum Testen. In der Komponente _KubaAddressForm_ habe ich einen solchen Fall etwas künstlich erzeugt. In der _connectedCallback_-Methode führe ich die Logger-Funktion aus, nachdem ich 3 Sekunden gewartet habe. Der einzige Sinn, warum ich das mache, ist um es zu zeigen, dass es geht ;-)
Im Test habe ich die Logger-Funktion mit jest.fn() gemockt und erwarte den Aufruf:

```ts
// Implementierung
connectedCallback() {
    setTimeout(() => this.logger("connectedCallback"), 3000);
}

// Test

it("should trigger connectedCallback", async () => {

    const loggerMock = jest.fn();

    const addressForm = new KubaAddressForm();
    addressForm.logger = loggerMock;

    addressForm.connectedCallback();

    expect(loggerMock).toBeCalledWith("connectedCallback");
});
```

Wenn man den Test ausführt, sagt die Konsole, dass der LoggerMock nicht aufgerufen wurde. Das ist auch korrekt, weil zur Zeit der Überprüfung wurde er auch nicht ausgeführt. Sondern drei Sekunden später. Damit der Test mitbekommt, dass da ein Timer läuft, muss man Jest mitteilen, dass man Timer gerne faken würde. Danach kann dem Test sagen er soll die Timeouts direkt ausführen.

```ts
// in der obersten Zeilen der Datei außerhalb des Describe-Blocks
jest.useFakeTimers();

...

it("should trigger connectedCallback", async () => {

    const loggerMock = jest.fn();

    const addressForm = new KubaAddressForm();
    addressForm.logger = loggerMock;

    addressForm.connectedCallback();

///////////////
    jest.runAllTimers();
///////////////

    expect(loggerMock).toBeCalledWith("connectedCallback");
});
```

Zeile 2 zeigt die Konfiguration für Jest.
In Zeile 16 passiert dann die Magie. Jest lässt alle Timeouts auslaufen und der Test geht erfolgreich durch.

##### Fazit

Heute haben wir weitere Testfälle gelernt. Ab jetzt haben wir für die meisten Fälle das Handwerk Tests zu schreiben. Es gelten keine Ausreden mehr. Ich hoffe ich konnte meine Begeisterung für Jest etwas in Worte fassen und lade alle herzlich ein es auszuprobieren.

Der Code hierzu liegt auf [Github](https://github.com/derKuba/stenciljs-tutorial).

Ihr habt Fragen oder Anregungen? Schreibt mir bei [Twitter](https://twitter.com/der_kuba).
\
\
Tausend Dank fürs Lesen!

Kuba
