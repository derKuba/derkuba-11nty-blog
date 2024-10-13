---
title: "Kindle 3 als Statusdisplay I"
description: Kindle Display
date: 2024-10-03
tags: ["blog"]
layout: layouts/post.njk
#lang: "de"
#alternate_lang: "en"
#alternate_url: "/posts/en/0122/connecting-address-book-to-backend"
eleventyExcludeFromCollections: true
---

Heute versuche ich mich inspiriert durch den wunderbaren [Dr. Lukas Pustina](https://lukas.pustina.de/) und dem Thema Heimautomatisierung an einer Statusanzeige.
Meine erste Idee war es sich ein E-Ink-Display zu kaufen und es mit dem Raspberry Pi zu verdrahten. <!-- endOfPreview -->Diese finde ich aber in der passenden größe ab 7 Zoll relativ teuer (~70€). Damit war meine Idee gestorben. Zufälligerweise hat der große Versandriese wieder seine neuen Promotionstage angepriesen und mir fiel ein, dass mein alter Kindle nicht mehr mit dem Store verbunden werden kann und ich mir einen günstigen neuen Kaufen müsste (mein alter hat noch eine Tastatur und gehört der dritten Generation an -> nein, nicht der 90er Band :-) ).

Zwecks nachhaltigkeit kam mir die Idee vielleicht einfach dieses Display zu verwenden. Dafür sollte mein neu angeschaffter Raspberry Pi 4 B herhalten. Schnell wurde mir klar, dass der Anschluss nicht möglich ist. Ein erfahrener Hacker hat es zwar geschafft diesen Kindle als Display zu verwenden, konnte aber nur ein [Terminal](https://www.golem.de/news/kindleberry-pi-kindle-reader-als-bildschirm-fuer-das-raspberry-pi-1209-94474.html) anzeigen. Das reicht mir natürlich nicht.

Weitere Recherchen haben dann folgendes [Finding](https://github.com/dennisreimann/kindle-display) gehabt. Ein Entwickler namens [Dennis Reimann](https://github.com/dennisreimann) nutzt seinen Kindle verpackt in einem Bilderrahmen zur Anzeige des Bitcoin-Preises. Jackpot. Genau das möchte ich auch. Dazu führt er auf einem offenen Kindle ein Script aus, dass sich ein Bild von einem Webserver lädt und anzeigt. Gleichzeitig zeigt er wie er einen kleinen Webserver programmiert, der dieses Statusbild herstellt. Ich finde die Idee total raffiniert. Für das Bild schreibt er eine kleine Webseite, macht einen Screenshot davon und stellt es dem Kindle per API zu verfügung.

Los gehts.

Ich zerlege mein Projekt also in folgende Schritte:

-   Kindle öffnen
-   Eigenes Bild darstellen
-   SSH Zugang zum Kindle
-   vom Kindle eine Api aufrufen
-   Bild in geeigneten Ort ablegen
-   Aktualisieren
-   Mockserver mit einem Bild im eigenen Netzwerk platzieren
-   Mockserver durch echten Server ersetzen.

## Kindle öffnen

Es gibt sehr viele Blogposts und Tutorials. Alle Quellen verweisen auf ein altes Forum. Die Software ist schnell geladen, der Kindle per USB angeschlossen, die bin kopiert und die paar Klicks auf dem Gerät getan. Und dann? Nix. Habe diesen Vorgang mehrfach wiederholt. Nada. Nie habe ich das beschriebene Verhalten bekommen.

Nach gefühlt etlichen Versuchen und diversen Webseiten, habe ich mich durch die Ordner auf dem Gerät gewühlt. Siehe da, in einer Textfile stand etwas von erfolgreicher Installation. Auf dem Gerät bekommt man sonst nichts davon mit. Danach habe ich mir den Screensaver vorgenommen, ein eigenes Bild erstellt, drauf gespielt und zack. Nach dem Ausschalten, war alles nur weiß. Ein Reboot brachte dann den erhofften Erfolg:

![Dateiauswahl](/img/1024/fam.jpg "Kindle")<div class="has-text-right image-subline">Bild 1: Eigener Screensaver</div>

Für Feedback bin ich immer dankbar.
Gerne an jacob@derkuba.de

Viele Grüße

Euer Kuba


