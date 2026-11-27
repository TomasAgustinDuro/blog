import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_DESCRIPTION,
  META_BLOCK_END,
  META_BLOCK_START,
  buildPostMeta,
  escapeHtml,
  findFirstImageUrl,
  htmlToPlainText,
  injectMetaTags,
  isLinkPreviewBot,
  renderMetaTags,
  truncateText,
} from "../../../seo/openGraph.js";

const SITE_URL = "https://blog.test";

describe("isLinkPreviewBot", () => {
  it.each([
    "WhatsApp/2.23.20.0 A",
    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
    "Twitterbot/1.0",
    "LinkedInBot/1.0 (compatible; Mozilla/5.0)",
    "TelegramBot (like TwitterBot)",
    "Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)",
  ])("detects %s", (userAgent) => {
    expect(isLinkPreviewBot(userAgent)).toBe(true);
  });

  it("ignores regular browsers and missing headers", () => {
    const chrome =
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36";

    expect(isLinkPreviewBot(chrome)).toBe(false);
    expect(isLinkPreviewBot(null)).toBe(false);
  });
});

describe("escapeHtml", () => {
  it("escapes characters that could break out of an attribute", () => {
    expect(escapeHtml(`"><script>alert('x')</script>&`)).toBe(
      "&quot;&gt;&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt;&amp;"
    );
  });
});

describe("htmlToPlainText", () => {
  it("removes tags, decodes entities and collapses whitespace", () => {
    const html = "<h1>Hola</h1>\n<p>Caf&eacute;?  &amp; t&#233; &#x1F44B;&nbsp;fin</p>";

    expect(htmlToPlainText(html)).toBe("Hola Caf&eacute;? & té 👋 fin");
  });

  it("returns an empty string for empty content", () => {
    expect(htmlToPlainText("<p></p>")).toBe("");
    expect(htmlToPlainText(undefined)).toBe("");
  });
});

describe("truncateText", () => {
  it("keeps short texts as they are", () => {
    expect(truncateText("Texto corto", 160)).toBe("Texto corto");
  });

  it("cuts at a word boundary and adds an ellipsis within the limit", () => {
    const text = "uno dos tres cuatro cinco seis siete";

    const result = truncateText(text, 20);

    expect(result).toBe("uno dos tres cuatro…");
    expect(result.length).toBeLessThanOrEqual(20);
  });

  it("drops trailing punctuation before the ellipsis", () => {
    expect(truncateText("Hola, mundo. Esto sigue largo", 14)).toBe("Hola, mundo…");
  });

  it("cuts long words that have no spaces", () => {
    expect(truncateText("a".repeat(30), 10)).toBe(`${"a".repeat(9)}…`);
  });
});

describe("findFirstImageUrl", () => {
  it("returns the first http(s) image, with single or double quotes", () => {
    expect(findFirstImageUrl('<p>x</p><img class="a" src="https://cdn.test/1.png"><img src="https://cdn.test/2.png">')).toBe(
      "https://cdn.test/1.png"
    );
    expect(findFirstImageUrl("<img src='https://cdn.test/3.jpg' />")).toBe("https://cdn.test/3.jpg");
  });

  it.each(['<img src="/relative.png">', '<img src="javascript:alert(1)">', "<p>sin imágenes</p>", null])(
    "returns null for %j",
    (html) => {
      expect(findFirstImageUrl(html)).toBeNull();
    }
  );
});

describe("buildPostMeta", () => {
  const basePost = { id: 6, title: "Mi post", content: "<p>Contenido del post</p>", date: "2026-11-26T00:00:00.000Z" };

  it("uses the post data and the default image when the content has none", () => {
    const meta = buildPostMeta(basePost, SITE_URL);

    expect(meta).toMatchObject({
      pageTitle: "Mi post | Blog personal",
      title: "Mi post",
      description: "Contenido del post",
      url: "https://blog.test/post/6",
      type: "article",
      publishedTime: "2026-11-26T00:00:00.000Z",
      image: "https://blog.test/og-default.png",
      imageSize: { width: 1200, height: 630 },
    });
  });

  it("uses the first image of the post without a fixed size", () => {
    const post = { ...basePost, content: '<p>Hola</p><img src="https://cdn.test/foto.jpg">' };

    const meta = buildPostMeta(post, SITE_URL);

    expect(meta.image).toBe("https://cdn.test/foto.jpg");
    expect(meta.imageSize).toBeNull();
  });

  it("falls back to the default description for posts without text", () => {
    expect(buildPostMeta({ ...basePost, content: "<p></p>" }, SITE_URL).description).toBe(
      DEFAULT_DESCRIPTION
    );
  });
});

describe("renderMetaTags", () => {
  it("renders escaped Open Graph and Twitter tags", () => {
    const meta = buildPostMeta(
      { id: 1, title: 'Hack "><script>alert(1)</script>', content: "<p>x</p>" },
      SITE_URL
    );

    const tags = renderMetaTags(meta);

    expect(tags).not.toContain("<script>");
    expect(tags).toContain('<meta property="og:title" content="Hack &quot;&gt;&lt;script&gt;');
    expect(tags).toContain('<meta property="og:url" content="https://blog.test/post/1" />');
    expect(tags).toContain('<meta name="twitter:card" content="summary_large_image" />');
    expect(tags).not.toContain("article:published_time");
  });
});

describe("injectMetaTags", () => {
  const shell = `<head>\n${META_BLOCK_START}\n<title>Default</title>\n${META_BLOCK_END}\n<script src="/app.js"></script></head>`;

  it("replaces only the marked block", () => {
    const html = injectMetaTags(shell, "<title>Post</title>");

    expect(html).toContain("<title>Post</title>");
    expect(html).not.toContain("<title>Default</title>");
    expect(html).toContain('<script src="/app.js"></script>');
  });

  it("returns null when the markers are missing", () => {
    expect(injectMetaTags("<head></head>", "<title>Post</title>")).toBeNull();
  });

  it("keeps working with the real index.html", () => {
    const indexHtml = readFileSync(new URL("../../../index.html", import.meta.url), "utf8");

    expect(indexHtml).toContain(META_BLOCK_START);
    expect(indexHtml).toContain(META_BLOCK_END);
    expect(injectMetaTags(indexHtml, "<title>Post</title>")).toContain("<title>Post</title>");
  });
});
