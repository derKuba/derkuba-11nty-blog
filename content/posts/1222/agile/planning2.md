---
title: "Planning 2: Ablauf für Devs"
description: Ein erfolgreiches und befriedigendes Planning 2
date: 2022-12-28
tags: ["agile", "scrum"]
lang: "de"
alternate_lang: "en"
alternate_url: "/posts/en/1222/agile/planning2"
layout: layouts/post.njk
---

Jedes Mal, wenn ich auf eine Person treffe, die sagt, sie würde in einem agilen Team nach Scrum arbeiten, stelle ich die Frage nach Planning 2. <!-- endOfPreview --> Meine persönliche Statistik (meine Umfragen sind natürlich nicht repräsentativ) zeigt, dass in 9 von 10 Fällen darauf verzichtet wird. Ich frage dann weiter nach dem "Warum" und auch hier ist in den meisten Fällen die Antwort, dass man gar nicht von der Existenz dieser Zeremonie weiß. Fairerweise muss man aber sagen, dass der [offizielle Scrumguide](https://scrumguides.org/scrum-guide.html#sprint-planning) in dieser Hinsicht etwas unspezifisch ist und nicht zwischen Planning 1 und Planning 2 unterscheidet. Es gibt eine gemeinsame und geteilte Timebox.

Ich möchte hier keine Diskussion auslösen, sondern nur ein hilfreiches Werkzeug beschreiben. Es dient als Impuls für euer nächstes Planning 2!

## Was ist der Unterschied?

Mein Team und ich haben es vom anfänglichen "Da schreiben wir nur die Tasks auf" zu einer ordentlichen Zeremonie gebracht. Aber wie unterscheidet man nun das erste vom zweiten Planning:

![was ist das planning 2](/img/1222/what.png "Was ist das Planning 2")

Im ersten Teil versammeln sich alle: Product Owner, Business Analyst, Entwickler, QA, UI/UX, Fachexperten etc. Es wird das "Was" geklärt. Es geht hierbei um den Umfang: Welche Stories/Tickets werden in den nächsten Sprint genommen? Einvernehmlich. Es kommt zum Commitment.

Für das Planning 2 dienen diese Stories nun als Grundlage. Denn jetzt wird geschaut, wie man konkret und technisch zur Lösung kommt. Alle Fragen sollten bereits im Refinement geklärt sein. Meine persönliche Erfahrung zeigt jedoch, dass dort meist immer dieselben Menschen sprechen und mitdenken. :-) Ich gehöre nicht dazu.

Jetzt ist der richtige Zeitpunkt, nochmal alles zu überdenken, Fragen zu stellen und dann gemeinsam einen Lösungsweg zu definieren. Aber wie geht man dabei am besten vor? Ich empfehle einen Ablauf, den man immer wiederholen kann:

![wie läuft das planning 2 ab](/img/1222/ceremony.png "Wie läuft es ab")

## Wie läuft es ab?

Vor jeder Runde sollte jemand bestimmt werden, der vorstellt. Diese Person stellt ihre Ergebnisse vor, schreibt mit, gruppiert etc. Ein Scrum-Master kann gerne aushelfen. Zur besseren Abwicklung empfehle ich irgendein Board (virtuell oder analog), Stift und Zettel.

### 1. Verstehen

Das Board wird geteilt und das erste Ticket geöffnet. Zunächst beginnt man mit dem Verstehen: Jeder Teilnehmer liest für sich die Anforderungen und versucht zu verstehen, worum es geht. Offene Fragen werden beantwortet, die Anforderungen ggf. geschärft und/oder Akzeptanzkriterien nachgetragen. Am Ende haben alle "nahezu" dasselbe Verständnis, worum es geht.

### 2. Planen

Im nächsten Schritt wird eine Timebox vereinbart, vielleicht 3-5 Minuten, je nach Größe und Umfang des Tickets. Jeder überlegt für sich, wie man die Story in sinnvolle, kleine Aufgaben zerteilen kann, und schreibt diese für sich auf.

##### Beispiel

Als Beispielstory nehmen wir ein Formular. Es soll ein neues Eingabefeld für das Alter hinzugefügt werden.

An dieser Stelle kommt häufig von unerfahrenen Kollegen die Aussage, dass man nur eine Aufgabe zu bewältigen hat: das Machen. Aber wenn man kurz darüber nachdenkt, fallen noch einige weitere Aufgaben auf. Ich empfehle immer, die Aufgaben so zu schneiden, dass man sie theoretisch parallel mit mehreren Personen umsetzen kann:

Man muss ein neues Feld in der UI anlegen, das Datenmodell erweitern, die Anbindung an das Backend schreiben, ggf. die Datenbank erweitern, Tests schreiben usw.

Damit haben wir eine gute Grundlage für den nächsten Schritt.

### 3. Diskutieren

Die gesammelten Punkte werden nun vom gewählten Präsentator vorgestellt. Dieser wechselt nach jeder Story, damit jeder mal an die Reihe kommt. Er stellt vor und erklärt seine gesammelten Punkte. Im Anschluss können weitere Punkte der übrigen Teilnehmer gesammelt und diskutiert, Abhängigkeiten geklärt und eine Reihenfolge definiert werden. Häufig freut man sich, wenn man auf dieselben Punkte gekommen ist. Umso mehr freut man sich, wenn noch weitere Punkte auffallen, an die man gar nicht gedacht hat.

### 4. Einigung

Im letzten Punkt sollten sich alle einig sein, dass man einen Weg durch die Story gefunden hat. Wenn nicht, geht man einen Schritt zurück und diskutiert erneut. Ziel ist es, dass alle denselben Weg der Entwicklung einschlagen werden. Natürlich ist das nicht immer der Fall. Man kann den Plan aber in jedem Daily anpassen. Niemand startet jedoch mehr kopflos, um nach einigen Tagen zu merken, dass man sich verrannt hat. Jetzt könnte man noch die gesammelten Aufgaben in Sub-Tasks niederschreiben und mit der nächsten Story starten. Alternativ schreiben wir manchmal alle Sub-Tasks am Schluss auf.

## Fazit

Mit dieser Methode zwingt man sich, den aktuellen Sprint, auf den man sich committet hat, nochmal en détail anzuschauen und zu überdenken. Jeder ist gefragt. So kommen auch die ruhigeren Mitglieder des Teams dazu, etwas zu sagen. Am Ende haben alle einen und denselben Plan vom Sprint, und es sollte keine Rolle mehr spielen, wer sich welche Story nimmt. Es herrscht Einigung, und es gibt einen Plan. Besonders unerfahrene und chaotische Kollegen ;-) werden abgeholt und eingefangen. Das kann die Retrospektive extrem verkürzen.

Mit der Zeit wird diese Zeremonie auch kürzer. Meinem Team und mir hat diese Methode viel Zeit, Diskussionen und Nerven gespart.

Habt ihr Fragen oder Anregungen? Schreibt mir bei [Twitter](https://twitter.com/der_kuba) oder bei [LinkedIn](https://www.linkedin.com/in/jacob-pawlik-08a40015b/).
\
Tausend Dank fürs Lesen!

Kuba
