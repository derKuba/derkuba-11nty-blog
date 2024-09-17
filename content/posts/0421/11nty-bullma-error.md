---
title: Bulma und Prism.js erzeugen CSS-Fehler in der Darstellung
description: Wie ist dieser Blog entstanden
date: 2021-04-05
tags: ["11nty", "bulma", "prism"]
layout: layouts/post.njk
lang: "de"
alternate_lang: "en"
alternate_url: "/posts/en/0421/11nty-bullma-error"
---

Wer [11nty](https://www.11ty.dev/) mit [Bulma](https://bulma.io/) als CSS-Framework nutzt und zusätzlich den Code-Highlighter [PrismJS](https://prismjs.com/) hinzufügt, könnte auf folgenden Darstellungsfehler stoßen:

![bulma css error](/img/0421/bulma-css-error.png "Bulma-Prism-CSS-Error")

Ich habe etwas recherchiert und bin auf den folgenden Artikel gestoßen:

[Bulma and PrismJS in Gatsby - CSS Conflicts](https://www.darraghoriordan.com/2019/01/20/bulma-prismjs-in-gatsby-css-conflicts/)

Den Codeblock aus dem oben genannten Artikel habe ich in mein CSS kopiert, und alles wurde normalisiert. Jetzt funktioniert alles wie es soll:

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
