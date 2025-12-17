---
title: "OCR Performance Optimierung: Von 56s auf 4s auf dem Raspberry Pi"
description: Eine kleine Hardwarereise
date: 2025-06-08
tags: ["ocr", "raspberrypi"]
layout: layouts/post.njk
lang: "de"
alternate_lang: "en"
alternate_url: "/posts/en/0625/tesseract-on-raspberry"
---

## Das Problem

Für ein Projekt brauchten wir eine OCR-Lösung, die PDF-Rechnungen automatisch auslesen kann. Unsere erste Implementierung mit **Tesseract.js** auf einem Raspberry Pi 4 (4GB) war funktional, aber schmerzhaft langsam: **56 Sekunden** pro Dokument. <!-- endOfPreview -->I

```javascript
import Tesseract from "tesseract.js";
import sharp from "sharp";

export async function extractText(
    imageBuffer,
    lang = "deu",
    logger = () => {},
) {
    const processedBuffer = await sharp(imageBuffer)
        .grayscale()
        .normalize()
        .toBuffer();

    const {
        data: { text },
    } = await Tesseract.recognize(processedBuffer, lang, { logger });
    return text;
}
```

Das war für ein produktives System völlig inakzeptabel. Zeit für Optimierungen!

## Der Weg zur Lösung

### Ansatz 1: Native Tesseract statt Tesseract.js

Der erste logische Schritt war der Wechsel von der JavaScript-Implementierung zur nativen C++-Version von Tesseract. Wir kompilierten Tesseract 5.3.0 direkt auf dem Pi aus dem Source Code mit ARM-Optimierungen:

```bash
wget https://github.com/tesseract-ocr/tesseract/archive/refs/tags/5.3.0.tar.gz
tar -xzf 5.3.0.tar.gz
cd tesseract-5.3.0

./autogen.sh
./configure --enable-static --disable-shared CXXFLAGS="-O3 -march=armv7-a"
make -j4
sudo make install
```

Unsere neue Implementierung ruft Tesseract über `spawn()` auf:

```javascript
import { spawn } from "child_process";
import { promises as fs } from "fs";

export async function extractText(
    imageBuffer,
    lang = "deu",
    logger = () => {},
) {
    const tempDir = "/tmp/ocr";
    const tempId = Date.now().toString(36);
    const inputPath = `${tempDir}/ocr_${tempId}.png`;
    const outputPath = `${tempDir}/ocr_${tempId}`;

    try {
        const processedBuffer = await preprocessImage(imageBuffer);
        await fs.writeFile(inputPath, processedBuffer);

        const args = [
            inputPath,
            outputPath,
            "-l",
            lang,
            "--oem",
            "1", // LSTM OCR Engine
            "--psm",
            "6", // Uniform block of text
        ];

        const text = await new Promise((resolve, reject) => {
            const tesseract = spawn("tesseract", args);

            tesseract.on("close", async (code) => {
                if (code !== 0) {
                    reject(new Error(`Tesseract failed with code ${code}`));
                    return;
                }

                const content = await fs.readFile(`${outputPath}.txt`, "utf8");
                resolve(content.trim());
            });

            tesseract.on("error", reject);
        });

        return text;
    } finally {
        // Cleanup temp files
        await cleanup([inputPath, `${outputPath}.txt`]);
    }
}
```

**Ergebnis:** 20 Sekunden - eine deutliche Verbesserung um fast 3x, aber immer noch zu langsam.

### Ansatz 2: System-Optimierungen

Als nächstes versuchten wir verschiedene System-Level Optimierungen:

```bash
# CPU Governor auf Performance
echo performance | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor

# GPU Memory reduzieren für mehr RAM
echo "gpu_mem=16" | sudo tee -a /boot/config.txt

# RAM-Disk für temp files
echo "tmpfs /tmp/ocr tmpfs defaults,size=256M 0 0" | sudo tee -a /etc/fstab
sudo mount -a

# Node.js Memory optimieren
node --max-old-space-size=512 --optimize-for-size server.js
```

**Ergebnis:** Leider brachten diese Optimierungen **exakt nichts** - immer noch 20+ Sekunden.

### Ansatz 3: Performance Profiling

Um herauszufinden, wo die Zeit wirklich draufgeht, bauten wir ein detailliertes Profiling ein:

```javascript
export async function extractTextWithProfiling(imageBuffer, lang = "deu") {
    const startTime = Date.now();
    const profile = {};

    // 1. Bildinfo analysieren
    const imageInfo = await sharp(imageBuffer).metadata();
    console.log(
        `Original: ${imageInfo.width}x${imageInfo.height}, ${Math.round(imageBuffer.length / 1024)}KB`,
    );

    // 2. Preprocessing Zeit messen
    const preprocessStart = Date.now();
    const processedBuffer = await preprocessImage(imageBuffer);
    profile.preprocessingTime = Date.now() - preprocessStart;

    // 3. Tesseract Zeit messen
    const tesseractStart = Date.now();
    // ... Tesseract ausführen
    profile.tesseractTime = Date.now() - tesseractStart;

    profile.totalTime = Date.now() - startTime;

    console.log(
        `Preprocessing: ${profile.preprocessingTime}ms (${Math.round((profile.preprocessingTime / profile.totalTime) * 100)}%)`,
    );
    console.log(
        `Tesseract: ${profile.tesseractTime}ms (${Math.round((profile.tesseractTime / profile.totalTime) * 100)}%)`,
    );
    console.log(`TOTAL: ${profile.totalTime}ms`);
}
```

## Der Durchbruch

Das Profiling enthüllte das eigentliche Problem: Wir verarbeiteten riesige Bilder (3472x4624 Pixel, 4+ MB) ohne angemessene Größenreduzierung.

### Die finale Lösung

Der Game-Changer war **aggressives Resizing** kombiniert mit optimierten Tesseract-Parametern:

```javascript
export async function preprocessImage(imageBuffer) {
    return await sharp(imageBuffer)
        .resize({ width: 800, fit: "inside", withoutEnlargement: true }) // ⭐ GAME CHANGER
        .grayscale()
        .normalize()
        .png({ compressionLevel: 0 }) // Keine Komprimierung für Speed
        .toBuffer();
}

export async function extractTextFast(
    imageBuffer,
    lang = "deu",
    logger = () => {},
) {
    const args = [
        inputPath,
        outputPath,
        "-l",
        lang,
        "--oem",
        "1",
        "--psm",
        "6",
        "-c",
        "debug_file=/dev/null", // Keine Debug-Ausgaben
    ];

    // ... Rest der Implementierung
}
```

### Performance-Profiling Ergebnisse

```
📈 PERFORMANCE PROFILE:
========================
📊 Original Image: 3472x4624 (4220KB)
⚡ Preprocessing: 457ms (12%)
💾 File Write: 6ms (0%)
🔤 Tesseract: 3188ms (87%)
📖 File Read: 2ms (0%)
🧹 Cleanup: 1ms (0%)
⏱️  TOTAL: 3661ms (4s)
```

## PM2 Configuration

Für den produktiven Einsatz optimierten wir auch die PM2-Konfiguration:

```javascript
// ecosystem.config.cjs
module.exports = {
    apps: [
        {
            name: "invoice-manager",
            script: "./app.js",

            env: {
                NODE_ENV: "production",
                PORT: 3001,
                OCR_CACHE_DIR: "/tmp/ocr",
                UV_THREADPOOL_SIZE: "2",
                OMP_THREAD_LIMIT: "2",
            },

            node_args: "--max-old-space-size=512 --optimize-for-size",
            max_memory_restart: "700M",
            kill_timeout: 15000,

            log_file: "./logs/app.log",
            cron_restart: "0 3 * * *", // Nightly restart
        },
    ],
};
```

**Wichtiger Hinweis:** Achtet darauf, dass alle Environment-Pfade existieren. `TESSDATA_PREFIX` kann meist weggelassen werden, da Tesseract seine Standard-Pfade kennt.

## Fazit

Die Optimierung war ein voller Erfolg:

-   **Tesseract.js:** 56 Sekunden
-   **Native Tesseract:** 20 Sekunden
-   **Optimized Native:** **4 Sekunden**

**Gesamtverbesserung: 14x schneller!** 🚀

### Key Learnings

1. **Bildgröße ist entscheidend:** Das Resize von 3472px auf 800px Breite war der wichtigste Faktor
2. **Native > JavaScript:** 3x Speedup durch nativen Tesseract
3. **System-Optimierungen helfen wenig:** CPU Governor, RAM-Disk etc. brachten praktisch nichts
4. **Profiling ist unverzichtbar:** Ohne Messung hätten wir weiter an den falschen Stellen optimiert
5. **Environment-Setup:** PM2 braucht explizite Pfad-Konfiguration

### Nächste Schritte

Mit Frontend-Cropping (Benutzer wählt relevanten Textbereich aus) erwarten wir weitere Verbesserungen auf unter 2 Sekunden.

---

Claude durfte einen bescheidenen Satz am Ende einfügen :-)
(nein ich kriege dafür kein Geld):

_Dieser Artikel entstand in Zusammenarbeit mit Claude (Anthropic), der bei der Optimierung und Problemlösung geholfen hat. Ohne die systematische Herangehensweise und das Performance-Profiling wären wir wahrscheinlich lange bei der 20-Sekunden-Marke hängengeblieben._

Für Feedback bin ich immer dankbar.
Gerne an jacob@derkuba.de

Viele Grüße

Euer Kuba

PS: Dieser Artikel wurde mit Hilfe KI sprachlich aufgehübscht.
