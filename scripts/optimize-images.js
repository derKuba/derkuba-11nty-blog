import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { glob } from "glob";

const CONTENT_IMG_DIR = "./content/img";
const SUPPORTED_FORMATS = ["png", "jpg", "jpeg"];

// Compression settings
const WEBP_QUALITY = 85;
const PNG_QUALITY = 90;
const JPEG_QUALITY = 85;

let stats = {
    processed: 0,
    skipped: 0,
    errors: 0,
    originalSize: 0,
    optimizedSize: 0,
};

async function optimizeImage(imagePath) {
    try {
        const ext = path.extname(imagePath).toLowerCase().slice(1);
        const dir = path.dirname(imagePath);
        const basename = path.basename(imagePath, path.extname(imagePath));

        // Skip if already optimized (has -opt suffix)
        if (basename.endsWith("-opt")) {
            stats.skipped++;
            return;
        }

        // Get original file size
        const originalStats = await fs.stat(imagePath);
        stats.originalSize += originalStats.size;

        // Load image
        const image = sharp(imagePath);
        const metadata = await image.metadata();

        console.log(
            `Processing: ${path.relative(".", imagePath)} (${(originalStats.size / 1024).toFixed(1)}KB)`
        );

        // Generate WebP version
        const webpPath = path.join(dir, `${basename}.webp`);
        await image
            .webp({ quality: WEBP_QUALITY, effort: 6 })
            .toFile(webpPath);

        const webpStats = await fs.stat(webpPath);
        stats.optimizedSize += webpStats.size;

        // Optimize original format in-place
        let optimized;
        if (ext === "png") {
            optimized = sharp(imagePath).png({
                quality: PNG_QUALITY,
                compressionLevel: 9,
            });
        } else if (ext === "jpg" || ext === "jpeg") {
            optimized = sharp(imagePath).jpeg({
                quality: JPEG_QUALITY,
                progressive: true,
                mozjpeg: true,
            });
        }

        if (optimized) {
            const tempPath = `${imagePath}.tmp`;
            await optimized.toFile(tempPath);
            await fs.rename(tempPath, imagePath);
        }

        const newOriginalStats = await fs.stat(imagePath);

        const savedBytes = originalStats.size - webpStats.size;
        const savedPercent = (
            (savedBytes / originalStats.size) *
            100
        ).toFixed(1);

        console.log(
            `  ✓ WebP: ${(webpStats.size / 1024).toFixed(1)}KB (${savedPercent}% smaller)`
        );
        console.log(
            `  ✓ Optimized ${ext.toUpperCase()}: ${(newOriginalStats.size / 1024).toFixed(1)}KB\n`
        );

        stats.processed++;
    } catch (error) {
        console.error(`  ✗ Error processing ${imagePath}:`, error.message);
        stats.errors++;
    }
}

async function main() {
    console.log("🖼️  Image Optimization Tool\n");
    console.log(`Scanning ${CONTENT_IMG_DIR}...\n`);

    // Find all images
    const patterns = SUPPORTED_FORMATS.map(
        (ext) => `${CONTENT_IMG_DIR}/**/*.${ext}`
    );
    const images = await glob(patterns, { nodir: true });

    if (images.length === 0) {
        console.log("No images found to optimize.");
        return;
    }

    console.log(`Found ${images.length} images to process.\n`);

    // Process each image
    for (const imagePath of images) {
        await optimizeImage(imagePath);
    }

    // Print summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 Optimization Summary");
    console.log("=".repeat(60));
    console.log(`✓ Processed: ${stats.processed}`);
    console.log(`⊘ Skipped: ${stats.skipped}`);
    console.log(`✗ Errors: ${stats.errors}`);
    console.log(
        `📦 Original size: ${(stats.originalSize / 1024 / 1024).toFixed(2)} MB`
    );
    console.log(
        `📦 WebP size: ${(stats.optimizedSize / 1024 / 1024).toFixed(2)} MB`
    );

    if (stats.originalSize > 0) {
        const savedBytes = stats.originalSize - stats.optimizedSize;
        const savedPercent = (
            (savedBytes / stats.originalSize) *
            100
        ).toFixed(1);
        console.log(
            `💰 Space saved: ${(savedBytes / 1024 / 1024).toFixed(2)} MB (${savedPercent}%)`
        );
    }
    console.log("=".repeat(60) + "\n");

    if (stats.errors > 0) {
        console.error(`⚠️  ${stats.errors} images failed to process.`);
        process.exit(1);
    }

    console.log("✅ Image optimization complete!\n");
    console.log(
        "💡 Next steps:\n" +
            "   - Review the optimized images\n" +
            "   - Update image references in markdown to use .webp\n" +
            "   - Or use <picture> tags for fallback support\n"
    );
}

main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
