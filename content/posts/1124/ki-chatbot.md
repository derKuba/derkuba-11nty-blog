---
title: "Ich mach was mit KI ;-) - der Chatbot"
description: Kleines Hackingprojekt
date: 2024-11-27
tags: ["ki", "chatbot", "node"]
layout: layouts/post.njk
---

In letzter Zeit werde ich ständig gefragt: "Ihr macht doch was mit KI, oder? Könnt ihr nicht mal einen Chatbot bauen?" Die Idee klingt simpel<!-- endOfPreview -->, aber wie so oft steckt der Teufel im Detail. Ein Chatbot, der tatsächlich nützliche Antworten liefert, erfordert weit mehr als nur eine schnelle Integration mit einer KI-API. Es braucht eine durchdachte Datenbasis, eine skalierbare Architektur und eine performante Anbindung.

In diesem Artikel nehme ich euch mit auf die Reise, wie ich einen modularen Chatbot entwickelt habe. Von der Datenaufbereitung, über die Speicherung in einer Chroma-Datenbank, bis hin zur Implementierung einer Fastify-API mit GPT-4 zeigen ich die Herausforderungen und Learnings aus der Praxis. Das Ziel: Einen Bot, der nicht nur Fragen beantwortet, sondern dies auch schnell und präzise tut.

---

## Das Ziel

Das Ziel war es, einen Chatbot zu entwickeln, der aus einer vorhandenen Wissensbasis – in meinem Fall aus einer Vielzahl von Dokumenten – Fragen beantwortet. Die Hauptbestandteile dieses Projekts:

1. **Datenparsing**: Daten aus JSON- oder Textquellen extrahieren und aufbereiten.
2. **Chroma-DB aufsetzen und bespielen**: Die aufbereiteten Daten als Vektoren in Chroma speichern.
3. **Fastify API mit GPT-4**: Eine REST-API, die GPT-4 anbindet, um semantisch passende Antworten zu generieren.

![Image](/img/1124/chatbot.png "chatbot architektur")

---

## Phase 1: Datenparsing

Der erste Schritt war das Extrahieren und Aufbereiten der Daten. Die Daten kamen aus JSON-Dateien und enthielten Texte sowie Metadaten. Der Fokus lag darauf, die Daten so vorzubereiten, dass sie später in kleine, zusammenhängende Blöcke aufgeteilt werden können.

Hier ein Ausschnitt der Funktion, die Texte aufteilt und Metadaten speichert:

```typescript
export function splitText(
    text: string,
    maxLength: number,
    overlap: number,
): string[] {
    const chunks = [];
    for (let i = 0; i < text.length; i += maxLength - overlap) {
        chunks.push(text.slice(i, i + maxLength));
    }
    return chunks;
}

export async function processData(sourcePath: string, outputPath: string) {
    const files = fs.readdirSync(sourcePath);
    for (const file of files) {
        const content = fs.readFileSync(path.join(sourcePath, file), "utf-8");
        const chunks = splitText(content, 1000, 200);
        fs.writeFileSync(
            path.join(outputPath, `${file}.json`),
            JSON.stringify(chunks),
        );
    }
}
```

---

## Phase 2: Chroma-DB aufsetzen und bespielen

Mit den verarbeiteten Daten war der nächste Schritt das Bespielen einer Chroma-Datenbank. Dies wird als eigenständiger Job ausgeführt, der regelmäßig über einen Cronjob läuft. So bleiben die Daten stets aktuell, ohne dass die API gestört wird.

Hier ein Ausschnitt der Funktion, die die Daten in Chroma speichert:

```typescript
export async function storeEmbeddings(dataDir: string, collectionName: string) {
    const client = new ChromaClient({ path: "http://localhost:8000" });
    const collection = await client.createCollection({ name: collectionName });
    const embeddingModel = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const files = fs.readdirSync(dataDir);
    for (const file of files) {
        const chunks = JSON.parse(
            fs.readFileSync(path.join(dataDir, file), "utf-8"),
        );
        const embeddings = await embeddingModel.embedMany(chunks);
        await collection.add({
            ids: chunks.map((_, i) => `${file}_${i}`),
            embeddings,
            documents: chunks,
            metadatas: chunks.map((_, i) => ({ source: file })),
        });
    }
}
```

---

## Phase 3: Fastify-API mit GPT-4

Die Fastify-API verbindet Chroma mit GPT-4, um Antworten aus den gespeicherten Daten zu generieren. Ein wichtiges Learning war, dass nicht jedes GPT-4-Modell gleichermaßen geeignet ist. Einige Modelle sind deutlich schneller darin, Daten entgegenzunehmen und auf deren Grundlage eine Antwort zu formulieren. Durch das Experimentieren mit verschiedenen Modellen konnte ich die Antwortzeit der API von 8 Sekunden auf 2-3 Sekunden reduzieren.

Hier ist der zentrale Teil der API:

```typescript
fastify.post("/query", async (request, reply) => {
    const { query } = request.body;
    const client = new ChromaClient({ path: "http://localhost:8000" });
    const collection = await client.getCollection({ name: "documents" });

    const embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
    });
    const queryEmbedding = await embeddings.embedQuery(query);
    const results = await collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: 3,
    });

    const context = results.documents.join("\n\n");
    const llm = new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: "gpt-4-turbo",
    });
    const response = await llm.invoke([
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: `Answer based on this context: ${context}` },
    ]);

    reply.send({ answer: response.text });
});
```

### **Beispiel: API in Aktion**

Die Fastify-API ermöglicht es, Fragen an den Chatbot zu stellen. Der Bot durchsucht die hinterlegte Datenbasis nach relevanten Informationen und liefert eine Antwort zusammen mit Metadaten (wie Links zu den Quellen).

#### **Anfrage:**

```bash
POST /chatbot
Content-Type: application/json

{
  "phrase": "Wo finde ich Lorem Ipsum"
}
```

---

#### **Antwort:**

```json
{
    "answer": "Du findest das unter Lorem Ipsum.",
    "meta": [
        {
            "title": "Seite 1",
            "url": "https://example.com/lorem-ipsum"
        },
        {
            "title": "Dokumentation zu Ipsum",
            "url": "https://docs.example.com/ipsum"
        }
    ]
}
```

---

## Lessons Learned

-   **Experimentieren mit Modellen:** Unterschiedliche GPT-Modelle haben verschiedene Stärken. Modelle wie `gpt-4-turbo` erwiesen sich als schneller und effizienter für diese Art von Anwendung, ohne nennenswerte Qualitätseinbußen.
-   **Separate Datenjobs:** Das Sammeln und Bespielen der Daten läuft in einem separaten Job, der wöchentlich über Cron ausgeführt wird. Dadurch bleibt die API schlank und performant.
-   **Chroma-DB als zuverlässige Basis:** Die Kombination aus Chroma und OpenAI liefert semantisch präzise Antworten, wenn die Daten gut vorbereitet sind.

---

## Fazit

Am Ende entstand ein modularer Chatbot, der eine semantische Suche über Dokumente bietet und GPT-4 für präzise Antworten nutzt. Der iterative Ansatz und das Feintuning – etwa beim Datenhandling oder den verwendeten Modellen – waren entscheidend, um die Geschwindigkeit und Genauigkeit zu optimieren.

---

Falls du den Chatbot selbst ausprobieren möchtest, kannst du dir das fertige Produkt bald unter dieser URL anschauen [Scopevisio Onlinehilfe](https://help.scopevisio.com/).
Code gibts diesmal leider nicht. Aber ich stehe für alle Fragen bereit.

Viel Spaß beim Basteln! 😊

Für Feedback bin ich immer dankbar.
Gerne an jacob@derkuba.de

Viele Grüße

Euer Kuba

<br/>

**Ausnahmsweise heute mal etwas POST SCRIPTUM:**

### **PS: API Keys in `.env`**

Es ist entscheidend, API-Schlüssel niemals direkt im Code zu hinterlegen. Stattdessen sollten sie in einer `.env`-Datei gespeichert werden, die lokal geladen wird und nicht ins Versionskontrollsystem (wie GitHub) eingecheckt wird. Beispiel:

```
OPENAI_API_KEY=your-secret-api-key
CHROMA_DB_PATH=http://localhost:8000
```

Vergiss nicht, die `.env`-Datei in die `.gitignore` aufzunehmen, um sie vor versehentlichem Pushen zu schützen. API-Schlüssel in öffentlichen Repositories können teuer werden – sei es durch Missbrauch oder unautorisierte Nutzung. Sollte sowas mal passieren, sofort den Key invalidieren und einen neuen Schlüssel generieren. Historie löschen alleine reicht nicht.

---

### **PPS: Visual Studio Code REST Client**

Ein weiteres hilfreiches Tool für API-Arbeiten ist der [REST Client von Huachao Mao](https://marketplace.visualstudio.com/items?itemName=humao.rest-client). Dieser VS Code-Extension ermöglicht es, HTTP-Requests direkt im Editor zu speichern und auszuführen. Du kannst beispielsweise folgende `.http`-Datei anlegen:

```http
POST http://localhost:3000/chatbot
Content-Type: application/json

{
  "phrase": "Wo finde ich Lorem Ipsum"
}
```

Die Vorteile liegen auf der Hand:

-   Schneller Zugriff: Du kannst API-Aufrufe direkt neben deinem Code dokumentieren und ausführen.
-   Flexibilität: Alle wichtigen Requests bleiben Teil des Projekts, ohne dass externe Tools erforderlich sind.
-   Sicherheit: Schlüssel und sensible Daten können in Variablen ausgelagert werden, sodass sie nicht im Code erscheinen.

**Durchsage ENDE**
