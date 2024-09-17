---
title: "Contract-Testing mit hurl"
description: Ein simples Setup für rudimentäre Contract-Tests
date: 2023-01-01
tags: ["testing", "hurl"]
layout: layouts/post.njk
lang: "de"
alternate_lang: "en"
alternate_url: "/posts/en/0123/contract-test"
---

Wenn man auf der Testing-Pyramide weiter nach oben wandert, stößt man auf Contract- oder Servicetests. Diese Art von Tests stellt sicher, dass das Frontend auch nach Änderungen oder einem Deployment weiterhin mit dem Backend oder den dazugehörigen Services funktioniert.<!-- endOfPreview -->

Im Prinzip geht es darum, eine bestimmte Antwort der Schnittstelle sicherzustellen. In diesem Beispiel werden echte Requests an die Schnittstelle gesendet. Das erzeugt einiges an Traffic und Last auf den echten Services. Diesen Weg würde ich nur gehen, wenn man sich nicht auf einen echten Contract mit dem Backend einigen kann.

Wenn möglich, würde ich [PACT](https://docs.pact.io/) empfehlen. Dabei stellt ein Broker sicher, dass der Contract (eine JSON-Datei) noch funktioniert. Man muss dafür allerdings etwas Aufwand und Infrastruktur bereitstellen.

Vor einem Jahr habe ich solche Tests noch selbst geschrieben. Mit Node.js habe ich programmatisch _fetch_-Aufrufe gegen mein "Backend" gesendet, um sicherzustellen, dass mein Frontend weiterhin kompatibel ist. Ein Kollege hat mich vor einiger Zeit auf [hurl](https://hurl.dev/) aufmerksam gemacht. Dieses Framework übernimmt das Absetzen der Requests, sammelt die Testdateien ein und gibt eine übersichtliche Zusammenfassung der Tests aus. Darüber hinaus bietet es einen HTML-Report, die Möglichkeit, Variablen in eine .env-Datei auszulagern, und viele Vergleichsoperationen.

![Hurl](/img/0123/hurl.png "hurl testing")

Heute zeige ich anhand eines kleinen Backends, wie man bestimmte Daten und Cookies erwartet, .env-Dateien verwendet und das HTML-Reporting aktiviert – alles integriert in ein NPM-Projekt.

### Installation

Um hurl in npm zu integrieren, legen wir ein neues Projekt an:

```bash
mkdir contract-testing
npm init -y
```

Installieren wir nun hurl:

```bash
npm install @orangeopensource/hurl
```

Jetzt fehlen nur noch die Test-Dateien im Testordner. Die Dateiendung .hurl zeigt hurl, dass dort die Tests hinterlegt sind:

```bash
mkdir contract-test
cd contract-test
touch simple.hurl
touch cookie.hurl
touch content.hurl
```

Der erste Test sieht folgendermaßen aus:

```bash
// simple.hurl

# is application running
GET http://localhost:3000/random
HTTP/1.1 200
```

Es wird ein _GET_ gegen eine URL gesendet. Als Antwort wird ein Statuscode 200 im HTTP 1.1-Protokoll erwartet.

Für die Ausführung fehlt in der _package.json_ noch das passende Script:

```bash
// package.json
"scripts": {
   "test:contract": "hurl --test --glob contract-test/*.hurl --report-html ./reports --variables-file ./contract-test/contract-testing.env"
 },
```

Der Befehl startet hurl mit folgenden Optionen:

| Option           | Bedeutung                                         |
| ---------------- | ------------------------------------------------- |
| --test           | startet hurl als Test-Tool mit angepasstem Output |
| --glob           | gibt den Ort und die Benennung der Testdateien an |
| --report-html    | legt den Speicherort für den HTML-Report fest     |
| --variables-file | benennt die .env-Datei mit Umgebungsvariablen     |

Jetzt müssen die Tests nur noch ausgeführt werden:

```bash
npm run test:contract
```

Die Ausgabe sollte dann folgendermaßen aussehen:

```bash
contract-test/cookies.hurl: Running [1/3]
contract-test/cookies.hurl: Success (1 request(s) in 0 ms)
contract-test/simple.hurl: Running [2/3]
contract-test/simple.hurl: Success (1 request(s) in 0 ms)
contract-test/content.hurl: Running [3/3]
contract-test/content.hurl: Success (1 request(s) in 0 ms)
--------------------------------------------------------------------------------
Executed files:  3
Succeeded files: 3 (100.0%)
Failed files:    0 (0.0%)
Duration:        4 ms
```

### Tests

Das vorhandene Backend gibt nicht viel her. Unter der Route _/random_ wird ein JSON zurückgegeben, das ich mit Hilfe von [JSON-Generator](https://json-generator.com/) erstellt habe. Zusätzlich habe ich noch einen Cookie eingefügt.

![JSON Response](/img/0123/jsonResponse.png "json response")

![Cookie](/img/0123/cookie.png "cookie")

Aber es reicht, um den wesentlichen Nutzen zu demonstrieren. Man stellt sicher, dass ein bestimmter Aufruf eine vordefinierte Antwort liefert.

### GET & POST

```ts
# validate response
GET {{base_url}}/random
HTTP/1.1 200
[{"_id":"63b17cafa115a1682550035e","index":0,"gui... Achtung gekürzt

# send post request

POST {{base_url}}/random
{
  "name": "Kuba"
}

HTTP/1.1 200

[Asserts]
body contains "Hello Kuba"
```

Der erste Test ruft die URL auf (Zeile 2). In Zeile 3 wird, wie oben, auf das Protokoll und den Statuscode geprüft. Die nächste Zeile enthält das zu erwartende JSON. Weicht es ab, wird dieser Test scheitern.

Der nächste Test ist ein POST-Request. Ein JSON-Objekt wird übermittelt (Zeile 8-9). Nach Prüfung des Protokolls und des Statuscodes folgt der _Asserts_-Block. Hier kann man Vergleiche anstellen. Unter [Hurl Asserts](https://hurl.dev/docs/asserting-response.html) sieht man das verfügbare Set: status, header, url, cookie, body, bytes, xpath, jsonpath, regex, sha256, md5, variable, duration.

Ich verwende _body_ und prüfe, ob der Inhalt die Zeichenkette „Hello Kuba“ enthält. Der eigenen Kreativität sind hier kaum Grenzen gesetzt.

### Cookie

```ts
// cookie.hurl

GET {{base_url}}/random
HTTP/1.1 200

[Asserts]
cookie "foo" exists
cookie "foo[HttpOnly]" exists
cookie "foo[Secure]" exists
cookie "foo[SameSite]" equals "Lax"
```

In diesem Test werden die Werte des Cookies im _Assert_-Block überprüft. Das Keyword _cookie_ sucht nach dem benannten Cookie und prüft dessen Eigenschaften.

### Die .env-Datei

Um in verschiedenen Umgebungen Umgebungsvariablen anzubieten, gibt es die oben beschriebene Option _--variables-file_. In dieser Datei können Variablen abgelegt werden:

```ts
// contract-testing.env
base_url=http://localhost:3000
```

Hier wird die _base_url_ definiert. Natürlich kann diese je nach Umgebung variieren. Hier könnten z.B. auch Login-Daten abgelegt werden.

In den Hurl-Dateien kann dann darauf zugegriffen werden:

```ts
GET {{base_url}}/random
HTTP/1.1 200
```

Dem aufmerksamen Leser ist sicher schon aufgefallen: Möchte man auf diese Variablen im POST-Body zugreifen, muss dieser in dreifachen Hochkommata stehen.

### Der HTML-Report

Die Option _--report-html ./reports_ sorgt dafür, dass nach der Ausführung ein Ordner _reports_ erscheint. Darin befindet sich eine HTML-Datei, die ausgeführt so aussieht:

![hurl report](/img/0123/hurl-report.png "Reporting")

Die Ergebnisse der Tests werden in einer Übersicht dargestellt, und man sieht, welche Tests bestanden und welche fehlgeschlagen sind. Es ist ein nettes Feature, das nicht extrem viele Informationen bietet, aber in zukünftigen Releases sicher erweitert wird.

### Fazit

Dieser Artikel gibt einen Einblick, wie man diese Art von Tests einrichtet und ausführt. Der Nutzen ist klar: Es ist ein praktisches und einfaches Tool. Ich wünsche euch viel Spaß damit!

Der Code dazu liegt auf [Github](https://github.com/derKuba/contract-testing).

Ihr habt Fragen oder Anregungen? Schreibt mir bei [Twitter](https://twitter.com/der_kuba) oder bei [LinkedIn](https://www.linkedin.com/in/jacob-pawlik-08a40015b/).
Tausend Dank fürs Lesen!

Kuba
