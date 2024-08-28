---
title: Bulma und Prism.js erzeugen CSS-Fehler in der Darstellung
description: Wie ist dieser Blog entstanden
date: 2021-04-05
tags: ["11nty", "bulma", "prism"]
layout: layouts/post.njk
---

Wer 11nty mit [Bulma](https://bulma.io/) als CSS-Framework nutzt und zusätzlich den Code-Highlighter [PrismJS ](https://prismjs.com/) hinzufügt, bekommt folgenden Darstellungsfehler:

![bulma css error](/content/img/0421/bulma-css-error.png "Bulma-Prism-Css-Error")

Ich habe etwas recherchiert und bin auf folgdenen Artikel gestoßen:

https://www.darraghoriordan.com/2019/01/20/bulma-prismjs-in-gatsby-css-conflicts/

Diesen Codeblog aus oben genanten Artikel in mein CSS kopiert und alles wird normalisieren. Alles funktioniert nun wie es soll:

```css
.token.tag,
.token.content,
.token.number {
    display: inline;
    padding: inherit;
    font-size: inherit;
    line-height: inherit;
    text-align: inherit;
    vertical-align: inherit;
    border-radius: inherit;
    font-weight: inherit;
    white-space: inherit;
    background: inherit;
    margin: inherit;
}
```

Ihr habt Fragen oder Anregungen? Schreibt mir bei [Twitter](https://twitter.com/der_kuba).

\
Tausend Dank fürs Lesen!

Kuba
