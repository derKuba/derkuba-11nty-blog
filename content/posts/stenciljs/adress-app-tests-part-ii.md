---
title: "StencilJS-Tutorial: Real World Unit Tests Teil 2"
description: jest.fn und jest.spyon
date: 2021-08-27
tags: ["stenciljs", "testing", "jest"]
layout: layouts/post.njk
---

Dieser Artikel setzt auf dem letzten [Artikel "StencilJS-Tutorial: Real World Unit Tests"](https://derkuba.de/content/posts/stenciljs/adress-app-tests/) auf und gibt weitere Einblicke und Beispiele zum Thema Jest-Testing innerhalb einer StencilJS-App.<!-- endOfPreview -->

#### Nachtrag Unit-Testing

Im ersten Teil habe ich gezeigt wie man per DOM-Methoden im Unit-Test die Komponente ansteuert. Der dazugehörige Beispieltest läuft grün. Aber er ist auch sehr simpel. Es gibt keine geschachtelten Webcomponents. Hier möchte ich ein weiteres Beispiel zeigen: _kuba-address-form.tsx_. Diese Komponente verwendet mehrere weitere Komponenten, wie z.B. das _kuba-input_ und den _kuba-button_.

```ts
// vereinfachte Darsellung
@Component
class class KubaAddressForm {

    onSubmit = ()=>{
        ...
    }

    render(){
        return (
            <Host>
                <kuba-input />
                <kuba-input />
                <kuba-input />
                <kuba-button handleClick={onSubmit}/>
            </Host>
        )
    }
}

class class KubaButton {
    @Prop()handleClick;

    handleClick = ()=>{
        this.handleClick();
    }
    render(){
        return (
            <button onClick={this.handleClick}><slot/></button>
        )
    }
}
```

Mit dem Beispiel zum Thema Test würde so ein Unit-Test aussehen:

```ts
// hier kommt man an die Grenze von der newSpecPage
it("should submit the form with query on dom", async () => {
    const page = await newSpecPage({
        components: [KubaAddressForm],
        html: `<kuba-address-form></kuba-address-form>`,
    });

    console.log(
        page.body
            .querySelector("kuba-address-form")
            .shadowRoot.querySelector("kuba-button").innerHTML
    ); // möglich! output: speichern

    page.body
        .querySelector("kuba-address-form")
        .shadowRoot.querySelector("kuba-button")
        .shadowRoot // undefined
        .querySelector("button")
        .click();

    ...
});
```

Das Expect habe ich absichtlich weggelassen, weil es gar nicht soweit kommt. Hier stoßen wir an die Grenze vom _newSpecPage_-Objekt. Es geht hin und mockt alle weiteren Komponenten, die im Render-Block stehen weg. Das bedeutet, dass wir keine Möglichkeit haben per Unit-Test das Click-Event des Buttons innerhalb der Kuba-Button-Komponente zu erreichen.
Der Consolen-Output aus Zeile 8 gibt noch das Label des Buttons aus ("speichern"). Der ShadowDom dahinter ist aber bereits undefined. Mit dieser Art des Tests kommen wir nicht weiter.

Auf dem Click-Event des Buttons liegt aber eine Methode ("onSubmit"), die wir unbedingt testen möchten. An dieser Stelle möchte das Stencil-Framework die Unit-Test-Ebene verlassen und auf die angebotenen e2e-Tests verweisen. In diesen Tests haben wir echte Komponenten und können "seleniumartig" auf diesen operieren. Ich möchte aber lieber nur Unit-Tests schreiben und echte E2E-Tests mit einem echten Browser verwenden.

Die Alternative sieht so aus:

```ts
import { KubaAddressForm } from "../kuba-address-form";
...
it("should submit the form", async () => {
    const addressForm = new KubaAddressForm();
    addressForm.onSubmit();
    ...
});
```

Wir importieren die Klassenreferenz und erzeugen daraus eine Instanz. Auf dieser können wir alle nötigen Attribute und Methoden aufrufen.

#### jest.fn()

Dies ist ein mächtiger Mock mit ganz viel Funktionalität. Man kann damit Funktionen/Methoden überschreiben und erhält damit die Möglichkeit den Aufruf mitsamt seiner Parameter aufzunehmen und abzufragen. Der Mock kann auch als Instanz verwendet werden, callbacks zurückliefern und Testwerte zurückliefern. Immer dann wenn man den Aufruf irgendeiner Funktion unterbinden oder wegmocken möchte, bietet sich jest.fn() an.

Schauen wir uns ein einfaches Beispiel aus dem Adressbuchprojekt an. Es gibt dort die _kuba-input-functional_-Komponente, die einen Setter übergeben bekommt. Jedes Mal wenn man etwas in das Textfeld eintippt wird diese Funktion aufgerufen. Genau dies möchten wir nun einmal getestet haben:

Ausimplementiert sieht der Code so aus:

```ts
// Implementierung
export const KubaInputFunctional = ({
  componentId,
  label,
  type,
  value,
  setter,
}: {
  componentId: string;
  label: string;
  type: "text" | "number";
  value: string;
  setter: Function;
}) => {
  const onInput = (event) => {
    setter({ value: event.target.value });
  };
  return (
    <div class="kuba-input">
      <label htmlFor={componentId}>{label}</label>
      <input type={type} id={componentId} value={value} onInput={onInput} />
    </div>
  );
};

// Verwendung in einer Komponente:

// Methode
private onChangeAddress = ({ value }: { value: string }) => {
    this.addressState = value;
};
...
// renderblock
<KubaInputFunctional
    componentId="street"
    label="Adresse:"
    value={this.addressState}
    type={"text"}
    setter={this.onChangeAddress}
></KubaInputFunctional>
...
```

Wir sehen, dass die onInput-Methode (Zeile 15) im input-Tag (Zeile 21) verwendet wird. Die Property _setter_ (Zeile 8) wird als Funktion in Zeile 17 aufgerufen.
Ab Zeile 28 sehen wir, wie und womit diese Property gefüllt wird. Da setzen wir den Test an:

```ts
// kuba-input-functional.spec.tsx
it("should trigger onInputEvent", async () => {
    const setterMock = jest.fn();

    const page = await newSpecPage({
        components: [],
        template: () => (
            <KubaInputFunctional
                componentId="street"
                label="Adresse:"
                value={""}
                type={"text"}
                setter={setterMock}
            ></KubaInputFunctional>
        ),
    });

    const event = new Event("input");
    page.root.querySelector("input").dispatchEvent(event);

    expect(setterMock).toHaveBeenCalled();
});
```

Der Test hat die typischen drei Teile:

1. Initialisierung
2. Herbeiführen des Zustandes
3. Erwartungen überprüfen.

Im ersten Teil definieren einen _setterMock_ in Zeile 3, indem wir einer Variable das jest.fn() zuweisen. Das den gleichen Wert wie eine ausimplementierte Funktion mit Logik. Diese Funktion übergeben wir der KubaInputFunctional als Property im Attribut von _setter_ (Zeile 13). Damit ist die Initialisierung abgeschlossen.

Im zweiten Teil simulieren wir die Eingabe in das Textfeld. Da das native Input auf das Event "input" lauscht, ist das unser Ansatzpunkt. Wir steuern das _input_ innerhalb der Komponente an (querySelector) und führen auf diesen Knoten den Event aus. Das geschieht über die _.dispatchEvent()_-Funktion des HTML-Knotens. Diese bekommt als Parameter ein Objekt vom Typ Event oder Customevent übergeben. Diese Events bekommt als Konstruktorparameter den Namen des Events und ggf. Daten übergeben.
Damit wird die Funktion _onInput_ der KubaInputFunctional-Komponente aufgerufen. Man kann dies im Debugger oder per console.log beobachten.

Im dritten Teil müssen wir den Test mit einer Erwartung füttern, damit dieser weiß, ob der Test erfolgreich war. Hier kommt wieder unser _setterMock_ zum Zug. Laut meiner Behauptung speichert ein Mockobjekt seinen Aufruf. Abfragen lässt sich dies mit _.toHaveBeenCalled_ oder _toBeCalledWith_. Der Test läuft erfolgreich durch. Somit wurde der Mock aufgerufen.
Man kann den Mock auch in seine Aufrufe mitsamt Parametern zerteilen.

```ts
expect(setterMock.toHaveBeenCalledWith({ value: "" }));
// oder
expect(setterMock.mock.calls[0][0]).toBe({ value: "" });
```

Hier steht das erste Array für den Aufruf (0: erster Aufruf; 1: zweiter Aufruf)
und das zweite Array für die Parameter (0: erster Parameter; 1: zweiter Parameter);
Damit kann man zusätzlich noch mehrere Aufrufe gleichzeitig testen. Ich habe beide Varianten bzw. Schreibweisen vorgeführt.

Desweiteren kann der Mock Werte zurückliefern:

```ts
setterMock.mockReturnValue("23"); // und er gibt immer diesen Wert zurück
setterMock.mockReturnValueOnce("13"); // er gibt einmal diesen Wert zurück
```

#### jest.spyOn

Der Spy zählt ebenfalls zu den Mocks. Nur wird hier eine Funktion nicht ersetzt oder überschrieben, sondern man lauert auf den Aufruf. Das ist sehr praktisch wenn man zum Beispiel auf Operationen auf dem _windows_- oder _document_-Objekt testen möchte.
Mein Beispiel im Adressbuch-Projekt ist leider sehr konstruiert, aber ich hoffe, dass man verstehen kann worauf ich hinaus möchte.

In der Komponente _kuba-address-form_ gibt es eine Submit-Methode. In dieser habe ich eine Such-Operation auf einen Tag "test" eingebaut. Stellt man sich jetzt vor dieser Aufruf wäre verschachtelt in viele if-Verzweigungen und man möchte diese Testen, kann man auf diese Operation lauschen.

```ts
it("should use a spy", async () => {
    const documentSpy = jest.spyOn(global.document, "getElementById");
    const addressForm = new KubaAddressForm();
    addressForm.onSubmit();

    expect(documentSpy).toBeCalled();
    expect(documentSpy).toBeCalledWith("test");
});
```

Die Funktion _jest.spyOn_ hat als Parameter das zu belauschende Objekt und den Funktionsnamen. Im Test lauschen wir auf das globale Dokument und im speziellen auf die "getElementById". In Zeile 2 sieht man die Initialisierung des Spy. Dieser wird dann analog zu _jest.fn()_ behandelt. Man kann nach dem Herbeiführen des Wunschzustandes überprüfen ob das Funktion aufgerufen wurde und/oder mit welchem Parameter aufgerufen wurde. Man könnte diese Überprüfung auch mit jest.fn() ausführen. Aber das bleibt Geschmackssache.

#### Fazit

In diesem Artikel haben wir gelernt, dass das _newSpecPage_-Objekt nur eine Ebene tief mockt und das zu Problemen beim Unit-Testen führt. Dafür bietet StencilsJS die Hauseigene E2E-Bibliothek an.
Wir haben jest.fn() kennen- und schätzengelernt und am Beispiel gesehen, wie man es nutzen kann. Daneben wurde noch das jest.spyOn als Alternative gezeigt.

Im nächsten Artikel zeige ich wie man komplexere Komponente testes und insbesonders wie man ganze Module mockt.

Der Code hierzu liegt auf [Github](https://github.com/derKuba/stenciljs-tutorial).

Ihr habt Fragen oder Anregungen? Schreibt mir bei [Twitter](https://twitter.com/der_kuba).
\
\
Tausend Dank fürs Lesen!

Kuba
