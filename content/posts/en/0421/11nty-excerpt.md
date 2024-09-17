---
title: "Displaying Post Excerpts in 11ty"
description: How to display the first sentence of a post in the post list
date: 2021-04-04
tags: ["11ty", "excerpt"]
layout: layouts/post.njk
lang: "en"
alternate_lang: "de"
alternate_url: "/posts/0421/11nty-excerpt"
---

If you want to display content in the list of all posts, 11ty only allows you to show the entire post content by default. However, if you want to display just the first sentence of a post, you’ll need to teach Eleventy’s JavaScript how to do that. <!-- endOfPreview -->

The [11ty Starter Blog](https://github.com/11ty/eleventy-base-blog) will be used as the foundation.

When you start this, you get the following view. It shows the post list with the title, date, and tags but without a content excerpt.
![11ty starter](/img/0421/excerpt-place.png "11ty starter")

<div class="has-text-right image-subline">Image 1: Post list in the Starter Template</div>

The red text indicates where the content should be inserted.
To implement this, I referred to the following sources:

[Muenzpraeger's Eleventy Chirpy Blog Template](https://github.com/muenzpraeger/eleventy-chirpy-blog-template) and [Creating a Blog with Eleventy](https://keepinguptodate.com/pages/2019/06/creating-blog-with-eleventy/).

The **.eleventy.js** file needs the following function:

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

First, it checks if the post object has the "templateContent" field, which Eleventy should provide. Then, the content is cached in the `content` variable. The content is sliced from the beginning up to the snippet **"<!-- endOfPreview -->"**. Of course, you can use any tag, but make sure it’s something unique that stands out from the content. This marker indicates where the excerpt, or preview, should end. If no marker is found, an empty string is returned.

Next, you need to teach Eleventy how to use this function. You could do this via a filter, but I find a "shortcut" more practical. A shortcut looks like this:

```javascript
// remove whitespace between {} and %
{ % excerpt pageObject % }
```

<em>Please remove the spaces between the parentheses and the percentage signs. Unfortunately, 11ty renders the snippet with spaces!</em>

```javascript
eleventyConfig.addShortcode("excerpt", (post) => extractExcerpt(post));
```

The Eleventy config object now has a new keyword "excerpt" (for the post excerpt), and as shown in the previous code snippet, it passes the post object as a parameter.

Now, if you include this shortcut in the _/\_includes/postlist.njk_ file within the list tags (< li > </ li >), you will see the desired post excerpt:

```javascript
{ % excerpt post % }
```

This marker can now be used in the Markdown files of the blog posts (**/posts/\*.md**). Simply insert **<!-- endOfPreview -->** at the desired length of the excerpt.

```html
Leverage agile frameworks to provide a robust
<!-- endOfPreview -->
synopsis for high-level overviews. Iterative
```

![11ty starter](/img/0421/excerpt-final.png "11ty starter")
![11ty starter](/img/0421/excerpt-place.png "11ty starter")

<div class="has-text-right image-subline">Image 2: Post list with content preview</div>

You can find the code examples on [Github/derKuba](https://github.com/derKuba/eleventy-examples).

Do you have any questions or suggestions? Feel free to reach out to me on [Twitter](https://twitter.com/der_kuba).
