/**
 * Utilidades puras para generar las etiquetas Open Graph de los posts.
 *
 * Las usa el middleware de Vercel (middleware.js) para que los crawlers de
 * redes sociales, que no ejecutan JavaScript, vean una tarjeta por post.
 */

export const SITE_NAME = "Blog personal";

// Tomada del primer post del blog
export const DEFAULT_DESCRIPTION =
  "Un espacio para compartir reflexiones, ideas, proyectos y experiencias de una forma simple, honesta y despejada.";

export const DEFAULT_IMAGE_PATH = "/og-default.png";
const DEFAULT_IMAGE_SIZE = { width: 1200, height: 630 };
const DESCRIPTION_MAX_LENGTH = 160;

export const META_BLOCK_START = "<!-- open-graph:start -->";
export const META_BLOCK_END = "<!-- open-graph:end -->";

// Crawlers de vista previa de links (no ejecutan el JavaScript de la SPA)
const LINK_PREVIEW_BOT_PATTERN =
  /facebookexternalhit|facebot|twitterbot|linkedinbot|whatsapp|telegrambot|slackbot|discordbot|pinterest|redditbot|skypeuripreview|applebot|googlebot|bingbot|embedly|iframely|mastodon|bluesky|cardyb|vkshare|tumblr/i;

const HTML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

const NAMED_ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

/**
 * Indica si el User-Agent corresponde a un crawler de vista previa.
 *
 * @param {string | null} userAgent - Header User-Agent de la request.
 * @returns {boolean} true si hay que servirle etiquetas del post.
 */
export const isLinkPreviewBot = (userAgent) => LINK_PREVIEW_BOT_PATTERN.test(userAgent ?? "");

/**
 * Escapa un texto para insertarlo de forma segura en un atributo HTML.
 *
 * @param {unknown} text - Valor a escapar.
 * @returns {string} Texto escapado.
 */
export const escapeHtml = (text) =>
  String(text).replace(/[&<>"']/g, (character) => HTML_ESCAPES[character]);

const decodeEntities = (text) =>
  text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal) => String.fromCodePoint(Number(decimal)))
    .replace(/&([a-z]+);/gi, (entity, name) => NAMED_ENTITIES[name.toLowerCase()] ?? entity);

/**
 * Convierte el HTML del editor en texto plano de una sola línea.
 *
 * @param {string} html - Contenido del post.
 * @returns {string} Texto sin etiquetas ni espacios repetidos.
 */
export const htmlToPlainText = (html) =>
  decodeEntities(String(html ?? "").replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();

/**
 * Recorta un texto sin cortar palabras y agrega "…" si hizo falta.
 *
 * @param {string} text - Texto a recortar.
 * @param {number} [maxLength=160] - Largo máximo, incluido el "…".
 * @returns {string} Texto recortado.
 */
export const truncateText = (text, maxLength = DESCRIPTION_MAX_LENGTH) => {
  if (text.length <= maxLength) return text;

  const hardCut = text.slice(0, maxLength - 1);
  // Si justo después del corte hay un espacio, la última palabra entra completa
  const endsAtWordBoundary = /\s/.test(text[maxLength - 1]);
  const lastSpace = hardCut.lastIndexOf(" ");
  const cleanCut =
    endsAtWordBoundary || lastSpace <= 0 ? hardCut : hardCut.slice(0, lastSpace);
  return `${cleanCut.replace(/[\s.,;:]+$/, "")}…`;
};

/**
 * Devuelve la URL de la primera imagen del contenido, si es http/https.
 *
 * @param {string} html - Contenido del post.
 * @returns {string | null} URL absoluta o null.
 */
export const findFirstImageUrl = (html) => {
  const match = String(html ?? "").match(/<img\b[^>]*?\ssrc\s*=\s*["']([^"']+)["']/i);
  const imageUrl = match?.[1]?.trim();
  return imageUrl && /^https?:\/\//i.test(imageUrl) ? imageUrl : null;
};

/**
 * Arma los datos de la tarjeta de un post.
 *
 * @param {{ id: number, title: string, content: string, date?: string }} post
 * @param {string} siteUrl - URL pública del frontend, sin barra final.
 * @returns {object} Datos para renderMetaTags.
 */
export const buildPostMeta = (post, siteUrl) => {
  const imageUrl = findFirstImageUrl(post.content);

  return {
    pageTitle: `${post.title} | ${SITE_NAME}`,
    title: post.title,
    description: truncateText(htmlToPlainText(post.content)) || DEFAULT_DESCRIPTION,
    url: `${siteUrl}/post/${post.id}`,
    type: "article",
    publishedTime: post.date ?? null,
    image: imageUrl ?? `${siteUrl}${DEFAULT_IMAGE_PATH}`,
    imageSize: imageUrl ? null : DEFAULT_IMAGE_SIZE,
    imageAlt: post.title,
  };
};

const metaProperty = (property, content) =>
  `<meta property="${property}" content="${escapeHtml(content)}" />`;

const metaName = (name, content) => `<meta name="${name}" content="${escapeHtml(content)}" />`;

/**
 * Genera el bloque de etiquetas <title>, description, Open Graph y Twitter.
 *
 * @param {ReturnType<typeof buildPostMeta>} meta - Datos de la tarjeta.
 * @returns {string} HTML con todas las etiquetas escapadas.
 */
export const renderMetaTags = (meta) =>
  [
    `<title>${escapeHtml(meta.pageTitle)}</title>`,
    metaName("description", meta.description),
    `<link rel="canonical" href="${escapeHtml(meta.url)}" />`,
    metaProperty("og:site_name", SITE_NAME),
    metaProperty("og:locale", "es_AR"),
    metaProperty("og:type", meta.type),
    metaProperty("og:title", meta.title),
    metaProperty("og:description", meta.description),
    metaProperty("og:url", meta.url),
    metaProperty("og:image", meta.image),
    meta.imageSize && metaProperty("og:image:width", meta.imageSize.width),
    meta.imageSize && metaProperty("og:image:height", meta.imageSize.height),
    metaProperty("og:image:alt", meta.imageAlt),
    meta.publishedTime && metaProperty("article:published_time", meta.publishedTime),
    metaName("twitter:card", "summary_large_image"),
    metaName("twitter:title", meta.title),
    metaName("twitter:description", meta.description),
    metaName("twitter:image", meta.image),
  ]
    .filter(Boolean)
    .join("\n    ");

/**
 * Reemplaza el bloque marcado de index.html por las etiquetas del post.
 *
 * @param {string} html - index.html generado por Vite.
 * @param {string} metaTags - Resultado de renderMetaTags.
 * @returns {string | null} HTML final, o null si faltan los marcadores.
 */
export const injectMetaTags = (html, metaTags) => {
  const blockStart = html.indexOf(META_BLOCK_START);
  const blockEnd = html.indexOf(META_BLOCK_END);
  if (blockStart === -1 || blockEnd < blockStart) return null;

  return (
    html.slice(0, blockStart + META_BLOCK_START.length) +
    `\n    ${metaTags}\n    ` +
    html.slice(blockEnd)
  );
};
