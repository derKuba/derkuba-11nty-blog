---
title: "Fuckup der Woche: Raspberry Pi Zero 2 W - Wenn das Setup nervt und der Wlan-Zugang klemmt"
description: Wie stellt man Storybook ein?
date: 2024-10-12
tags: ["raspberry pi", "fuckup"]
layout: layouts/post.njk
lang: "de"
alternate_lang: "en"
alternate_url: "/posts/en/1024/raspberry-os"
---

Manchmal ist es ja einfach wie verhext. Du kaufst dir voller Vorfreude ein neues Gadget, in meinem Fall einen **Raspberry Pi Zero 2 W**. Dieses winzige technische Wunderwerk hatte ich mir geholt, um mal wieder ein bisschen zu tüfteln und nebenbei was Cooles damit zu bauen. Die Idee: Schnell das **Raspberry OS Lite** über den Imager von der offiziellen [Raspberry Pi Seite](https://www.raspberrypi.com/software/) draufklatschen und loslegen. Das war zumindest der Plan. <!-- endOfPreview -->

![Image](/img/1024/rasp-os1.png "Raspberry Imager")<div class="has-text-right image-subline">Bild 1: Raspberry Image</div>

![Image](/img/1024/rasp-os2.png "Eigene Konfiguration")<div class="has-text-right image-subline">Bild 2: Eigene Konfiguration</div>

![Image](/img/1024/rasp-os3.png "Wlan-Daten eintragen")<div class="has-text-right image-subline">Bild 3: Wlan-Daten eintragen</div>

![Image](/img/1024/rasp-os6.png "ssh aktivieren")<div class="has-text-right image-subline">Bild 6: ssh aktivieren</div>

Nun, wie das mit Plänen so ist: Sie funktionieren – bis sie es nicht mehr tun.

### Die böse Überraschung: USB Adapter streikt

Nachdem der Imager brav seinen Job erledigt hatte und das Image auf die SD-Karte geschaufelt war, war ich in bester Laune. **Aber dann kam der Moment der Wahrheit**: Ich schloss das gute Stück an meinen USB-Adapter an und wollte voller Erwartung darauf zugreifen. Doch nichts. Kein Lebenszeichen. Der Pi blieb hartnäckig und stumm. Kein Zugriff, keine Interaktion, einfach nada.

Nun gut, dachte ich mir, nicht gleich verzweifeln. Also Plan B: Schnell mal per SSH drauf connecten. Über den Imager lässt sich ja auch ganz komfortabel **SSH aktivieren** und sogar die Zugangsdaten eintragen. Das muss ja klappen, dachte ich optimistisch.

### Spoiler: Es klappte natürlich nicht.

### Der steinige Weg zur Lösung: Viel Fluchen, wenig Fortschritt

Nach gefühlt hundert Versuchen – Neustarts, Kabelwechsel, wütenden Googlesuchen – war immer noch nichts. Irgendwann dämmerte es mir: Irgendwo muss der Haken sein. Und so begann das klassische **Trial-and-Error-Spiel**. Ich tauchte tief in Foren ein, las Anleitungen, durchforstete Blogartikel, die von ähnlichen Problemen berichteten. Doch alles, was ich versuchte, lief ins Leere.

Als ich schon fast drauf und dran war, das Ding aus dem Fenster zu werfen, kam mir eine Idee, die sich letztlich als **Lichtblick** herausstellte. Ein Blick auf die SD-Karte verriet mir nämlich, dass auf der Boot-Partition eine kleine Datei mit dem Namen `firstrun.sh` existiert. Hm, dachte ich, was könnte da wohl drinstehen?

### Die Lösung: `firstrun.sh` – Dein neuer bester Freund

Also öffnete ich die Datei und fand dort etwas Interessantes: **Netzwerkeinstellungen**. Und siehe da, genau hier lag der Hund begraben. Während der Imager zwar die Oberfläche für das Einrichten der SSH-Verbindung bietet, scheint irgendwas beim Schreiben der Zugangsdaten nicht sauber zu laufen. Also: Selbst ist der Mann (oder die Frau)!

Der Trick war einfach, aber effektiv. In der Datei gibt es einen Abschnitt, der sich um das WLAN kümmert. Ich musste also **händisch** mein WLAN-Passwort eintragen. Und zwar **im Klartext**. Japp, genau, direkt und unverschlüsselt. Was soll’s, dachte ich. Also flugs den Text reingehauen, SD-Karte zurück in den Pi, und…

![Image](/img/1024/rasp-os4.png "firstrun.sh")<div class="has-text-right image-subline">Bild 4: firstrun.sh editieren</div>

![Image](/img/1024/rasp-os5.png "firstrun.sh passwort in klartext")<div class="has-text-right image-subline">Bild 5: firstrun.sh passwort in klartext eintragen</div>

### …wie von Zauberhand: Verbindung steht!

Nach dem nächsten Bootvorgang hat sich der Raspberry Pi Zero 2 W endlich brav ins WLAN eingeloggt. Der SSH-Zugang funktionierte einwandfrei, und ich konnte endlich auf das Gerät zugreifen.

### Fazit: Von Frust zu Fortschritt

Am Ende bleibt ein wertvoller **Lerneffekt**: Manchmal reicht es nicht, sich auf die automatischen Tools zu verlassen. Ein Blick „unter die Haube“ hilft oft, den wahren Fehler zu finden. Hätte mir jemand zu Beginn gesagt, dass ich das WLAN-Passwort manuell und unverschlüsselt in einer Skriptdatei hinterlegen muss, hätte ich mir wahrscheinlich ein paar Nerven gespart.

Also, lesson learned: Der Raspberry Pi mag klein und zickig sein, aber mit ein bisschen Detektivarbeit kriegt man auch den störrischsten Zero 2 W zum Laufen.

Für Feedback bin ich immer dankbar.
Gerne an jacob@derkuba.de

Viele Grüße

Euer Kuba
