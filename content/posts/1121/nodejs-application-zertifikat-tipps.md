---
title: Nodejs Zertifizierung(JSNAD) Tipps
description: OpenJS Node.js Application Developer  (JSNAD)
date: 2021-11-27
tags: ["nodejs", "zertifizierung"]
layout: layouts/post.njk
---

Du möchtest die JSNAD Zertifizierung und brauchst ein paar Tipps? Dann bist du hier genau richtig. Ich habe diese Zertifizierung abgelegt und möchte hier meine Strategie erklären.<!-- endOfPreview -->
Am Anfang würde ich die Leute unterteilen, die die Kosten selber tragen müssen und die die es bezahlt bekommen. Letzteren empfehle ich das gesamte Paket mit Kurs zu buchen und ersteren eben nicht. Wenn man sich die [Webeite](https://training.linuxfoundation.org/certification/jsnad/) anschaut, bekommt man auch den genauen Überblick über die Themen und die Gewichtung. Aufmerksame Leser erkennen direkt, dass es sich zum größten Teil um die Überschriften aus der [offiziellen Nodejs-Dokumentation](https://nodejs.org/dist/latest-v16.x/docs/api/) (hab die 16er Doku als Beispiel verlinkt) handelt.

<hr/>

#### **[Buffer](https://nodejs.org/dist/latest-v16.x/docs/api/buffer.html)**, **[Streams](https://nodejs.org/dist/latest-v16.x/docs/api/stream.html)**

-   Was sind Buffer und wie funktionieren sie?
-   Wie erzeugt man sie?
-   Wohin kann man sie transformieren?

_Aufgaben_

-   Instanziiere Buffer.
-   Lese und Schreibe die verschiedenen Datentype.
-   Spiele mit den verschiedenen Methoden der Dokumentation.

<hr/>

#### **Kontrollfluss**

_Inhalt_

Empfehle diese Docs zu lesen:
https://nodejs.org/dist/latest-v16.x/docs/api/globals.html
https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Promise

-   Wie funktionieren Callbacks, Promises?

_Aufgaben_

-   Erzeuge eine Kette von Callbacks.
-   Erzeuge einen Promise und fange die Fehler ab.
-   Stoppe einen laufenden Promise.

<hr/>

#### **[Child Processes](https://nodejs.org/dist/latest-v16.x/docs/api/child_process.html)**

_Inhalt_

-   Wie erzeuge ich aus node heraus einen child process ( wie führe ich mit nodejs weitere Anwendungen aus)?
-   Welche verschiedenen Typen gibt es und was macht den Unterschied aus?
-   Welche Optionen gibt es?
-   Wie komme ich an die logs / den output heran?

_Aufgaben_

-   Erzeuge einen solchen _process_ und gebe die Ergebnisse auf der Konsole aus.

<hr/>

#### **[Debugging](https://nodejs.org/dist/latest-v16.x/docs/api/debugger.html)**

_Inhalt_

-   Wie bringe ich nodejs in den _debug_-Modus?
-   Wie verknüpfe ich Chrome mit nodejs?
-   Wie halte ich an Breakpoints an?

_Aufgaben_

-   Löse die oberen Fragen :-)

<hr/>

#### **[Error Handling](https://nodejs.org/dist/latest-v16.x/docs/api/errors.html)**

_Inhalt_

-   Welche Fehler gibt es?
-   Wie und wann werden sie geworfen?
-   Wie wirft man sie programmatisch?
-   Wie fängt man sie ab?

_Aufgaben_

-   Fange Fehler aus Promises ab.
-   Schreib einen eigenen Fehler.
-   Versuche in Abhängigkeit des Fehlertyps eine andere Fehlermeldung zu werfen.

<hr/>

#### **[Node.js CLI](https://nodejs.org/dist/latest-v16.x/docs/api/cli.html)**

_Inhalt_

-   Welche Kommandozeilenparameter gibt es?
-   Wie lade ich Abhängigkeiten vor dem Ausführen?
-   Wie überprüfe ich die Syntax ohne das Programm auszuführen?

_Aufgaben_

-   Löse die oberen Fragen :-)

<hr/>

#### **[Events](https://nodejs.org/dist/latest-v16.x/docs/api/events.html)**

_Inhalt_

-   Was sind Events?
-   Welche feste Typen gibt es?
-   Wie werfe ich sie?
-   Wie reagiere ich auf sie?
-   Wie sorge ich dafür, dass der Listener ganz oben steht oder nur einmal ausgeführt wird?

_Aufgaben_

-   Erzeuge einen Event und reagiere auf die verschiedenen Typen.
-   Spiele mit den weiteren Methoden.

<hr/>

#### **[File System](https://nodejs.org/dist/latest-v16.x/docs/api/fs.html)**

_Inhalt_

-   Wie schreibe ich Dateien?
-   Wie lese ich Dateien?
-   Was ist der Unterschied zwischen Synchron, Asynchron?
-   Wie lese und unterscheide ich Verzeichnisse?
-   Wie erkenne ich welche Datei neu oder geändert wurde?

_Aufgaben_

-   Löse die oberen Fragen :-)

<hr/>

#### **JavaScript Prerequisites**

https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects
https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Object_prototypes

_Inhalt_

-   Wie sind Objekte aufgebaut?
-   Wie funktioniert Vererbung?
-   Wie hat sich die Vererbung syntaktisch verändert?
-   Wie funktionieren Callbacks und Closures?

_Aufgaben_

-   Erzeuge eine Kette von Objekten, die ihre Eigenschaften/Methoden vererben.
-   Erzeuge eine Funktion, die eine Funktion zurückgibt.

<hr/>

#### **Module system**

https://nodejs.org/dist/latest-v16.x/docs/api/modules.html
https://nodejs.org/dist/latest-v16.x/docs/api/esm.html
https://nodejs.org/dist/latest-v16.x/docs/api/module.html
https://nodejs.org/dist/latest-v16.x/docs/api/packages.html

_Inhalt_

-   Was sind Module?
-   Welche Typen gibt es?
-   Wie exportiere ich meine Objekte, Funktionen?

_Aufgaben_

-   Schreibe eine Funktion, exportiere sie und importiere sie in einer weiteren Datei.

<hr/>

#### **Process/Operating System**

https://nodejs.org/dist/latest-v16.x/docs/api/os.html
https://nodejs.org/dist/latest-v16.x/docs/api/process.html

_Inhalt_

-   Wie zeige ich das Betriebssystem an?
-   Wie beende ich den Process?
-   Wie zeige ich Statistiken an?

_Aufgaben_

-   Löse die oberen Fragen :-)

<hr/>

#### **Package.json**

https://docs.npmjs.com/cli/v8/configuring-npm/package-json
https://semver.npmjs.com/

_Inhalt_

-   Was ist Semver und wie funktioniert es?
-   Wie installiere ich welche Version?
-   Was ist der Unterschied zwischen den Zeichen ~,^. >,<, etc.
-   Wie installiere ich nur Major, Minor und/oder Patches?

_Aufgaben_

-   Spiele mit dem semver-calculator.

<hr/>

#### **Unit Testing**

https://jestjs.io/
https://derkuba.de/content/posts/stenciljs/jest-intro/
https://nodejs.org/dist/latest-v16.x/docs/api/assert.html

_Inhalt_

-   Wie schreibt man Unit-Tests?
-   Wie testet man auf geworfene Fehler?
-   Wie geht man mit Callbacks um ?
-   Wie geht man mit Promises um?

_Aufgaben_

-   Löse die oberen Fragen :-)

<hr/>

#### Vorgehen

Ich war im ersten Anlauf schlecht vorbereitet, weil ich nicht wusste was mich erwartet. Aber man hat zwei Versuche für die Prüfung. Um nicht unnötig etwas auswendig zu lernen und Zeit zu verschwenden, bin ich einfach in die erste Prüfung gegangen. Mit den Erfahrungen aus der ersten Prüfung stand einem erfolgreichen Abschluss im zweiten Anlauf nichts im Weg. Dies würde ich auch jedem so raten.

Wenn man bestanden hat bekommt man eine PDF mit folgendem Inhalt:

![Dateiauswahl](/img/1121/zert.png "Dateiauswahl")<div class="has-text-right image-subline">Bild 1: Mein Zertifikat</div>

Dort ist eine Nummer aufgeführt, die man in einen [Service der Linux-Foundation](https://training.linuxfoundation.org/certification/verify/) eingeben kann und bestätigt bekommt, dass es noch gültig ist:

```ts
Owner: Jacob Pawlik
Certification: OpenJS Node.js Application Developer
Date of Certification Achievement: 2021-11-26
Status: Active
```

<hr/>

#### Fazit

Wenn man mit allen Inhalten und Aufgaben was anfangen kann, dann ist man bereit für die Prüfung.

Mit diesem Wissen sollte jedem diese Prüfung gelingen.

Ihr habt Fragen oder Anregungen? Schreibt mir bei [Twitter](https://twitter.com/der_kuba).

\
Tausend Dank fürs Lesen!

Kuba
