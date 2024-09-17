---
title: Bulma and Prism.js Cause CSS Rendering Issues
description: How this blog was created
date: 2021-04-05
tags: ["11ty", "bulma", "prism"]
layout: layouts/post.njk
lang: "en"
alternate_lang: "de"
alternate_url: "/posts/0421/11nty-bullma-error"
---

Anyone using [11ty](https://www.11ty.dev/) with [Bulma](https://bulma.io/) as a CSS framework and adding the [PrismJS](https://prismjs.com/) code highlighter might encounter the following rendering issue:

![bulma css error](/img/0421/bulma-css-error.png "Bulma-Prism-CSS-Error")

After some research, I came across the following article:

[Bulma and PrismJS in Gatsby - CSS Conflicts](https://www.darraghoriordan.com/2019/01/20/bulma-prismjs-in-gatsby-css-conflicts/)

I copied the code block from the article into my CSS, and everything was normalized. Now everything works as expected:

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

Do you have any questions or suggestions? Feel free to reach out to me on [Twitter](https://twitter.com/der_kuba).

Thank you so much for reading!

Kuba
