---
title: "StencilJS-Tutorial: E2E Tests mit Playwright - Tests"
description: Wie testet ich die fertige Applikation
date: 2021-09-17
tags: ["stenciljs"]
layout: layouts/post.njk
---

Mit dem Wissen des letzten Artikels können wir uns dem eigentlichen Thema widmen: Tests schreiben. Das Framework ist installiert, der erste Test steht und nach dem Ausführen laufen die Browser los und testen die Anwendung.<!-- endOfPreview -->

#### Page Object Model

Meine ersten Erfahrungen mit Playwright waren sehr positiv. Aber die Teststruktur war einfach nur chaotisch. Es gab eine Datei mit Selektoren, eine Datei mit Operationen und die Testdateien, die sich diese importieren und verwenden. Man konnte nicht nachvollziehen welcher Selektor zu welcher Seite gehört und wie es mit den Operationen oder Aktionen auf der Seite zusammenspielt. Hier bietet die [Playwright Dokumentation das Page Object Model](https://playwright.dev/docs/test-pom) (kurz POM) an. Die Idee dahinter ist so einfach wie genial. Man teilt die Anwendung in Seiten oder Module ein und erstellt für jedes Teil eine Klasse. In dieser Klasse befinden sich dann die dazugehörigen Selektoren und Operationen. Ohne konkretes Wissen über den strukturellen Aufbau kann man damit die Seite programmatisch bedienen. Nehmen wir als Beispiel die Formularseite zum Anlegen eines Kontaktes. Es besteht aus 3 Feldern (Vorname, Name, Adresse), einem Zurückknopf und einem Speicherknopf. Das dazugehörige POM sieht dann in Pseudocode so aus:

```ts
class Kontaktformular {
    private zurückSelektor = "link zurück";
    private speicherKnopf = "knopf speichern";
    private vornameSelektor = "eingabefeld vorname";
    private nachnameSelektor = "eingabefeld name";
    private adressSelektor = "eingabeFeld adresse";

    klickeZurück = () => playwright.klickMagie(zurückSelektor);
    klickeSpeichern = () => playwright.klickMagie(speicherKnopf);
    fülleVornameFeldAus = (vorname) =>
        playwright.füllMagie(vornameSelektor, vorname);
    ....
}
```

Man erkennt die Klassenstruktur. Die Klassen haben die Selektoren als private Attribute. Die Interaktionsmöglichkeiten der Seite sind in den Methoden abgebildet und benutzen die gekapselten Selektoren. Ohne die Seite gesehen zu haben kann ich, sobald ich eine Instanz dieser Klasse angelegt habe, die Seite bedienen ohne mir die Struktur anzuschauen. Ich finde mich ohne langes Suchen sofort zurecht. Das ist ein entscheidender Vorteil gegenüber meinem ersten Vorgehen.

Da die Adressbuchapplikation zwei Seiten besitzt habe ich mich für zwei POMs entschieden. Eine für die _Kuba-Home_ und eine für die _Kuba-Address-Form_. Die Selektoren und Operationen entsprechen den Interaktionsmöglichkeiten auf der Seite.

**Kuba-Home**
Die Home besteht aus einem Link um einen neuen Kontakt anzulegen und aus der Tabelle aller Kontakte. In jeder Zeile, sofern Kontakt vorhanden, hat man die Möglichkeit die Zeile zu bearbeiten oder zu löschen.

```ts
import { Page } from "playwright";

class KubaHomePom {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    private newButtonSelector = "app-root >> #addressbook_new_contact >> a";
    private tableSelector = "app-root >> kuba-table-options >> table tbody tr";

    async openNewContactForm() {
        await this.page.click(this.newButtonSelector);
    }

    async editContact() {
        await this.page.click(`${this.tableSelector} a`);
    }

    async deleteContact() {
        await this.page.click(`${this.tableSelector} button`);
    }

    async getTableLocator() {
        return await this.page.locator(this.tableSelector);
    }
}
export default KubaHomePom;
```

Es handelt sich um eine normale Javascript-Klasse. Das einzige framework-spezifische aus Playwright ist das Attribut page vom Typ Page, welches über den Konstruktor gesetzt wird. Damit habe ich operationellen Zugriff auf den Browser. Die Zeilen 10 und 11 zeigen die Selektoren für den Link und die Tabelle. Es handelt sich um einfache Strings, die eine leicht abgewandelte CSS-Selektor-Syntax verwenden. Dazu empfehle ich [die Dokumentation zu lesen](https://playwright.dev/docs/selectors). Man findet sich schnell zurecht. Als Operationen auf der Seite gibt es den Klick auf den "Neuer Kontakt"-Link, den Klick auf "Editieren" und "Löschen", sowie das Auslesen der Tabelle.

**Kuba-Form**
Den Aufbau der Seite habe ich oben beschrieben. Sie besteht aus einem Link, drei Eingabefeldern und einem Speicherknopf.

```ts
import { Page } from "playwright";

class KubaFormPom {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    private APP_NAME = "app-root";

    private backButtonSelector = `${this.APP_NAME} >> #backLink >> a`;
    private firstNameInputSelector = `${this.APP_NAME} >> #first-name`;
    private lastNameInputSelector = `${this.APP_NAME} >> #last-name`;
    private addressInputSelector = `${this.APP_NAME} >> #street`;
    private saveButtonSelector = `${this.APP_NAME} >> #saveContactButton`;

    async goBack() {
        await this.page.click(this.backButtonSelector);
    }

    async clickSaveButton() {
        await this.page.click(this.saveButtonSelector);
    }

    async fillFirstNameInput(value) {
        await this.page.fill(this.firstNameInputSelector, value);
    }

    async fillLastNameInput(value) {
        await this.page.fill(this.lastNameInputSelector, value);
    }

    async fillAddressInput(value) {
        await this.page.fill(this.addressInputSelector, value);
    }
}
export default KubaFormPom;
```

In der bekannten Klassenstruktur finden wir die Selektoren für die genannten Felder (Zeile 12-16). Auffällig ist der Appname. Ich nehme diesen immer als ersten Knoten, um dann im Shadowdom zu suchen. Sollte sich dieser ändern ist dies leichter in einer Konstante zu bewerkstelligen. Die Pfeile ">>" sind ein Selektor, der die Klassen oder IDs innerhalb des Shadowdoms sucht. Wir dürfen nicht vergessen, dass die Komponenten aus geschützen Web-Components bestehen. Die Operationen sind das Klicken und füllen der Werte.

#### Playwright Interaktionen

Über das übergebene page-Objekt haben wir Zugriff auf Browseroperationen. Hier liste ich die verwendeten nochmal auf und erläutere sie.
Auch hier empfehle ich die [Dokumentation zu lesen](https://playwright.dev/docs/input).

| Operation                     |                  Playwright |                                                                                 Funktion |
| ----------------------------- | --------------------------: | ---------------------------------------------------------------------------------------: |
| Klicken                       |       page.click(selector); | Als Parameter wird ein Selector erwartet. Dieser wird, sofern er gefunden wird, geklickt |
| Ausfüllen von Formularfeldern | page.fill(selector, value); |                    Als Parameter wird der Selektor und der zu schreibende Wert erwartet. |

Diesen Operationen kann auch noch ein Konfigurationsparameter als letzten Parameter übergeben werden. Dort kann man zum Beispiel mitgeben wie lange man auf das Selektieren warten soll:

```ts
await this.page.click(this.saveButtonSelector, { timeout: 3000 });
```

Wenn dies nicht definiert wird, gilt der globale Timeout. Man kann einen Timeout für den einzelnen Test oder für die gesamte Teststrecke in der Konfigurationsdatei definieren:

```ts
const config: PlaywrightTestConfig = {
    globalTimeout: 60000, // 60sekunden für alle Tests
    timeout: 5000, // 5 Sekunden pro Test
};
```

#### Matcher Add-on

[Playwright bietet einige Matcher/Assertions](https://playwright.dev/docs/test-assertions/) ( .toContainText() ) an. Ich ergänze diese in meinen Projekten noch um das npm-Paket [_expect-playwright_](https://github.com/playwright-community/expect-playwright). Es ergänzt die Matcher noch um die Funktionen:

-   toBeChecked
-   toBeDisabled
-   toBeEnabled
-   toHaveFocus
-   toHaveSelector
-   toHaveSelectorCount
-   toMatchAttribute
-   toMatchComputedStyle
-   toMatchText
-   toMatchTitle
-   toMatchURL
-   toMatchValue

Um diese zu installieren muss man folgendes tun:

```ts
npm install expect-playwright

// playwright.config.ts
import { matchers } from "expect-playwright";

expect.extend(matchers);
```

Und schon haben wir Zugriff auf diese erweiterte Funktionalität.

#### Lucky Path Test

Der glückliche Pfad ist die Klickfolge in der Anwendung, die zum erfolgreichen Abschluss führt. Dieser kann das Anlegen eines Kontaktes sein, das vollständige Ausfüllen eines Formulars oder was auch immer der Zweck der Applikation ist. Sonderfälle und Edge-Cases werden ignoriert. Diese müssen extra behandelt werden.

** Test initialisierung**

```ts
test.describe("Lucky Path Test", () => {
  let kubaHomePom, kubaFormPom;

  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_URL);
    kubaHomePom = new KubaHomePom(page);
    kubaFormPom = new KubaFormPom(page);
  });

  test.afterEach(async ({ page }) => {
    await page.reload();
  });

  ...
});
```

Das Test-Setup habe ich so aufgebaut, dass die beiden POMs außerhalb der Tests instanziiert werden. Jeweils vor jedem Test. Es würde auch reichen die POMs im Dateikopf zu instanziieren.
Zusätzlich steuern wir den Browser vor jeden Test auf die Seite der Applikation und nach jedem Test lade ich die Seite neu, damit alle Daten verschwinden.

Die Adressbuch Applikation hat nur drei grundlegende Funktionen:

-   Kontakt anlegen
-   Kontakt löschen
-   Kontakt editieren

Genau dies sind unsere Tests.

**Kontakt anlegen**

Da man für alle diese Fälle einen Kontakt erst einmal anlegen muss, habe ich dies in eine Funktion ausgelagert, um Redundanz einzusparen.

```ts
const addNewContact = async (kubaHomePom, kubaFormPom) => {
    await kubaHomePom.openNewContactForm();

    await kubaFormPom.fillFirstNameInput("Max");
    await kubaFormPom.fillLastNameInput("Muster");
    await kubaFormPom.fillAddressInput("Musterstraße 23, 1234 Musterstadt");
    await kubaFormPom.clickSaveButton();
    await kubaFormPom.goBack();
};
```

Die Funktion bekommt die zwei POMs übergeben. Zeile 2 öffnet die _Kontakt anlegen_-Seite. In den Zeilen 4-6 werden die Inputfelder beschrieben. Zeile 7 zeigt wie der Speicherknopf betätigt wird und Zeile 8 führt uns zur Startseite mit der Tabelle. Man könnte noch die Eingabewerte auslagern und von außen reingeben. Aber für die Demonstration reicht es so aus.

Der erste Test sieht dann so aus:

```ts
test("should add new contact", async ({ page }) => {
    await addNewContact(kubaHomePom, kubaFormPom);

    const tableLocator = await kubaHomePom.getTableLocator();
    await expect(tableLocator).toHaveCount(1);
});
```

Zeile 2 verwendet die ausgelagerte Funktion. Nach dem Ausführen zähle ich die Tabellenzeilen und erwarte eine neue Zeile. Fertig.

**Kontakt löschen**

```ts
test("should delete contact", async ({ page }) => {
    await addNewContact(kubaHomePom, kubaFormPom);

    await kubaHomePom.deleteContact();

    const tableLocator = await kubaHomePom.getTableLocator();
    await expect(tableLocator).toHaveCount(0);
});
```

Analog zu dem vorherigen Test wird ein Kontakt angelegt. Die _.deleteContact()_ ist ein bisschen geschummelt. Sie sucht einfach nach dem ersten Button und drückt diesen. Danach wird durchgezählt und keine Zeile mehr in der Tabelle erwartet.

**Kontakt editieren**

Das ist der aufwendigste Test:

```ts
test("should add new contact and edit it", async ({ page }) => {
    await addNewContact(kubaHomePom, kubaFormPom);

    await kubaHomePom.editContact();

    await kubaFormPom.fillFirstNameInput("Heinrich");
    await kubaFormPom.fillLastNameInput("Neumuster");
    await kubaFormPom.clickSaveButton();
    await kubaFormPom.goBack();

    const tableLocator = await kubaHomePom.getTableLocator();
    await expect(tableLocator).toContainText("HeinrichNeumuster");
});
```

Dieser Test ist aufwendiger, da erst ein Kontakt angelegt werden muss. Dann muss auf der Hauptseite der Editier-Knopf gedrückt werden, die Werte verändert, zurücknavigiert und dann die neuen Werte erwartet.
Die Implementierung der Tabelle macht den Vergleich etwas schwerer. Man hätte hier sauberer mit IDs arbeiten müssen. Ich mache mir es leicht und lese den Text der ersten Zeile konkateniert aus. Deswegen sieht mein Vergleichswert auf den ersten Blick merkwürdig aus. Fertig.

#### Warum sollte man das tun?

Ja, es ist zusätzlicher Code. Ja, es kostet Zeit diesen zu schreiben. Aber es spart diese Zeit wieder ein. In vielen Firmen werden Anwendungen noch aufwendig von Hand getestet. Man stelle sich vor, jemand erstellt einen Testkatalog mit Testdaten und 100 Testfälle. Irgendwer muss sich dann hinsetzen und alle 100 Testfälle per Hand Stück für Stück, Zeile für Zeile, Feld für Feld durchtesten. Jeder Mensch macht auch Fehler. Testfälle werden übersprungen, weil man in der Zeile verrutscht. Die Ergebnisse werden vergessen mitzuteilen.
Diese Art Tests laufen in der Pipeline und können nach jeder Änderung automatisch durchlaufen werden. Man kann es so konfigurieren, dass nicht erfolgreiche Tests ein Deployment verhindern. Natürlich muss man nicht auf händische Tests verzichten, aber diese E2E-Tests ergänzen diese auf sehr wertvolle Art und Weise.

Für mich sind diese Tests eine Pflicht in jedem Projekt.

Dieses Tutorial soll den Einstieg ermöglichen. Es ist keine Musterlösung, sondern bietet den Einstieg in die Materie.

Der Code hierzu liegt auf [Github](https://github.com/derKuba/stenciljs-tutorial).

Ihr habt Fragen oder Anregungen? Schreibt mir bei [Twitter](https://twitter.com/der_kuba).
\
\
Tausend Dank fürs Lesen!

Kuba
