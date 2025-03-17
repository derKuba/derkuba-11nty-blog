---
title: "Speakaoke – Spontaneous Presentations with Fastify, SolidJS, and AI"
description: Spontane Vorträge üben
date: 2025-02-23
tags: ["KI", "fullstack"]
layout: layouts/post.njk
lang: "en"
alternate_lang: "de"
alternate_url: "/posts/0225/speakaoke"
---

Have you ever had to give a spontaneous presentation but had no idea about the topic? <!-- endOfPreview -->That’s exactly the idea behind **Speakaoke** – a web app that generates presentations on any topic at the push of a button! You enter a keyword (e.g., _jellyfish_), and within seconds, you get a ready-made presentation with five slides, created using OpenAI. With **Reveal.js**, you can immediately start presenting.

In this mini-tutorial, I'll show you how Speakaoke is built and how you can create a similar project using **Fastify (Backend)** and **SolidJS (Frontend)**.

---

## Architecture

Speakaoke consists of two main components:

1. **Backend (Fastify)** – A Node.js server that queries the OpenAI API and generates the presentation data.
2. **Frontend (SolidJS)** – A web app that provides the search field and renders the presentation using **Reveal.js**.

The process works as follows:

1. The user enters a keyword.
2. The backend sends a request to OpenAI and receives a presentation.
3. The frontend displays the presentation and starts a **Reveal.js** slideshow.

Now let’s dive into the details!

---

## Frontend (SolidJS + Reveal.js)

![Image](/img/0225/speakaoke.png "Präsentationsbeispiel")

![Image](/img/0225/kuba-presentation.png "Präsentationsbeispiel")

The frontend consists of two main pages:

1. **`SearchPage`** – Where the user enters the search term.
2. **`PresentationPage`** – Where the presentation is displayed.

### `SearchPage` – The Search Field

```jsx
import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { applicationStore } from "../store/app-store";

const SearchPage = () => {
    const [keyword, setKeyword] = createSignal("");
    const navigate = useNavigate();

    const fetchPresentation = async () => {
        const response = await fetch("/api/presentation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ keyword: keyword() }),
        });

        const data = await response.json();
        localStorage.setItem("presentation", JSON.stringify(data));
        navigate("/presentation");
    };

    return (
        <div>
            <input
                type="text"
                onInput={(e) => setKeyword(e.target.value)}
                placeholder="Enter topic..."
            />
            <button onClick={fetchPresentation}>Generate</button>
        </div>
    );
};
```

Once the user clicks the button, a request is sent to the backend, and the response is stored in `localStorage`.

### `PresentationPage` – The Slideshow with Theme Options

```jsx
import Reveal from "reveal.js";
import "reveal.js/dist/reveal.css";
import "reveal.js/dist/theme/black.css";
import { onMount, createSignal } from "solid-js";
import { marked } from "marked";

const PresentationPage = () => {
    let deck;
    const [theme, setTheme] = createSignal("black");

    onMount(() => {
        const presentationData = JSON.parse(
            localStorage.getItem("presentation"),
        );
        deck = new Reveal();
        deck.initialize();
    });

    return (
        <div>
            <select onChange={(e) => setTheme(e.target.value)}>
                <option value="black">Black</option>
                <option value="white">White</option>
                <option value="league">League</option>
            </select>
            <div class="reveal">
                <div class="slides">
                    {presentationData.slides.map((slide) => (
                        <section
                            innerHTML={marked(slide)}
                            class={theme()}
                        ></section>
                    ))}
                </div>
            </div>
        </div>
    );
};
```

At first glance, this implementation seems to work fine. However, in SolidJS, there is an issue when switching routes: **The presentation is not correctly reinitialized**.

To ensure that Reveal.js loads correctly, a slightly **hacky solution** is needed:

```jsx
onMount(() => {
    const presentationData = JSON.parse(localStorage.getItem("presentation"));

    setTimeout(() => {
        if (!deck) {
            deck = new Reveal();
            deck.initialize({
                controls: true,
                progress: true,
                hash: true,
            });

            setTimeout(() => deck.sync(), 500);
        }
    }, 100);
});
```

This solution ensures that Reveal.js is initialized with a small delay to avoid timing issues when switching routes.

---

## Backend (Fastify + OpenAI)

The backend is a **Fastify server** that provides a single API route, `/presentation`. This route receives a keyword, sends it to OpenAI, and returns the generated presentation.

### **Fastify Route for Presentations**

```js
const dotenv = require("dotenv");
dotenv.config();
const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

module.exports = async function (fastify) {
    fastify.post("/presentation", async (request, reply) => {
        const { keyword } = request.body;

        const response = await openai.createCompletion({
            model: "gpt-4",
            prompt: `Create a presentation with 5 slides about ${keyword}. Each slide should have a Markdown heading and short bullet points.`,
            max_tokens: 500,
        });

        reply.send({ slides: response.data.choices[0].text.split("\n\n") });
    });
};
```

Here’s where the magic happens! The presentation is generated in Markdown format by OpenAI and sent to the frontend.

---

## Outlook

Speakaoke is already a fun tool, but there are many exciting possibilities for future improvements:

-   **Automatically generated images for slides:** OpenAI or another image AI could be used to generate relevant images for each slide.
-   **Image-only presentations:** Instead of text, entire presentations could be composed solely of AI-generated images—perfect for creative storytelling!
-   **More Reveal.js customizations:** Additional themes, animations, and interaction options could be added.

I’m always grateful for feedback.
Feel free to send it to jacob@derkuba.de.

Best regards,

Yours, Kuba
