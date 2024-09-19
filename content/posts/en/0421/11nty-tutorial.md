---
title: 11nty Blog mit eigenem Html-Template
description: Wie ist dieser Blog entstanden
date: 2021-03-30
tags: ["11nty", "bulma", "blog", "tutorial"]
layout: layouts/post.njk
lang: "en"
alternate_lang: "de"
alternate_url: "/posts/0421/11nty-tutorial"
---

For a long time, I had the idea of setting up a blog. I decided to use the implementation of this project as my first blog post. <!-- endOfPreview --> I had the following requirements:

-   No database
-   No complicated, runtime-dependent programming languages
-   The output should be a static page

A Google search for "static site generator 2021" led me to the following page:

[Best Static Site Generators - TechRadar](https://www.techradar.com/best/static-site-generators)

At the top of the list was Hugo – a very fast generator based on Go. I had already tried Hugo. It is extremely fast and simple, as long as you use a pre-built template. However, if you want to create your own template, it becomes (at least in version 0.40 of Hugo) quite fiddly. I thought there must be an easier way.

Since I have a fondness for JavaScript, 11ty sounded very promising to me. It was supposed to be fast, simple, and work without frameworks like React or Angular. And lo and behold: it worked wonderfully.

**Tech Stack:**

-   [git](https://git-scm.com/)
-   [nodejs @v14.16.0](https://nodejs.org/)
-   [npm @6.14.11](https://www.npmjs.com/)
-   [11ty @0.12.1](https://www.11ty.dev/)
-   [Bulma @0.9.2](https://bulma.io/)
-   [Prism @1.23.0](https://prismjs.com/)

Here are the steps I followed to set up this blog:

1. **Create an HTML Template**

    - Basic HTML structure with:
        - Menu
        - Navigation
        - Blog details
        - Footer

2. **Download 11ty Starter Blog** from: [Eleventy Base Blog GitHub](https://github.com/11ty/eleventy-base-blog)

    - Clone the starter template and install dependencies
    - Understand the structure and adapt it
    - Integrate your own template

3. **Transfer the HTML Template** to the starter template

### Let's Get Started

#### Prerequisites

-   Node.js and npm are installed

#### 1. Create a Template

A classic HTML layout is quickly set up. To save time, I used the CSS framework [Bulma](https://bulma.io/) and divided the template into the following parts:

-   [Navigation](https://bulma.io/documentation/components/navbar/)
-   Content
-   Sidebar
-   [Footer](https://bulma.io/documentation/layout/footer/)

![HTML Layout](/img/layout.png "HTML Template")

<div class="has-text-right image-subline">Image 1: Layout Structure</div>

Of course, other layouts and CSS frameworks are also suitable. I just wanted to try something other than Bootstrap.

#### 2. Install 11ty Starter

At the link above, you can find the standard 11ty starter package. When you click the "Clone" button, you will get the Git URL.

```bash
# for SSH
git clone git@github.com:11ty/eleventy-base-blog.git my-new-blog

# or HTTPS
git clone https://github.com/11ty/eleventy-base-blog.git my-new-blog
```

Now, navigate to the folder and install the dependencies:

```bash
cd my-new-blog
npm install
```

**Start 11ty Starter Blog**

```bash
npm run server
# or
npx eleventy --serve
```

And you should see the following:

![11ty Starter](/img/0421/11nty-starter.png "11ty Starter")

<div class="has-text-right image-subline">Image 2: Starter Template Overview</div>

At first glance, you can see the dynamic elements that we need in our own template:

-   Navigation: Menu items
-   Content: Posts
-   Sidebar: Tags

![11ty Starter Elements](/img/0421/starter-elements.png "11ty Starter Elements")

**Structure and File Organization**
For better clarity, I organized some files into folders. CSS and JS were moved to the "Template" directory, content-specific files to the "Content" folder, and CI-specific files were deleted.

![Directory Structure](/img/0421/file-structure.png "Directory Structure")

<div class="has-text-right image-subline">Image 3: Directory Structure</div>

The files are divided into:

-   **".njk"** (Template),
-   **".md"** (Content/Posts),
-   **".json"** (Meta and Config),
-   **".eleventy.js"** (11ty Configuration).

**Using Custom Template**

Navigation:

-   Create a new file under "\_includes/layouts/navigation.njk".
-   Copy the content of your navigation into this file.
-   In the file "\_includes/layouts/base.njk", you will find the page layout with the HTML structure. Lines 13–23 contain what we need. We extract `metadata.title` as the title for our blog and place the for-loop (lines 18–24) into our nav-container.

Before:
![Navigation](/img/0421/starter-header.png "Navigation")<div class="has-text-right image-subline">Image 4: Starter Header Code</div> (Unfortunately, 11ty does not render nunjuk-code here, so I have to use an image. If anyone knows a workaround, feel free to share!)

After:
![Header](/img/0421/bulma-header.png "Header")

<div class="has-text-right image-subline">Image 5: Bulma Header</div>

We move the for-loop into the container for navigation items.
Next,

-   we delete the content shown in the "Before" image from the "base.njk" file and replace it with `<div class="clear-image">![Include Header](/img/0421/include-header.png "Include Header")</div>`. The file should now look like this:

![Base File](/img/0421/base.png "Base File")

<div class="has-text-right image-subline">Image 6: Starter Template Base</div>

In addition to custom CSS files and the Bulma Burger Menu JavaScript, you can see the navigation and footer.

**Content:**

The content area varies depending on the page. On the main page, I want the sidebar to be visible, but not on the post detail pages. Therefore, the files **/\_includes/layouts/home.njk** and **postlist.njk** are relevant for the main page, while **post.njk** is used for the detail page.

The starter template code has been connected to the custom template for the content area:

![Content Area](/img/0421/content-area.png "Content Area")

<div class="has-text-right image-subline">Image 7: Content Area</div>

Alongside the copied standard code, in line 19, you can see a section where I map Bulma tag classes to tags based on the index to add some color to the content area. For this, I added a shortcode in the **.eleventy.js** file:

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

The starter template code was also connected to the custom template for the detail area:

![Post Detail](/img/0421/post-detail.png "Post Detail Page")

<div class="has-text-right image-subline">Image 8: Post Detail Page</div>

For the list of posts, the starter template code was connected to the custom template:

![Post List](/img/0421/postlist.png "Post List")

<div class="has-text-right image-subline">Image 9: Post List</div>

I also use a custom filter called "readingTime", which I took from the starter template [Eleventy Chirpy Blog](https://github.com/muenzpraeger/eleventy-chirpy-blog-template/blob/main/.eleventy.js) to display the estimated reading time.

To avoid manually typing the code, I have uploaded the relevant files on [GitHub/derKuba](https://github.com/derKuba/eleventy-examples).
