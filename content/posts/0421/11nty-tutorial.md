---
title: 11nty Blog mit eigenem Html-Template
description: Wie ist dieser Blog entstanden
date: 2021-03-30
tags: ["11nty", "bulma", "blog", "tutorial"]
layout: layouts/post.njk
lang: "de"
alternate_lang: "en"
alternate_url: "/posts/en/0421/11nty-tutorial"
---

Seit langer Zeit trage ich den Gedanken mit mir, einen Blog zu erstellen. Die Umsetzung dieses Projekts möchte ich direkt als ersten Blogbeitrag nutzen. <!-- endOfPreview --> Dabei hatte ich folgende Anforderungen:

-   Keine Datenbank
-   Keine aufwendigen, laufzeitbedürftigen Programmiersprachen
-   Der Output sollte eine statische Seite sein.

Eine Google-Suche nach "static site generator 2021" brachte mich auf die folgende Seite:

[Best Static Site Generators - TechRadar](https://www.techradar.com/best/static-site-generators)

An erster Stelle stand Hugo – ein sehr schneller Generator, der auf Go basiert. Hugo hatte ich bereits ausprobiert. Es ist extrem schnell und unkompliziert, solange man ein fertiges Template verwendet. Möchte man jedoch ein eigenes Template erstellen, wurde es (zumindest in Version 0.40 von Hugo) ziemlich fummelig. Da musste es doch eine einfachere Lösung geben.

Da ich eine Vorliebe für JavaScript habe, klang 11ty für mich sehr vielversprechend. Es sollte schnell, einfach und ohne Frameworks wie React oder Angular funktionieren. Und siehe da: Es funktionierte hervorragend.

**Techstack:**

-   [git](https://git-scm.com/)
-   [nodejs @v14.16.0](https://nodejs.org/de/)
-   [npm @6.14.11](https://www.npmjs.com/)
-   [11ty @0.12.1](https://www.11ty.dev/)
-   [Bulma @0.9.2](https://bulma.io/)
-   [Prism @1.23.0](https://prismjs.com/)

Mit den folgenden Schritten habe ich diesen Blog aufgesetzt:

1. **HTML-Template erstellen**

    - HTML-Grundstruktur mit:
        - Menü
        - Navigation
        - Blogdetails
        - Footer

2. **11ty Starter Blog herunterladen** von: [Eleventy Base Blog GitHub](https://github.com/11ty/eleventy-base-blog)

    - Starter-Template klonen und installieren
    - Struktur verstehen und anpassen
    - Eigenes Template integrieren

3. **HTML-Template** in das Starter-Template überführen

### Los geht's

#### Voraussetzungen

-   Node.js und npm sind installiert

#### 1. Template erstellen

Ein klassisches HTML-Layout ist schnell erstellt. Um Zeit zu sparen, habe ich das CSS-Framework [Bulma](https://bulma.io/) verwendet und das Template in folgende Teile gegliedert:

-   [Navigation](https://bulma.io/documentation/components/navbar/)
-   Content
-   Sidebar
-   [Footer](https://bulma.io/documentation/layout/footer/)

![HTML Layout](/img/layout.png "HTML Template")

<div class="has-text-right image-subline">Bild 1: Aufteilung des Layouts</div>

Natürlich sind auch andere Layouts und CSS-Frameworks geeignet. Ich wollte jedoch etwas anderes als Bootstrap ausprobieren.

#### 2. 11ty Starter installieren

[Unter der oben genannten Adresse](https://github.com/11ty/eleventy-base-blog) findet man das Standard-11ty-Starter-Paket. Wenn man auf den "Clone"-Button klickt, erhält man die Git-URL.

```bash
# für SSH
git clone git@github.com:11ty/eleventy-base-blog.git mein-neuer-blog

# oder HTTPS
git clone https://github.com/11ty/eleventy-base-blog.git mein-neuer-blog
```

Nun wechselt man in das entsprechende Verzeichnis und installiert die Abhängigkeiten:

```bash
cd mein-neuer-blog
npm install
```

**11ty Starter-Blog starten**

```bash
npm run server
# oder
npx eleventy --serve
```

Und man sollte Folgendes sehen:

![11ty Starter](/img/0421/11nty-starter.png "11ty Starter")

<div class="has-text-right image-subline">Bild 2: Ausschnitt des Starter-Templates</div>

Auf den ersten Blick erkennt man die dynamischen Elemente, die wir in unserem eigenen Template benötigen:

-   Navigation: Menüpunkte
-   Content: Beiträge
-   Sidebar: Tags

![11ty Starter Elemente](/img/0421/starter-elements.png "11ty Starter Elemente")

**Struktur und Dateiaufteilung**
Für mehr Übersicht habe ich einige Dateien in Ordner aufgeteilt. CSS und JS wurden in das Verzeichnis "Template" verschoben, inhaltsspezifische Dateien in den Ordner "Content". CI-spezifische Dateien habe ich gelöscht.

![Verzeichnisstruktur](/img/0421/file-structure.png "Verzeichnisstruktur")

<div class="has-text-right image-subline">Bild 3: Verzeichnisstruktur</div>

Die Dateien gliedern sich in:

-   **".njk"** (Template),
-   **".md"** (Inhalt / Beiträge),
-   **".json"** (Meta und Konfiguration),
-   **".eleventy.js"** (11ty Konfiguration).

**Eigenes Template verwenden**

Navigation:

-   Eine neue Datei unter "\_includes/layouts/navigation.njk" anlegen.
-   Den Inhalt der eigenen Navigation in diese Datei kopieren.
-   In der Datei "\_includes/layouts/base.njk" findet man das Seitenlayout mit der HTML-Struktur. Die Zeilen 13–23 beinhalten, was wir benötigen. Wir entnehmen `metadata.title` als Titel für unseren Blog und fügen die for-Schleife (Z. 18–24) in unseren nav-container ein.

Vorher:
![Navigation](/img/0421/starter-header.png "Navigation")<div class="has-text-right image-subline">Bild 4: Code des Starter-Headers</div> (Leider rendert 11ty den nunjuk-Code nicht, daher muss ich ein Bild verwenden. Falls jemand einen Workaround kennt, gerne Bescheid geben!)

Nachher:
![Header](/img/0421/bulma-header.png "Header")

<div class="has-text-right image-subline">Bild 5: Bulma Header</div>

Wir übertragen die for-Schleife in den Container für die Navigationselemente.
Anschließend

-   löschen wir in der "base.njk"-Datei den Inhalt, wie er im "Vorher"-Bild zu sehen ist, und ersetzen ihn durch `<div class="clear-image">![Include Header](/img/0421/include-header.png "Include Header")</div>`. Die Datei sollte dann so aussehen:

![Base Datei](/img/0421/base.png "Base-Datei")

<div class="has-text-right image-subline">Bild 6: Starter-Template Base</div>

Neben den eigenen CSS-Dateien und dem Bulma-Burger-Menu-JavaScript sieht man die Navigation und den Footer.

**Inhalt:**

Der Inhalt unterscheidet sich je nach Seite. Auf der Hauptseite möchte ich die Sidebar sichtbar haben, auf den Beitragsdetailseiten jedoch nicht. Daher sind die Dateien **/\_includes/layouts/home.njk** und **postlist.njk** für die Hauptseite relevant, während **post.njk** für die Detailseite verwendet wird.

Der Starter-Template-Code wurde mit dem eigenen Template für den Inhaltsbereich verbunden:

![Inhaltsbereich](/img/0421/content-area.png "Inhaltsbereich")

<div class="has-text-right image-subline">Bild 7: Inhaltsbereich</div>

Neben dem kopierten Standardcode entdeckt man in Zeile 19 einen Bereich, in dem ich mithilfe des Indexes die Bulma-Tag-Klassen an die Tags mappe, um etwas Farbe in den Inhaltsbereich zu bringen. Dafür habe ich einen weiteren Shortcode in der Datei **.eleventy.js** angelegt:

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
    return badge[index % badge.length];
});
```

Der Starter-Template-Code wurde auch für den Detailbereich mit dem eigenen Template verbunden:

![Beitragsdetail](/img/0421/post-detail.png "Beitragsdetailseite")

<div class="has-text-right image-subline">Bild 8: Beitragsdetailseite</div>

Auch für die Liste der Beiträge wurde der Starter-Template-Code mit dem eigenen Template verbunden:

![Beitragsliste](/img/0421/postlist.png "Beitragsliste")

<div class="has-text-right image-subline">Bild 9: Beitragsliste</div>

Zusätzlich verwende ich den Custom-Filter "readingTime", den ich aus dem Starter-Template [Eleventy Chirpy Blog](https://github.com/muenzpraeger/eleventy-chirpy-blog-template/blob/main/.eleventy.js) übernommen habe, um die Lesedauer anzuzeigen.

Damit niemand den Code abtippen muss, habe ich die relevanten Dateien auf [GitHub/derKuba](https://github.com/derKuba/eleventy-examples) abgelegt.
