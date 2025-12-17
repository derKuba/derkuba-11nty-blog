import pluginRss from "@11ty/eleventy-plugin-rss";
import { EleventyHtmlBasePlugin } from "@11ty/eleventy";
import pluginNavigation from "@11ty/eleventy-navigation";
import pluginSyntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import CleanCSS from "clean-css";
import { minify as htmlMinify } from "html-minifier-terser";

import { DateTime } from "luxon";

const extractExcerpt = (post) => {
    if (!Object.prototype.hasOwnProperty.call(post, "templateContent")) {
        return null;
    }
    const content = post.templateContent;
    const markerIndex = content.indexOf("<!-- endOfPreview -->");

    return markerIndex > 0 ? content.slice(0, markerIndex) + " [...]" : "";
};

export default async function (eleventyConfig) {
    eleventyConfig.addPlugin(pluginRss);
    eleventyConfig.addPlugin(pluginNavigation);
    eleventyConfig.addPlugin(pluginSyntaxHighlight, {
        alwaysWrapLineHighlights: true,
    });
    eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

    eleventyConfig.addPassthroughCopy("assets/css/*.css");
    eleventyConfig.addPassthroughCopy("assets/images/*.png");
    eleventyConfig.addPassthroughCopy("assets/images/*.svg");

    eleventyConfig.addPassthroughCopy({
        "node_modules/bulma/css/bulma.css": "assets/css/bulma.css",
    });
    eleventyConfig.addPassthroughCopy({ "assets/favicons": "/" });

    eleventyConfig.addPassthroughCopy(
        "content/img/**/*.@(jpg|jpeg|png|gif|webp)",
    );

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
        if (index < badge.length) {
            return badge[index];
        }

        const color = index % badge.length;

        return badge[color];
    });

    eleventyConfig.addShortcode("excerpt", (post) => extractExcerpt(post));

    // WebP image shortcode with fallback
    eleventyConfig.addShortcode("image", function (src, alt, className = "") {
        const path = require("path");
        const ext = path.extname(src);
        const basename = src.replace(ext, "");
        const webpSrc = `${basename}.webp`;

        return `<picture${className ? ` class="${className}"` : ""}>
  <source srcset="${webpSrc}" type="image/webp">
  <img src="${src}" alt="${alt}" loading="lazy">
</picture>`;
    });

    eleventyConfig.addFilter("htmlDateString", (dateObj) => {
        return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat(
            "yyyy-LL-dd",
        );
    });

    eleventyConfig.addFilter("readableDate", (dateObj) => {
        return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat(
            "dd LLL yyyy",
        );
    });

    eleventyConfig.addFilter("filterTagList", (tags) => {
        // Filter out meta tags and internal tags
        const hiddenTags = [
            "all",
            "nav",
            "post",
            "posts",
            "englishposts",
            "allpostsexceptenglish",
        ];
        return (tags || []).filter((tag) => hiddenTags.indexOf(tag) === -1);
    });

    eleventyConfig.addFilter("filterNavigation", function (navigation) {
        return navigation.filter((item) => !item.url.includes("/tags/"));
    });

    // Get the first `n` elements of a collection.
    eleventyConfig.addFilter("head", (array, n) => {
        if (n < 0) {
            return array.slice(n);
        }

        return array.slice(0, n);
    });

    // Return the smallest number argument
    eleventyConfig.addFilter("min", (...numbers) => {
        return Math.min.apply(null, numbers);
    });

    // Extract reading time
    eleventyConfig.addFilter("readingTime", (wordcount) => {
        let readingTime = Math.ceil(wordcount / 220);
        if (readingTime === 1) {
            return readingTime + " Minute";
        }
        return readingTime + " Minuten";
    });

    // Create an array of all tags for categories on home page
    eleventyConfig.addCollection("tagList", function (collection) {
        let tagSet = new Set();
        collection.getAll().forEach((item) => {
            (item.data.tags || []).forEach((tag) => tagSet.add(tag));
        });

        return [...tagSet];
    });

    eleventyConfig.addCollection(
        "allPostsExceptEnglish",
        function (collectionApi) {
            return collectionApi
                .getFilteredByGlob("content/posts/**/*.md")
                .filter(function (item) {
                    // Filtere die Posts, die im Ordner 'posts/en/' sind
                    return !item.inputPath.includes("content/posts/en/");
                });
        },
    );

    eleventyConfig.addCollection("englishPosts", function (collectionApi) {
        return collectionApi.getFilteredByGlob("content/posts/en/**/*.md");
    });

    // CSS Minification
    eleventyConfig.addFilter("cssmin", function (code) {
        return new CleanCSS({}).minify(code).styles;
    });

    // HTML Minification (only for production)
    eleventyConfig.addTransform("htmlmin", function (content, outputPath) {
        if (
            process.env.ELEVENTY_ENV === "production" &&
            outputPath &&
            outputPath.endsWith(".html")
        ) {
            return htmlMinify(content, {
                useShortDoctype: true,
                removeComments: true,
                collapseWhitespace: true,
                minifyCSS: true,
                minifyJS: true,
            });
        }
        return content;
    });

    return {
        templateFormats: ["md", "njk", "html", "liquid"],
        markdownTemplateEngine: "njk",
        htmlTemplateEngine: "njk",
        dir: {
            input: "content",
            includes: "../_includes",
            data: "../_data",
            output: "_site",
        },
        pathPrefix: "/",
    };
}
