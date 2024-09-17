---
title: Meine Erfahrung mit der Nodejs Zertifizierung
description: OpenJS Node.js Application Developer
date: 2021-11-19
tags: ["nodejs", "zertifizierung"]
layout: layouts/post.njk
---

Vor zwei Jahren habe ich für mein Team eine Möglichkeit zur Weiterbildung gesucht. Die Idee war es das Team auf einen Wissensstand zu bringen. Wie erreicht man, dass ein Team die Dokumentation studiert und dabei etwas lernt? Mit einer Zertifizierung.<!-- endOfPreview --> Wenn man etwas recherchiert stößt man auf die OpenJS Foundation, die von der linux foundation getragen wird. Sie bietet eine Zertifizierung an. Es gibt zwei Wahlmöglichkeiten, Application (OpenJS Node.js Application Developer (JSNAD)) und Service (Service OpenJS Node.js Services Developer (JSNSD)). Ersteres prüft die Basics von nodejs ab und das zweite den Webservice-Bereich. Zur Zeit meiner Buchung gab es ein Komplettpaket für 500$, bestehend aus der Prüfung und einem Vorbereitungskurs. Sobald man bezahlt hat und den Kurs aktiviert hat, erhält man ein Jahr Zugriff auf den Kurs und kann innerhalb des Jahres auch die Prüfung ablegen. Im weiteren Verlauf beschreibe ich die Application-Zertifizierung.

#### Was bringt das Zertifikat

Wenn man besteht, erhält man eine PDF und ein digitales Badge. Es soll beweisen (auf der Webseite steht, dass man seinem Arbeitgeber zeigen kann), dass man ohne zu googlen schnell Anforderungen aus dem nodejs core umsetzen kann. Das ganze natürlich unter Zeitdruck.

#### Vorbereitungskurs

Der Online-Selbstlernkurs ist Unterteilt in 17 Kapitel, das die wesentlichen nodejs-Sektionen erklärt (Modules, Promises, Streams, Buffer etc.) Jedes Kapitel besteht aus einer Einführung, einem Wissens- und Erklärungsteil, einer kleinen Übungsaufgabe und einem Quiz (meistens aus 3 einfachen Fragen). Die große Frage im Raum ist, ob die Inhalte wirklich gut auf die Prüfung vorbereiten. Teilweise ja. Die Übungsaufgaben gleichen dem Stil der Aufgaben aus der Prüfung. Die 200$ Extragebühr sind hier leider nicht wirklich gut angelegt. Da die Kapitel [öffentlich sind](https://training.linuxfoundation.org/certification/jsnad/) rate ich Sparfüchsen sich die Dokumentation anzuschauen und sich darauf kleine Übungen abzuleiten. Die Literaturempfehlung aus dem Vorbereitungskurs kann man sich auch schenken. Es wird ein Cookbuch, das fertige nodejs-Rezepte anbietet empfohlen. Ein Grundlagenbuch wäre da hilfreicher. Ein Blick in meine [Tipps](https://derkuba.de/posts/1121/nodejs-application-zertifikat-tipps/) lohnt sich aber definitiv ;-)

#### Setup der Prüfung

Es handelt sich um eine Online-Prüfung. Dafür wird ein spezieller Browser benötigt, der euer System überprüft. Er prüft auf eine funktionierende Kamera, ein Mikrofon, genügend Internet und ob nur ein Monitor angeschlossen ist. Vor dem Start muss man seinen Personalausweis fotografieren, sich selber und den Ort, an dem man die Prüfung vornehmen möchte (auch unter dem Schreibtisch :-) ). Dies schaut sich der "Aufseher" vor der Prüfung an. Wer im Café oder Großraumbüro die Prüfung ablegen möchte, wird nicht zugelassen.

#### Die Prüfung

Wenn man Zugelassen wird, öffnet sich im Browser ein Linuxdesktop (Centos 7) mit geöffnetem Browser und die Uhr beginnt zu ticken. Keine Zeit sich einzugewöhnen oder mal kurz anzukommen. Die Uhr tickt. Die Fragen sind auf einer Webseite, unterteilt in die angegeben Kategorien und bestehen aus einer bis drei Aufgaben. Ich war ehrlich gesagt überrascht über die Aufgabenstellungen. Ich hatte mit einer Art Mischung aus Fragen und Aufgaben gerechnet, weil ich dies ja aus dem Vorbereitungskurs gewöhnt war. Die Fragen sehen aus wie die Artikel aus meinem Blog. Es gibt Text und Codeblöcke, die die Aufgabenstellung erklären. Ich wusste aber nicht wohin mit der Antwort. Eine graue Box erklärte mir schließlich, dass ich unter einem bestimmten Ordner die Aufgaben finde. Jede Aufgabe war ein kleines JS-Programm oder eine Package.json oder zusätzliche JS-Dateien. Es gab eine Konsole, einen Browser (der allerdings nur die Prüfung und die nodejs- und mozilla-js-Doku öffnet) und zu meiner Beruhigung VSC. Der Ablauf ist immer derselbe. Aufgabe verstehen (alles nur auf Englisch), Ordner finden, Lösung eingeben, (evtl. kurz ausführen) und weiter. Nach exakt zwei Stunden fliegt man aus dem Desktop raus. Die Ergebnisse erhält man innerhalb von 24 Stunden. Sollte man nicht bestanden haben, hat man einen weiteren kostenlosen Versuch übrig.

#### Besonderheiten...

... die bei mir zur extremen Verwirrung führten.

**Du stehst unter Beobachtung**

Es gibt eine Klausuraufsicht. Das ist natürlich normal, man kennt es aus Prüfungssituation. Deine Kamera und dein Mikro läuft, aber du siehst niemanden. Das System kommuniziert über Vollbildwarnungen und einem kleinen Chat. Du wirst gesehen, aber du siehst niemanden.

**Sehr Strenge Regeln**

-   Es wird genau darauf geachtet, dass wirklich nichts auf dem Schreibtisch ist. Ich musste meine Flasche Wasser wegstellen, weil das Etikett beschriftet war.
-   Man darf keine Selbstgespräche führen, murmeln oder flüstern. Ja, auch wenn du in deinem zu Hause sitzt. Man wird verwarnt oder sogar ausgeschlossen.
-   Man darf sich nicht den Kopf stützen oder seinen Mund verdecken. Bei Wiederholung droht der Ausschluss.
-   Ich habe eine Warnung bekommen, ich würde eine Gamepad verwenden und meine Verwunderung darüber führte zur Verwarnung ich würde reden ;-)
-   Man muss sein Gesicht jederzeit sichtbar in der Kamera halten, sodass das Gesicht beim Vorlehnen immer noch sichtbar ist.

#### Die VM

-   Bei mir brach die Performance ein. Das Hin- und Herschalten zwischen den Fenstern wurde langsamer.
-   Du kannst nicht per Tab das Fenster wechseln. Wer gewohnt ist zwischen Browser, Code und Konsole zu wechseln per Tastatur wird enttäuscht.
-   Es gibt kein Copy&Paste. Man muss immer wieder mal Codeblöcke wiederverwenden oder aus der Doku kopieren. Auch das geht nur per Maus.

#### Fazit

Ich war nach den zwei Stunden ehrlich gesagt gefrustet und etwas enttäuscht. Ich dachte der Kurs hätte mich auf die Prüfung vorbereitet. Aber das war ein Trugschluss. Die merkwürdige Umgebung, in der man sich nicht einfinden konnte, die Masse an Aufgaben in der kurzen Zeit hinterließen einen faden Nachgeschmack.
Meiner Meinung nach sollte es eine Eingewöhnung-VM geben, die man in Ruhe ausprobieren kann, damit man da keine Zeit verschwendet. Die fehlende Möglichkeit einen weiteren Monitor anzuschließen, inklusive Ermahnung nicht zu nah an den Bildschirm zu dürfen, führten zur Nackenstarre, da alles sehr klein dargestellt wurde. Hat man in die Prüfung hineingezoomt, verschwanden die Aufgaben mit der Aufforderung wieder heraus zu zoomen.

Insgesamt halte ich das Zertifikat für Zweifelhaft. Man kann damit nachweisen, dass man sich in der Nodejs-Doku auskennt und die Basiselemente kennt. Das macht leider noch keinen Programmierer aus. Merkwürdig finde ich, dass man das Zertifikat nur drei Jahre tragen kann. Man könnte das Zertifikat doch an die NodeJs-Version klammern, in der man bestanden hat. Zur Verbesserung seiner Bewerbung würde ich jedem Kandidaten raten stattdessen lieber ein kleines Beispielprojekt zu programmieren und sich damit vorstellen. Damit beweist man, dass man nodejs verstanden hat und hat eine gute Grundlage für ein Vorstellungsgespräch. Das beeindruckt mich mehr als dieser Schein. Aber das ist natürlich Geschmacksache. Da ich das Zertifikat über meinen Arbeitgeber machen konnte, war es zu verschmerzen. Aus eigener Tasche hätte ich es nicht gemacht. Mangels alternativen werde ich über die betriebliche Weiterbildung weitere Zertifikate machen. Aber nicht um diese irgendwo zu zeigen, sondern einfach um sich ein bisschen weiter aufzuschlauen.

Ihr habt Fragen oder Anregungen? Schreibt mir bei [Twitter](https://twitter.com/der_kuba) oder per <a href="mailto:jacob@derkuba.de"> E-Mail</a> .

\
Tausend Dank fürs Lesen!

Kuba
