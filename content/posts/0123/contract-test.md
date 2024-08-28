---
title: "Contract-Testing mit hurl"
description: Ein simples Setup für ganze rudimentäre Contract tests
date: 2023-01-01
tags: ["testing", "hurl"]
layout: layouts/post.njk
---

Wenn man auf der Testing-Pyramide weiter nach oben wandert, stößt man auf Contract- oder Servicetests. Diese Art von Tests stellen sicher, dass das Frontend mit dem Backend oder den dazugehörigen Services nach Änderungen oder einem Deployment weiterhin funktionieren.<!-- endOfPreview -->

Im Prinzip geht es darum eine bestimmte Antwort der Schnittstelle sicherzustellen. In diesem Beispiel werden echte Requests an die Schnittstelle gesendet. Das erzeugt einiges an Traffic und Last auf den echten Services. Diesen Weg würde ich nur gehen, wenn man sich nicht auf einen echten Contract mit dem Backend einigen kann.

Wenn es geht würde ich [PACT](https://docs.pact.io/) empfehlen. Dabei stellt ein Broker sicher, dass der Contract (eine JSON-Datei) noch funktioniert. Man muss aber einiges an Aufwand und Infrastruktur bereitstellen.

Vor einem Jahr habe ich diese Tests noch selber geschrieben. Mit nodeJS habe ich _fetch_-Aufrufe, programmatisch, gegen mein "Backend" geschossen und so sichergestellt, dass mein Frontend weiterhin kompatibel ist. Ein Kollege hat mich vor einiger Zeit auf [hurl](https://hurl.dev/) aufmerksam gemacht. Dieses Framework übernimmt die Arbeit Requests abzusenden, sammelt die Testdateien ein und gibt eine schöne Zusammenfassung der Tests wieder. Des Weiteren gibt es ein HTML-Report, die Möglichkeit Variablen in eine .env-Datei auszulagern und viele Vergleichsoperationen.

![Hurl](/content/img/0123/hurl.png "hurl testing")


Heute zeige ich anhand eines kleinen Backends wie man bestimmte Daten und Cookies erwartet, .env-Dateien verwendet und das HTML-Reporting ausgibt. Alles integriert in einem NPM-Projekt.


### Installation

Um es in npm zu integrieren legen wir ein neues Projekt an:

```bash
mkdir contract-testing
npm init -y
```

Installieren noch hurl:

```bash
npm install @orangeopensource/hurl
```

Jetzt fehlen noch die Test-Dateien im Testordner. Die Dateiendung .hurl verrät hurl, dass dort die Tests hinterlegt werden:

```bash
mkdir contract-test
cd contract-test
touch simple.hurl
touch cookie.hurl
touch content.hurl
```

Der erste Test sieht so aus:

```bash
// simple.hurl

# is application running
GET http://localhost:3000/random
HTTP/1.1 200
```

Es wird ein _GET_ gegen eine URL gesendet. Als Antwort wird ein Status Code 200 im HTTP 1.1-Protokoll erwartet.

Für die Ausführung fehlt in der _package.json_ noch das passende Script:

```bash
// package.json_
"scripts": {
   "test:contract": "hurl --test --glob contract-test/*.hurl --report-html ./reports --variables-file ./contract-test/contract-testing.env"
 },
```
Der Befehl startet mit hurl mit folgenden Optionen:

Option | Bedeutung |
-------- | -------- |
--test   | startet hurl als test tool und angepassten Output. --glob    |
--glob   | gibt den Ort und die Benennung der Testdateien an.   |
--report-html| gibt den Speicherort für den HTML-Report an|
--variables-file | benennt die .env-Datei mit Umgebungsvariablen an |

Jetzt muss man die Tests nur noch ausführen:

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
Das vorhandene Backend gibt nicht viel her. Unter der Route _/random_ gibt es ein JSON zurück, das ich mit Hilfe von [JSON-Generator](https://json-generator.com/) erstellt habe. Zusätzlich habe ich noch einen Cookie eingefügt.

![JSON Response](/content/img/0123/jsonResponse.png "json response")

![Cookie](/content/img/0123/cookie.png "cookie")

Aber es reicht um den wesentlichen Nutzen zu zeigen. Man stellt sicher, dass ein bestimmter Aufruf eine vordefinierte Antwort liefert.

### GET & POST

```ts
# validate response
GET { {base_url} }/random
HTTP/1.1 200
[{"_id":"63b17cafa115a1682550035e","index":0,"gui... achtung gekürzt

# send post request

# leerzeichen entfernen
POST { {base_url} }/random
{
  "name" : "Kuba"
}

HTTP/1.1 200

[Asserts]
body contains "Hello Kuba"
```

Der erste Test ruft die URL auf (Zeile 2). In Zeile 3 wird wie oben auf das Protokoll und den Status Code geprüft. Die nächste Zeile enthält das zu erwartende JSON. Weicht es um eine Stelle ab, wird dieser Test scheitern.

Der nächste Test ist ein POST-Request. Es wird ein JSON übermittelt (Zeile 8-9). Nach Prüfung des Protokolls und des Status Codes, folgt der _Asserts_-Block. Hier kann man nun Vergleiche anstellen. Unter https://hurl.dev/docs/asserting-response.html sieht man das Set, das zur Verfügung steht: status, header, url, cookie, body, bytes, xpath, jsonpath, regex, sha256, md5, variable, duration.

Ich verwende _body_ und schaue ob der Inhalt die Zeichenkette "Hello Kuba" enthält. Der eigenen Kreativität ist hier kaum eine Grenze gesetzt.

### Cookie

```ts
// cookie.hurl

# leerzeichen entfernen
GET {{base_url}}/random
HTTP/1.1 200

[Asserts]
cookie "foo" exists
cookie "foo[HttpOnly]" exists
cookie "foo[Secure]" exists
cookie "foo[SameSite]" equals "Lax"
```
In diesem Test werden die Werte des Cookies im oben vorgestellten _Assert_-Block überprüft. Dafür steht das Keyword _cookie_ bereit. Es sucht den benannten Cookie und überprüft auch deren Werte.

### Die .env-Datei
Um in verschiedenen Umgebungen Umgebungsvariablen anzubieten gibt es die oben beschriebene Option _--variables-file_. In dieser können Variablen abgelegt werden:

```ts
// contract-testing.env
base_url=http://localhost:3000
```
In dieser lege ich die _base_url_ ab. Natürlich kann diese je nach Umgebung variieren. Hier könnte man z.B. auch Logindateien ablegen.

In den HURL-Dateien kann danach darauf zugegriffen werden:

```
# leerzeichen entfernen
GET { {base_url} }/random
HTTP/1.1 200
```

Dem findigen Leser ist dies bereits aufgefallen. Achtung! Möchte man auf diese Variablen nun im POST-Body zugreifen, muss dieser in drei Hochkommata stehen.

### Der HTML-Report
Die Option _--report-html ./reports _ sorgt dafür, dass nach dem Ausführen ein Order _reports_ erscheint. In dieser befindet sich eine HTML-Datei, die ausgefürt so aussieht:

![hurl report](/content/img/0123/hurl-report.png "Reporting")

In dieser Werten die Ausführungen aneinandergereiht und man sieht welche gescheitert sind und welche nicht. Es ist ein nettes Feature und hat nicht eine sehr große Informationsdichte. Aber es wird bestimmt in weiteren Releasen erweitert.

### Fazit

Dieser Artikel gibt einen Einblick wie man diese Art von Tests ein- und ausführt. Der Nutzen ist sehr offensichtlich. Es ist ein praktisches und einfaches Tool. Ich wünsche euch damit sehr viel Spaß!


Der Code hierzu liegt auf [Github](https://github.com/derKuba/contract-testing).

Ihr habt Fragen oder Anregungen? Schreibt mir bei [Twitter](https://twitter.com/der_kuba) oder bei [LinkedIn](https://www.linkedin.com/in/jacob-pawlik-08a40015b/).
\
Tausend Dank fürs Lesen!

Kuba
