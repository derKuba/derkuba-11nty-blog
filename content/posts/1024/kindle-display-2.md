---
title: "Kindle 3 als Statusdisplay II"
description: "Kindle Display"
date: 2024-10-30
tags: ["blog"]
layout: layouts/post.njk
#lang: "de"
#alternate_lang: "en"
#alternate_url: "/posts/en/0122/connecting-address-book-to-backend"
eleventyExcludeFromCollections: true
---

Im letzten Post habe ich darüber berichtet, wie ich erfolgreich ein eigenes Bild auf einem Kindle darstellen konnte. Ich dachte, ich wäre fast am Ziel – weit gefehlt.

<!-- endOfPreview -->

Vorweg: Ich distanziere mich ausdrücklich von jeglicher Raubkopiererei. Mein Kindle ist ein altes Modell der Version 3, das ich mir nach dem Studium aus den USA bestellt habe. Vor kurzem wurde mein Gerät von Amazon ausgemustert und kann nicht mehr auf den Kindle Store zugreifen. Amazon bot mir großzügig 15 % Rabatt auf ein neueres Modell an, doch als Verfechter der Nachhaltigkeit und Vermeider von Elektroschrott entschied ich mich, die Originalsoftware zu modifizieren. Eine Anleitung dazu wird es hier jedoch nicht geben. ;-)

### Die Idee

Meine Idee ist simpel: das Display meines Kindles als Statusanzeige für verschiedene Informationen zu nutzen, darunter:

-   Wetter
-   Kalendereinträge
-   To-do-Liste
-   Einkaufsliste
-   Sensor-Daten aus der Heimautomatisierung

Alles übersichtlich verpackt und in einem schönen Holzrahmen untergebracht. Die notwendigen APIs anzusprechen sollte ja kein Hexenwerk sein, oder? :-)

### Die Architektur

![Architektur](/img/1024/architecture.png "Architektur")<div class="has-text-right image-subline">Bild 1: Architektur</div>

Der Kindle-Part ist eigentlich ziemlich simpel, hat aber dennoch die meiste Zeit beansprucht. Die Anleitungen im Internet sind etwas knifflig, und ChatGPT war eine große Hilfe. Nach etwa 12 Stunden gelang es mir, den Kindle per SSH anzusprechen und darauf Code auszuführen. Es hat riesigen Spaß gemacht! Im Grunde kopiert man zwei Bash-Skripte auf den Kindle und registriert diese als Cronjob. Diese Skripte sorgen dafür, dass ein Bild aus meinem Heimnetzwerk heruntergeladen und auf dem Display angezeigt wird. Klingt einfach, oder?

Tatsächlich funktionierte es schnell – allerdings war das Bild verzerrt. Egal, was ich ausprobierte, ich konnte es nicht korrekt drehen und skalieren. Selbst Referenzbilder aus anderen Projekten wie [diesem hier](https://github.com/mpetroff/kindle-weather-display) wurden problemlos angezeigt. Nach unzähligen Versuchen mit verschiedenen Metadaten, Bildformaten und Skalierungen war ich kurz davor aufzugeben, bis ich das Tool [pngCrush](https://de.wikipedia.org/wiki/Pngcrush) aus dem Referenzprojekt ausprobierte. Aus unerklärlichen Gründen funktionierte es! Von da an war es „nur noch“ eine Frage der richtigen Darstellung der Daten.

### Google API

Die nächste Herausforderung war das Ansprechen der Google-API. Vor einigen Jahren benötigte man dafür lediglich einen API-Key, doch inzwischen ist es ein riesiges Plattform-Ökosystem. Ich legte ein Projekt an, aktivierte die benötigten APIs, kämpfte mich durch Anmelde- und OAuth-Prozesse, aber nichts funktionierte – Google wollte mir ständig eine Anmeldemaske aufdrängen. Ich wurde schließlich auf eine Service-API verwiesen, doch das half auch nicht weiter. Meine Frustration war auf dem Höhepunkt, bis ich auf eine unerwartete Lösung stieß:

**ALLE GOOGLE-KALENDER SIND ÖFFENTLICH EINSEHBAR über eine GEHEIME URL**

Perfekt! Ich brauchte die überkomplizierte und schlecht dokumentierte API von Google nicht mehr. Über diesen öffentlichen Link erhalte ich eine \*.ics-Datei mit allen Kalendereinträgen. Nach etwas Recherche entschied ich mich für das Tool node-ics und konnte plötzlich problemlos auf meine Kalenderdaten zugreifen.

### Einkaufs- und To-do-Listen

Für die Einkaufs- und To-do-Liste wollte ich ursprünglich die Google Tasks API verwenden, aber nach der frustrierenden Erfahrung mit der Kalender-API war das für mich keine Option mehr. Ich ersetzte Google durch Trello. Die API von Trello ist einfach, benötigt nur einen API-Key und ein Token, die beide schnell und unkompliziert erstellt sind.

### Wetter

Für die Wetterdaten nutze ich die [Open Meteo API](https://api.open-meteo.com). Da ich nur ein paar Mal am Tag Daten abfragen möchte, bleibt es kostenlos. Auch hier ist die API unkompliziert: Man gibt den Ort und die gewünschten Datenpunkte an.

### Raspberry Pi

Als Server entschied ich mich für meinen Raspberry Pi Zero W, aber schnell zeigte sich, dass das kleine Gerät etwas zu langsam arbeitete, möglicherweise aufgrund der alten SD-Karte. Daher rüstete ich beides auf einen [Raspberry Pi Zero 2 W](https://www.raspberrypi.com/products/raspberry-pi-zero-2-w/) und eine neue SD-Karte auf. Die Kosten dafür liegen bei etwa 30 Euro. Über die WLAN-Einrichtung habe ich bereits in einem anderen Post geschrieben [(siehe hier)](https://derkuba.de/posts/1024/raspberry-os/).

Node ließ sich leicht installieren, und ich schrieb ein kleines Deployment-Skript, das mithilfe von [node-scp](https://github.com/maitrungduc1410/node-scp-async) die Sourcen per SSH auf den Pi Zero lädt. Für das Prozess-Management wählte ich [PM2](https://pm2.keymetrics.io/), da ich nicht mit Docker arbeiten wollte. Ein kleines Start-Skript sorgt dafür, dass der Node-Service bei jedem Systemstart automatisch läuft.

### Zusammengefügt

Alle Teile zusammen ergeben nun folgenden Ablauf:

#### Bildgenerierung

Das Bild wird über ein Bash-Skript generiert, das als Cronjob ausgeführt wird. Während der Bildgenerierung werden die benötigten Daten aus den verschiedenen APIs geladen und über die Node-Canvas-API auf ein Bild gezeichnet. Dieses Bild wird abschließend durch pngCrush komprimiert und von Fastify bereitgestellt.

#### Webserver

Ein Fastify-Webserver stellt eine Route `/status-display` zur Verfügung, über die das zuletzt generierte Bild heruntergeladen werden kann. Damit der Kindle darauf zugreifen kann, habe ich in meinem Router eine feste IP-Adresse für den Raspberry Pi Zero eingerichtet.

#### Kindle

Auf dem Kindle läuft ebenfalls ein Cronjob, der stündlich den Webserver aufruft, das Bild herunterlädt und anzeigt. Der Kindle bereitete mir lange Zeit Schwierigkeiten, da er regelmäßig „nach Hause telefonierte“ und Teile des neuen Codes überschrieben wurden. Eine Firewall konnte das Problem lösen. Nochmals zur Erinnerung: Der Versandriese hat meinen Kindle 3 aus dem Support genommen.

## Fazit

Durch dieses Projekt konnte ich viel Neues lernen und bestehendes Wissen vertiefen. Alles fügte sich Schritt für Schritt zusammen. Ein letzter Feinschliff bleibt: Ich möchte das Display in einen schönen Rahmen einbauen.

Feedback ist jederzeit willkommen! Gerne an: jacob@derkuba.de

Viele Grüße  
Euer Kuba
