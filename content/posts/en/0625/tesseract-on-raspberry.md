---
title: "OCR Performance Optimization: From 56s to 4s on Raspberry Pi"
description: A little hardware journey
date: 2025-06-08
tags: ["ocr", "raspberrypi"]
layout: layouts/post.njk
lang: "en"
alternate_lang: "de"
alternate_url: "/posts/0625/tesseract-on-raspberry"
---

## The Problem

For a project, we needed an OCR solution that could automatically read PDF invoices. Our first implementation with **Tesseract.js** on a Raspberry Pi 4 (4GB) was functional but painfully slow: **56 seconds** per document.<!-- endOfPreview -->I

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

This was completely unacceptable for a production system. Time for optimizations!

## The Path to the Solution

### Approach 1: Native Tesseract instead of Tesseract.js

The first logical step was switching from the JavaScript implementation to the native C++ version of Tesseract. We compiled Tesseract 5.3.0 directly on the Pi from source code with ARM optimizations:

```bash
wget https://github.com/tesseract-ocr/tesseract/archive/refs/tags/5.3.0.tar.gz
tar -xzf 5.3.0.tar.gz
cd tesseract-5.3.0

./autogen.sh
./configure --enable-static --disable-shared CXXFLAGS="-O3 -march=armv7-a"
make -j4
sudo make install
```

Our new implementation calls Tesseract via `spawn()`:

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

**Result:** 20 seconds - a significant improvement of almost 3x, but still too slow.

### Approach 2: System Optimizations

Next, we tried various system-level optimizations:

```bash
# CPU Governor to performance
echo performance | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor

# Reduce GPU memory for more RAM
echo "gpu_mem=16" | sudo tee -a /boot/config.txt

# RAM disk for temp files
echo "tmpfs /tmp/ocr tmpfs defaults,size=256M 0 0" | sudo tee -a /etc/fstab
sudo mount -a

# Optimize Node.js memory
node --max-old-space-size=512 --optimize-for-size server.js
```

**Result:** Unfortunately, these optimizations brought **exactly nothing** - still 20+ seconds.

### Approach 3: Performance Profiling

To find out where the time was really being spent, we built in detailed profiling:

```javascript
export async function extractTextWithProfiling(imageBuffer, lang = "deu") {
    const startTime = Date.now();
    const profile = {};

    // 1. Analyze image info
    const imageInfo = await sharp(imageBuffer).metadata();
    console.log(
        `Original: ${imageInfo.width}x${imageInfo.height}, ${Math.round(imageBuffer.length / 1024)}KB`,
    );

    // 2. Measure preprocessing time
    const preprocessStart = Date.now();
    const processedBuffer = await preprocessImage(imageBuffer);
    profile.preprocessingTime = Date.now() - preprocessStart;

    // 3. Measure Tesseract time
    const tesseractStart = Date.now();
    // ... Execute Tesseract
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

## The Breakthrough

The profiling revealed the real problem: We were processing huge images (3472x4624 pixels, 4+ MB) without appropriate size reduction.

### The Final Solution

The game-changer was **aggressive resizing** combined with optimized Tesseract parameters:

```javascript
export async function preprocessImage(imageBuffer) {
    return await sharp(imageBuffer)
        .resize({ width: 800, fit: "inside", withoutEnlargement: true }) // ⭐ GAME CHANGER
        .grayscale()
        .normalize()
        .png({ compressionLevel: 0 }) // No compression for speed
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
        "debug_file=/dev/null", // No debug output
    ];

    // ... Rest of implementation
}
```

### Performance Profiling Results

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

For production use, we also optimized the PM2 configuration:

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

**Important Note:** Make sure all environment paths exist. `TESSDATA_PREFIX` can usually be omitted since Tesseract knows its default paths.

## Conclusion

The optimization was a complete success:

-   **Tesseract.js:** 56 seconds
-   **Native Tesseract:** 20 seconds
-   **Optimized Native:** **4 seconds**

**Total improvement: 14x faster!** 🚀

### Key Learnings

1. **Image size is crucial:** Resizing from 3472px to 800px width was the most important factor
2. **Native > JavaScript:** 3x speedup through native Tesseract
3. **System optimizations help little:** CPU governor, RAM disk etc. brought practically nothing
4. **Profiling is indispensable:** Without measurement, we would have continued optimizing in the wrong places
5. **Environment setup:** PM2 needs explicit path configuration

### Next Steps

With frontend cropping (user selects relevant text area), we expect further improvements to under 2 seconds.

---

Claude was allowed to insert a modest sentence at the end :-)
(no, I don't get paid for this):

_This article was created in collaboration with Claude (Anthropic), who helped with optimization and problem-solving. Without the systematic approach and performance profiling, we would probably have remained stuck at the 20-second mark for a long time._

I'm always grateful for feedback.
Feel free to reach out at jacob@derkuba.de

Best regards,

Your Kuba

PS: This article was linguistically polished with the help of AI.
