---
title: "11ty: Inhalt in der Post-Liste anzeigen"
description: Wie zeige ich den ersten Satz in der Post-Liste an
date: 2021-04-04
tags: ["11ty", "excerpt"]
layout: layouts/post.njk
lang: "de"
alternate_lang: "en"
alternate_url: "/posts/en/0421/11nty-excerpt"
---

Wer in der Liste aller Posts zusätzlich den Inhalt anzeigen möchte, hat standardmäßig nur die Möglichkeit, den gesamten Inhalt anzuzeigen. Wenn man jedoch beispielsweise nur den ersten Satz eines Posts anzeigen möchte, muss dies noch über Eleventys JavaScript gelöst werden. <!-- endOfPreview -->

Als Grundlage wird der [11ty Starter Blog](https://github.com/11ty/eleventy-base-blog) verwendet.

Wenn man diesen startet, erhält man folgendes Bild. Es zeigt die Post-Liste mit Titel, Datum und Tags, aber ohne Inhaltsauszug.
![11ty starter](/img/0421/excerpt-place.png "11ty starter")

<div class="has-text-right image-subline">Bild 1: Post-Liste im Starter-Template</div>

Die rote Schrift zeigt den Bereich, in den der Inhalt eingefügt werden soll.
Für die Umsetzung habe ich mich an den folgenden Seiten orientiert:

[Eleventy Chirpy Blog Template](https://github.com/muenzpraeger/eleventy-chirpy-blog-template) und [Blog mit Eleventy erstellen](https://keepinguptodate.com/pages/2019/06/creating-blog-with-eleventy/).

Die Datei **.eleventy.js** benötigt folgende Funktion:

```javascript
const extractExcerpt = (post) => {
    if (!Object.prototype.hasOwnProperty.call(post, "templateContent")) {
        return null;
    }
    const content = post.templateContent;
    const markerIndex = content.indexOf("<!-- endOfPreview -->");

    return markerIndex > 0 ? content.slice(0, markerIndex) + "..." : "";
};
```

Zunächst wird geprüft, ob das Post-Objekt das Feld "templateContent" besitzt, das von Eleventy bereitgestellt werden sollte. Anschließend wird der Inhalt in der `content`-Variablen gespeichert. Der Inhalt wird von Anfang an bis zum Schnipsel **"<!-- endOfPreview -->"** zerschnitten. Natürlich kann hier jedes beliebige, aber möglichst einzigartige Tag verwendet werden. Dieser Marker beschreibt das Ende des Auszugs bzw. der Vorschau. Wenn kein Marker gefunden wird, wird ein leerer String zurückgegeben.

Nun muss Eleventy beigebracht werden, diese Funktion zu verwenden. Es wäre zum Beispiel als Filter möglich, aber ich finde einen "Shortcut" praktischer. Ein Shortcut sieht folgendermaßen aus:

```javascript
// entferne Leerzeichen zwischen {} und %
{ % excerpt pageObject % }
```

<em>Bitte die Leerzeichen zwischen den runden Klammern und dem Prozentzeichen entfernen. Leider rendert 11ty den Ausschnitt ohne Leerzeichen!</em>

```javascript
eleventyConfig.addShortcode("excerpt", (post) => extractExcerpt(post));
```

Das Eleventy-Konfigurationsobjekt erhält nun ein neues Schlagwort "excerpt" (Auszug) und übergibt, wie im vorherigen Code-Snippet gezeigt, das Post-Objekt als Parameter.

Wenn man diesen Shortcut nun in der Datei _/\_includes/postlist.njk_ innerhalb der Listenelemente (< li > </ li >) einfügt, erhält man den gewünschten Inhaltsauszug:

```javascript
{ % excerpt post % }
```

Dieser Marker kann nun in den Markdown-Dateien der Blogposts verwendet werden (**/posts/\*.md**). Einfach nach der gewünschten Länge des Auszugs das **<!-- endOfPreview -->** einfügen.

```html
Leverage agile frameworks to provide a robust
<!-- endOfPreview -->
synopsis for high-level overviews. Iterative
```

![11ty starter](/img/0421/excerpt-final.png "11ty starter")
![11ty starter](/img/0421/excerpt-place.png "11ty starter")

<div class="has-text-right image-subline">Bild 2: Post-Liste mit Inhaltsvorschau</div>

Die Codebeispiele findet ihr auf [Github/derKuba](https://github.com/derKuba/eleventy-examples).

Habt ihr Fragen oder Anregungen? Schreibt mir bei [Twitter](https://twitter.com/der_kuba).

\
Tausend Dank fürs Lesen!

Kuba
