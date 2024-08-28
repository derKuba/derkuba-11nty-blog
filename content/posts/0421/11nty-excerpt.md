---
title: 11nty Inhalt anzeigen in der Liste
description: Wie zeigen ich den ersten Satz in der Postliste an
date: 2021-04-04
tags: ["11nty", "excerpt"]
layout: layouts/post.njk
---

Wer in der Liste aller Posts zusätzlich den Inhalt anzeigen möchte, hat out-of-the-box nur die Möglichkeit den gesamten Inhalt anzuzeigen. Wenn man z.B. nur den ersten Satz eines Posts anzeigen möchte, muss dies dem Javascript von Eleventy noch beibringen. <!-- endOfPreview -->

Als Grundlage wird der [11nty-Starter-Blog](https://github.com/11ty/eleventy-base-blog) verwendet.

Wenn man diesen startet, erhält man folgendes Bild. Es zeigt die Post-Liste mit Titel, Datum und Tags, aber ohne Auszug des Inhalts.
![11nty starter](/content/img/0421/excerpt-place.png "11nty starter")
<div class="has-text-right image-subline">Bild 1: Post-Liste im Starter Template</div>

Die rote Schrift zeigt den Ort an, an dem der Inhalt eingefügt werden soll.
Für die Umsetzung habe ich mich an folgenden Seiten orientiert:

https://github.com/muenzpraeger/eleventy-chirpy-blog-template und
https://keepinguptodate.com/pages/2019/06/creating-blog-with-eleventy/ .

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

Zunächst wird geprüft ob das Post-Object das Feld "templateContent" besitzt. Dies sollte von Eleventy bereitgestellt werden. Anschließend wird es in der Content-Variable gecached. Der Inhalt wird zerschnitten vom Anfang bis zum Schnippsel **"<!-- endOfPreview -->"**. Hier kann natürlich jedes beliebiges, aber möglichst vom Inhalt abhebendes Tag verwendet werden. Das ist ein Marker, der das Ende der Auszuges, bzw. der Vorschau, beschreibt. Wenn kein Marker gefunden wird, wird ein leerer String zurückgegeben.

Nun muss Eleventy beigebracht werden, diese Funktion zu werden. Es wäre z.B. als Filter möglich, aber ein "Shortcut" erscheint für mich praktischer. Ein Shortcut sieht aus wie folgt:

```javascript
// remove whitespace between {} and %
{ % excerpt pageObject % }
```
<em>Bitte die Leerzeichen entfernen zwischen den runden Klammern und dem Prozentzeichen. Leider rendert 11nty den Ausschnitt ohne Leerzeichen!</em>

```javascript
eleventyConfig.addShortcode("excerpt", (post) =>
    extractExcerpt(post)
);
```
Das Eleventy-Config-Object nun ein neues Schlagwort "excerpt" (Auszug) und übergibt als Parameter wie im vorherigen Code-Snippet angezeigt das Postobjekt.

Wenn man diesen Shortcut nun in der Datei */_include/postlist.njk* innerhalb der Listen-Tags (< li > </ li >) einfügt, erhält man seinen gewünschten Inhaltsauszug.

```javascript
 { % excerpt post % }
```

Dieser Marker kann jetzt in den Markdown-Dateien der Blogposts verwendet werden(**/posts/*.md**). Einfach nach gewünschter Länge des Auszuges das **< !-- endOfPreview -- >** einfügen.

```html
Leverage agile frameworks to provide a robust <!-- endOfPreview -->
synopsis for high level overviews. Iterative 
```

![11nty starter](/content/img/0421/excerpt-final.png "11nty starter")
![11nty starter](/content/img/0421/excerpt-place.png "11nty starter")
<div class="has-text-right image-subline">Bild 2: Post-Liste mit Inhaltvorschau</div>

\
Die Codebeispiele findet ihr auf [Github/derKuba](https://github.com/derKuba/eleventy-examples).

 Ihr habt Fragen oder Anregungen? Schreibt mir bei [Twitter](https://twitter.com/der_kuba)