---
title: "Speakaoke – Spontane Vorträge mit Fastify, SolidJS und KI"
description: Spontane Vorträge üben
date: 2025-02-23
tags: ["ki", "fullstack"]
layout: layouts/post.njk
lang: "de"
alternate_lang: "en"
alternate_url: "/posts/en/0225/speakaoke"
---

Kennst du das? Du musst spontan einen Vortrag halten, hast aber keine Ahnung über das Thema? <!-- endOfPreview -->Genau das ist die Idee hinter **Speakaoke** – einer Web-App, die auf Knopfdruck Präsentationen zu beliebigen Themen generiert! Du gibst einen Begriff ein (z. B. _Quallen_), und schon bekommst du eine fertige Präsentation mit fünf Folien, erstellt durch OpenAI. Mithilfe von **Reveal.js** kannst du dann direkt loslegen.

In diesem Mini-Tutorial zeige ich dir, wie Speakaoke technisch aufgebaut ist und wie du ein ähnliches Projekt mit **Fastify (Backend)** und **SolidJS (Frontend)** umsetzen kannst.

---

## Architektur

Speakaoke besteht aus zwei Hauptkomponenten:

1. **Backend (Fastify)** – Ein Node.js-Server, der die OpenAI-API anfragt und die Präsentationsdaten generiert.
2. **Frontend (SolidJS)** – Eine Web-App, die das Suchfeld bereitstellt und die Präsentation mit **Reveal.js** rendert.

Der Ablauf sieht so aus:

1. Der Nutzer gibt ein Keyword ein.
2. Das Backend sendet eine Anfrage an OpenAI und bekommt eine Präsentation zurück.
3. Das Frontend zeigt die Präsentation an und startet eine **Reveal.js**-Slideshow.

Jetzt gehen wir ins Detail!

---

## Frontend (SolidJS + Reveal.js)

![Image](/img/0225/speakaoke.png "Präsentationsbeispiel")

![Image](/img/0225/kuba-presentation.png "Präsentationsbeispiel")

Das Frontend besteht aus zwei Hauptseiten:

1. **`SearchPage`** – Hier gibt der Nutzer den Suchbegriff ein.
2. **`PresentationPage`** – Hier wird die Präsentation angezeigt.

### `SearchPage` – Das Suchfeld

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
                placeholder="Thema eingeben..."
            />
            <button onClick={fetchPresentation}>Generieren</button>
        </div>
    );
};
```

Sobald der Nutzer auf den Button klickt, wird eine Anfrage an das Backend gesendet, und die Antwort im `localStorage` gespeichert.

### `PresentationPage` – Die Slideshow mit Theme-Optionen

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

Die oben gezeigte Implementierung funktioniert auf den ersten Blick gut. Allerdings gibt es in SolidJS ein Problem beim Wechsel der Route: **Die Präsentation wird nicht korrekt neu initialisiert**.

Daher braucht es eine etwas **hacky Lösung**, um sicherzustellen, dass Reveal.js richtig geladen wird:

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

Diese Lösung stellt sicher, dass Reveal.js mit einer kleinen Verzögerung initialisiert wird, um Timing-Probleme beim Wechsel der Route zu umgehen.

---

## Backend (Fastify + OpenAI)

Das Backend ist ein **Fastify-Server**, der eine einzige API-Route `/presentation` bereitstellt. Hier wird das Keyword entgegengenommen, an OpenAI weitergegeben und die generierte Präsentation zurückgesendet.

### **Fastify-Route für Präsentationen**

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
            prompt: `Erstelle eine Präsentation mit 5 Folien über ${keyword}. Jede Folie sollte eine Markdown-Überschrift und kurze Bulletpoints haben.`,
            max_tokens: 500,
        });

        reply.send({ slides: response.data.choices[0].text.split("\n\n") });
    });
};
```

Hier passiert die Magie! Die Präsentation wird von OpenAI im Markdown-Format generiert und an das Frontend zurückgeschickt.

---

## Ausblick

Speakaoke ist bereits ein spaßiges Tool, aber es gibt noch viele spannende Erweiterungsmöglichkeiten:

-   **Automatische Bilder für die Folien:** In Zukunft könnte OpenAI oder eine andere Bild-KI genutzt werden, um passende Bilder zu jeder Folie zu generieren.
-   **Reine Bild-Vorträge:** Statt Text könnten ganze Präsentationen nur aus automatisch generierten Bildern bestehen – perfekt für kreatives Storytelling!
-   **Mehr Reveal.js-Anpassungen:** Weitere Themes, Animationen und Interaktionsmöglichkeiten könnten hinzugefügt werden.

Für Feedback bin ich immer dankbar.
Gerne an jacob@derkuba.de

Viele Grüße

Euer Kuba
