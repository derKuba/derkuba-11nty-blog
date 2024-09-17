---
title: 11nty Blog mit eigenem Html-Template
description: Wie ist dieser Blog entstanden
date: 2021-03-30
tags: ["11nty", "bulma", "blog", "tutorial"]
layout: layouts/post.njk
---

Seit langer Zeit sitzt in meinem Kopf der Gedanke einen Blog aufzusetzen. Die Umsetzung möchte ich direkt als ersten Post nutzen. <!-- endOfPreview --> Als Anforderung habe ich folgende Punkte:

-   keine Datenbank
-   keine aufwendigen, runtime-bedürftigen Programmiersprachen
-   Output soll eine statische Seite sein.

Die Google-Suche "static site generator 2021" hat folgende Seite hervorgebracht:

https://www.techradar.com/best/static-site-generators

An erster Stelle steht Hugo. Ein sehr schneller Generator, der auf GO setzt. Hugo hatte ich bereits ausprobiert. Es ist sehr schnell und einfach, solange man ein fertiges Template verwendet. Möchte man dagegen ein eigenes, war relativ viel Gefrickel notwenig ( Stand Hugo 0.40 ). Das muss doch einfacher gehen.
Da ich ein großes Herz für JS habe, las sich 11nty sehr gut. Es sollte schnell, einfach und ohne Frameworks wie React oder Angular auskommen. Und siehe da es ging sehr gut.

Techstack:

-   [git](https://git-scm.com/)
-   [nodejs @v14.16.0](https://nodejs.org/de/)
-   [npm @6.14.11](https://www.npmjs.com/)
-   [11nty @0.12.1 ](https://www.11ty.dev/)
-   [Bulma @0.9.2](https://bulma.io/)
-   [prism @1.23.0 ](https://prismjs.com/)

Mit folgenden Schritten habe ich diesen Blog aufgesetzt:

1. **HTML-Template erstellen**

    - HTML-Grundstruktur mit
        - Menu,
        - Navigation,
        - Blogdetail
        - Footer

2. **11nty Starter** Blog download unter: https://github.com/11ty/eleventy-base-blog

    - Starter-Template klonen und installieren
    - Aufbau und Struktur
    - Custom-Template überführen

3. das **HTML-Template** in das Startertemplate überführen

### Los gehts

#### Vorbedingung

-   Nodejs und NPM sind installiert

#### 1. Template anlegen

Ein einfaches und klassisches HTML Layout ist schnell aufgesetzt. Um Zeit zu Sparen habe ich als CSS-Framework [Bulma](https://bulma.io/) genommen und das Template in folgende Teile geteilt:

-   [Navigation](https://bulma.io/documentation/components/navbar/)
-   Content
-   Sidebar
-   [Footer](https://bulma.io/documentation/layout/footer/)

![html layout](/img/layout.png "HTML Template")

<div class="has-text-right image-subline">Bild 1: Aufteilung Layout</div>

\
Es eignen sich auch andere Layouts und andere CSS-Frameworks. Ich hatte Lust auf eine Bootstrap-Alternative.

#### 2. 11nty Starter installieren

[Unter der oben genannten Adresse](https://github.com/11ty/eleventy-base-blog) findet man das Standard 11nty Starter Paket. Wenn man auf den "Clone"-Button klickt, erhält man die Git-Url.

```bash
# für ssh
git clone git@github.com:11ty/eleventy-base-blog.git mein-neuer-blog

# oder https
git clone https://github.com/11ty/eleventy-base-blog.git mein-neuer-blog
```

Nun muss man in den Ordner navigieren und die Abhängigkeiten installieren:

```bash
cd mein-neuer-blog
npm install
```

\
**11nty Starter-Blog starten**

```bash
npm run server
# oder
npx eleventy --serve
```

und man sollte folgendes sehen:

![11nty starter](/img/0421/11nty-starter.png "11nty starter")

<div class="has-text-right image-subline">Bild 2: Ausschnitte Starter Template</div>

\
Man erkennt auf den ersten Blick, die dynamischen Elemente, die wir in unserem eigenen Template benötigen.

-   Navigation: Menüpunkte
-   Content: Posts
-   Sidebar: die Tags

![11nty starter elements](/img/0421/starter-elements.png "11nty starter elements")

\
**Aufbau und Dateistruktur**
Für etwas mehr Übersicht habe ich einige Dateien in Ordner aufgeteilt. CSS und JS habe ich in das Verzeichnis Template gezogen, Inhaltsspezifische Dateien in den Ordner "Content" und CI-spezifische Dateien habe ich gelöscht.

![Verzeichnisstruktur](/img/0421/file-structure.png "verzeichnisstruktur")

<div class="has-text-right image-subline">Bild 3: Verzeichnisstruktur</div>

\
Die Dateien untergliedern sich in

-   **".njk"** (Template),
-   **".md"** (Content / Posts)
-   **".json"** ( Meta und Config )
-   **".eleventy.js"** ( 11nty Konfiguration).

\
 **Selbstgebautes Template verwenden**

Navigation:

-   neue Datei anlegen unter "\_includes/layouts/navigation.njk".
-   inhalt der eigenen Navigation in diese Datei kopiert.
-   unter "\_includes/layouts/base.njk" findet man das Seitenlayout mit HTML-Struktur.
    Zeilen 13-23 beinhalten was wir benötigen. Wir entnehmen den metadata.title als Titel für unseren Blog und packen die for-Schleife (Z. 18-24)
    in unsere nav-container.

vorher:
![navigation](/img/0421/starter-header.png "Navigation")<div class="has-text-right image-subline">Bild 4: Code Starter-Header</div> (leider rendert an dieser Stelle 11nty den nunjuk-code und ich muss ein Bild verwenden. Vielleicht kennt jemand einen workaround?)

nachher:
![header](/img/0421/bulma-header.png "Header")

<div class="has-text-right image-subline">Bild 5: Bulma Header</div>
Wir überführen die For-Schleife in den navigation-items container.
Anschließend

-   in der "base.njk"-datei löschen wir nun den Inhalt wie er auf dem vorher-Bild zu sehen ist und ersetzen in durch <div class="clear-image">![Include Header](/img/0421/include-header.png "Include Header")</div> und die Datei sollte wie folgt aussehen:
![Base Datei](/img/0421/base.png "Base-Datei")
<div class="has-text-right image-subline">Bild 6: Starter-Template Base</div>
Neben den eigenen CSS-Dateien, dem Bulma-Burger-Menu-Javascript, sieht man die Navigation und den Footer.

\
**Content:**

Der Content-Bereich unterscheidet sich jetzt je nachdem auf welcher Seite man sich befindet. Ich möchte, dass auf der Hauptseite die Sidebar sichtbar ist und auf den Post-Detailseiten nicht. Daher werden jetzt die vorgefertigten Dateien **/\_includes/layouts/** <em>-home.njk</em> und <em>-postlist.njk</em> für die Hauptseite relevant und die<em>post.njk</em> Datei für die Detailseite.

Für Content-Bereich wurde der Starter-Template Code mit dem eigenen Template verbunden:

![content](/img/0421/content-area.png "Content Bereicht")

<div class="has-text-right image-subline">Bild 7:Content Bereich</div>

Neben dem kopierten Standardcode entdeckt der findige Leser auch den Bereich in Zeile 19. Dort mappe ich anhand des Indexes die Bulma Tag Klassen an den Tag, um so ein wenig Farbe in den Seitenbereich zu bekommen. Dafür habe ich einen weiteren Short-Code angelegt in der <em>.eleventy.js-</em>Datei angelegt:

```javascript
eleventyConfig.addPairedShortcode("badge", function (_, index) {
    const badge = [
        "is-black",
        "is-primary",
        "is-link",
        "is-success",
        "is-dark",
        "is-warning",
        "is-danger",
    ];
    if (index < badge.length) {
        return badge[index];
    }

    const color = index % badge.length;

    return badge[color];
});
```

Für den Detail-Bereich wurde der Starter-Template Code mit dem eigenen Template verbunden:

![post detail](/img/0421/post-detail.png "Post Detail Seite")

<div class="has-text-right image-subline">Bild 8: Detail Seite</div>

Für die List der Posts wurde der Starter-Template Code mit dem eigenen Template verbunden:

![Post-List](/img/0421/postlist.png "Liste aller Posts")

<div class="has-text-right image-subline">Bild 9: Detailseite Posts</div>

Auch hier verwende ich noch einen weitern Custom-Filter "readingTime", den ich aus dem weiteren Starter-Template
https://github.com/muenzpraeger/eleventy-chirpy-blog-template/blob/main/.eleventy.js entnommen habe, um die Lesedauer anzuzeigen.

Damit niemand den Code abtippen muss, habe ich die relevanten Dateien auf [Github/derKuba](https://github.com/derKuba/eleventy-examples) abgelegt.
