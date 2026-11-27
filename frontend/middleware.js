import { next } from "@vercel/functions";
import { buildPostMeta, injectMetaTags, isLinkPreviewBot, renderMetaTags } from "./seo/openGraph.js";

/**
 * Middleware de Vercel: tarjetas Open Graph por post.
 *
 * Los crawlers de redes sociales no ejecutan JavaScript, así que para ellos
 * se arma el index.html con el título, resumen e imagen del post. Los
 * visitantes reciben la SPA sin cambios. Ante cualquier problema (API lenta,
 * post inexistente) se sigue con el index.html y sus etiquetas por defecto.
 */
export const config = { matcher: "/post/:id" };

// Render tarda en despertar: mejor la tarjeta genérica que un crawler sin respuesta
const UPSTREAM_TIMEOUT_MS = 2500;

const fetchPost = async (apiUrl, postId) => {
  const response = await fetch(`${apiUrl}/posts/${postId}`, {
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });
  if (!response.ok) return null;

  const { post } = await response.json();
  return post ?? null;
};

const fetchAppShell = async (requestUrl) => {
  const response = await fetch(new URL("/index.html", requestUrl), {
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });
  return response.ok ? response.text() : null;
};

const resolveSiteUrl = (requestUrl) =>
  (process.env.VITE_SITE_URL || new URL(requestUrl).origin).replace(/\/+$/, "");

/**
 * Devuelve el HTML del post con sus etiquetas, o null para usar las de siempre.
 *
 * @param {Request} request - Request del crawler.
 * @param {string} postId - Id numérico del post.
 * @returns {Promise<string | null>} HTML listo para responder.
 */
const buildPostPage = async (request, postId) => {
  const apiUrl = process.env.VITE_API_URL;
  if (!apiUrl) return null;

  const [post, appShell] = await Promise.all([
    fetchPost(apiUrl.replace(/\/+$/, ""), postId),
    fetchAppShell(request.url),
  ]);
  if (!post || !appShell) return null;

  const meta = buildPostMeta(post, resolveSiteUrl(request.url));
  return injectMetaTags(appShell, renderMetaTags(meta));
};

export default async function openGraphMiddleware(request) {
  if (!isLinkPreviewBot(request.headers.get("user-agent"))) return next();

  const postId = new URL(request.url).pathname.split("/")[2];
  if (!/^\d+$/.test(postId)) return next();

  try {
    const postPage = await buildPostPage(request, postId);
    if (!postPage) return next();

    return new Response(postPage, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    // Solo el tipo de error: la URL de la API no debe quedar en los logs públicos
    console.error("[open-graph] se usan las etiquetas por defecto:", error.name);
    return next();
  }
}
