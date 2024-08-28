---
title: "StencilJS-Exkurs: Backend-Api mit Koa"
description: Wir schreiben ein Backend und binden es an unsere Applikation an
date: 2021-12-17
tags: ["web", "safari"]
layout: layouts/post.njk
---

Ein Thema wurde bisher nicht in unserem StencilJS Tutorial nicht behandelt: das Backend. <!-- endOfPreview -->In diesem Artikel erläutere ich wie man ein JS-Backend aufsetzt und einige Routen hinzufügt.

#### Backend aufsetzen

Als Technologie habe ich das Koa-Framework ausgewählt. Es wurde wie das sehr populäre ExpressJS vom selben Team Entwickelt und versteht sicht als Weiterentwicklung. Das Team hat seine Learnings zu ExpressJS gesammelt und versucht nun ein noch bessere Javascript-Web-Framework zur Verfügung zu stellen.
##### Installation

Wir erstellen einen Ordner, navigieren dorthin und initialisieren ein NPM-Projekt.

```bash
mkdir backend
cd backend
npm init
```

```bash
npm install koa koa-body-parser @koa/router @koa/cors joi uuid
```

In dieses Projekt installieren wir

-   **koa**: den Koa-Core,
-   **koa-body-parser**: einen Body-Parser, der uns ermöglicht unter anderem Post-Variablen aus dem Request zu lesen
-   **@koa/router**: um die Routen auszulagern und eine bessere Struktur zu bekommen
-   **@koa/cors** um Daten aus einer weiteren Quelle zu laden ( nicht aus dem StencilJS Server)
-   **joi**: für die Request-Validierung
-   **uuid**: für die Generierung einer einzigartigen ID

##### Routen

Für die Adressbuch-Applikation brauchen wir folgende Routen

| Route         | Methode |                 Erläuterung                  |
| ------------- | :-----: | :------------------------------------------: |
| /contacts     |   GET   |              Hole alle Kontakte              |
| /contacts/:id |   GET   | Hole bestimmten Kontakt mit der variablen ID |
| /contacts/    |  POST   | Lege neuen Kontakt an / Editiere den Kontakt |
| /contacts/:id | DELETE  |              Lösche den Kontakt              |

Ich habe der einfachheit halber auf eine PUT/PATCH Route verzichtet, mit der man eigentlich eine Ressource verändern sollte.

##### ToolChain

_Nodemon_

Bevor wir mit der Implementierung starten, erweitern wir die Entwicklungs-Toolchain durch ein kleines Modul names **nodemon**. Dieses Modul startet einen Watcher auf unseren Sourcecode und startet nach jeder Änderung den Server neu. Ohne dieses Modul müssten wir nach jedem Speichern den Server manuell neustarten. Es ist eine immense Erleichterung des Workflows.

```bash
npm install -D nodemon
```

Anschließend fügen wir noch einen Dev-Task in die package.json ein:

```js
// package.json
...
 "scripts": {
    "dev": "nodemon src/index.js",
  },
  ...
```

##### Implementierung

_Routen_

Wir legen folgende Dateien an:

-   src/index.js
-   src/contacts/index.js
-   src/contacts/validation.js
-   src/utils/uuid.js

```js
// index.js
const Koa = require("koa");
const cors = require("@koa/cors");
var bodyParser = require("koa-body-parser");

const contactRouter = require("./contacts");

const app = new Koa();
app.use(cors());
app.use(bodyParser());
app.use(contactRouter.routes());

app.use(async (ctx) => {
    ctx.body = "Hello World";
});

app.listen(3000);
```

Die _src/index.js_-Datei ist eine Art "Main"-Datei. In ihr wird der Server initialisiert, konfiguriert und gestartet. Es wird eine Instanz der Klasse Koa erstellt und dieser der Bodyparser und das Cors-Modul übergeben. Über _app.listen_ wird der Server gestartet. Als Parameter erhält dieser die Portnummer. In Zeile 11 und Zeile 13-15 sieht man die zugewiesenen Routen. Auf den "ContactRouter" komme ich gleich zurück. Die nächsten Zeilen übergeben eine asynchrone anonyme Arrow-Function, die dem Kontext-Body einen String zuweist. Damit sagt man dem Server, dass er auf der Root-Route ("/") in den Response Body den String "Hello World" zurückgeben soll.

Startet man nun diese Datei:

```bash
node src/index.js
```

Öffnet man nun zum Beispiel im Browser die Seite unter der URL **http://localhost:3000**, erhält man eine weiße Seite mit "Hello World".

##### Kontakt-Routen

Wir erstellen die Datei _src/contacts/index.js_. In diese kommen nun die oben spezifizierten Routen hinein.

Dafür brauchen wir eine Instanz des _Koa/router_.

```ts
const Router = require("@koa/router");

const contactsRouter = new Router();
```

Diesem Router kann man nun Routen und Request-Methoden zuweisen:

```js
contactsRouter.get("/contacts", (context) => {});
contactsRouter.post("/contacts", (context) => {});
contactsRouter.delete("/contacts/:id", (context) => {});
```

Die Datenhaltung wird simuliert. Anstatt eine Datenbank anzubinden, legen wir eine leeres Array an und haben so eine Datenhaltung für die Dauer der Laufzeit der Anwendung. Eingegebene Daten werde beim Schließen des Servers gelöscht. Dieses Array wird nun in die vorgegeben Routen eingebaut und befüllt.

```js
const contacts = [];

// GET
contactsRouter.get("/contacts", (ctx) => {
    ctx.body = contacts;
});
```

Die GET-Route ist sehr simpel. Beim Aufruf wird das Contacts-Array zurückgegeben.

**Kontakt anlegen/editieren**

```js
contactsRouter.post("/contacts", (context) => {
    const requestData = context.request.body;
    const contactItemIndex = contacts.findIndex(
        (item) => item.id === requestData.id
    );

    if (contactItemIndex !== -1) {
        contacts[contactItemIndex] = requestData;
        context.body = contacts[contactItemIndex];
    } else {
        const contact = {
            ...requestData,
            id: uuid(),
        };
        contacts.push(contact);
        context.body = contact;
    }
});
```

In der ersten Version, ohne Validierung, werden die übergeben Daten aus dem request-body ausgelesen. Danach sucht man nach einer Kontakt-ID im Kontakte-Array. An dieser verzweigt sich der Programmierfluss in Abhängigkeit, ob ein Kontakt mit der übergebenen ID gefunden wurde. Wenn ein Kontakt gefunden wurde, befinden man sich im Bearbeiten-Modus eines Kontaktes. In dem Fall wird das Kontakt-Array an der Stelle des Kontaktes mit der gleichen ID überschrieben. Wird kein Kontakt gefunden, befindet man sich im Anlegen-Modus eines Kontaktes. Den übergebenen Daten wird eine UUID zugefügt und dann in das Array geschoben

**Kontakt löschen**

```js
contactsRouter.delete("/contacts/:id", async (ctx) => {
    const contactItemIndex = contacts.findIndex(
        (item) => item.id === ctx.params.id
    );

    if (contactItemIndex === -1) {
        ctx.status = 404;
    } else {
        contacts.splice(contactItemIndex, 1);
        ctx.status = 200;
    }
});
```

Die Lösch-Route ist analog zur POST-Route. Man sucht anhand der ID den Kontakt im Array und löscht diesen im anschluss. Sollte kein Kontakt zur übergeben ID vorhanden sein, wird ein StatusCode 400 zurückgeliefert.

Exportiert man nun diese Route am Ende der Datei und importiert diese in die Main-Datei, startet den Server, kann Requests an den Server senden.

##### Validierung

Damit die Daten, die man zum Anlegen eines Kontaktes braucht, passen, empfehle ich eine Datenvalidierung. Als Framework empfiehlt sich [Joi](https://joi.dev/), da es ein einfaches und leichtgewichtiges Framework ist. Es wurde bereits installiert und man kann es benutzen.

Unser Datenobjekt sieht so aus:

```js
{
  lastName: string,
  firstName: string,
  adress: string,
  id: string
}
```

Wir legen die Datei _"src/contacts/validation.js"_ an.

```js
const Joi = require("joi");

const contactValidation = Joi.object({
    lastName: Joi.string().required(),
    firstName: Joi.string().required(),
    address: Joi.string().required(),
    id: Joi.string()
        .guid({
            version: ["uuidv4", "uuidv5"],
        })
        .allow(null),
});

module.exports = contactValidation;
```

Joi funktioniert so, dass man ein großes Joi.object anlegt und dort jedes Feld benennt und mit Regeln deklariert. Ich empfehle einen Blick in die [Dokumentation](https://joi.dev/api/), welche übersichtlich und vollständig ist.

Alle Felder sind Strings und bis auf ID werden alle benötigt.
Man erzwingt dieses Verhalten über folgende Signatur:

```js
*: Joi.string().required();
```

Das UUID-Feld ist etwas besonderes, da es einerseits ein bestimmtes Format erwartet und andererseits auch "null" oder leer sein kann. Für das Erkennen von UUIDs hat JOI ein eigenes Datenfeld _.guid()_. Um ein optionales feld zu deklarieren kann man das .require() weglassen. Zusätzlich erlauben man einen leeren Wert mit _.allow(null)_.

Das fertig deklarierte Objekt muss man am Ende noch exportieren.

```js
// src/contacts/index.js
const contactValidation = require("./validation");

const { value, error } = contactValidation.validate(context.request.body);

if (error) {
    context.throw(400, error);
}
```

In der Routes-Datei wird dieses Objekt nun importiert. Dieses Validierungsobjekt hat eine Methode, der man den Request-Body übergibt. Als Rückgabeparameter erhält man zwei Werte:

-   value: das überprüfte und fehlerfreie Request-Objekt (die POST-Daten)
-   error: einen Fehler im Fehlerfall

**fertige Routingdatei /contacts/index.js**

```js
const Router = require("@koa/router");
const contactValidation = require("./validation");
const { v4: uuid } = require("uuid");

const contactsRouter = new Router();

const contacts = [];

contactsRouter.get("/contacts", (ctx) => {
    ctx.body = contacts;
});

contactsRouter.post("/contacts", (context) => {
    const { value, error } = contactValidation.validate(context.request.body);

    if (error) {
        context.throw(400, error);
    }
    const contactItemIndex = contacts.findIndex((item) => item.id === value.id);

    if (contactItemIndex !== -1) {
        contacts[contactItemIndex] = value;
        context.body = contacts[contactItemIndex];
    } else {
        const contact = {
            ...value,
            id: uuid(),
        };
        contacts.push(contact);
        context.body = contact;
    }
});

contactsRouter.delete("/contacts/:id", async (ctx) => {
    const contactItemIndex = contacts.findIndex(
        (item) => item.id === ctx.params.id
    );

    if (contactItemIndex === -1) {
        ctx.status = 404;
    } else {
        contacts.splice(contactItemIndex, 1);
        ctx.status = 200;
    }
});

module.exports = contactsRouter;
```

#### Fazit

In diesem Tutorial wurde eine einfache Backend-API aufgesetzt, die für die Anbindung des Adressbuches dient. Diese Punkte wurden behandelt.

-   Aufsetzen des Webservers
-   Routes
-   Validierung

Im nächsten Schritt folgt die Anbindung des Adressbuches.

Der Code hierzu liegt auf [Github](https://github.com/derKuba/stenciljs-tutorial). Um es auf diesen Stand zu bringen, müsst ihr das Projekt klonen und einmal auf den Branch "backend-implementation" auschecken:

Ihr habt Fragen oder Anregungen? Schreibt mir bei [Twitter](https://twitter.com/der_kuba).
\
\
Tausend Dank fürs Lesen!

Kuba
