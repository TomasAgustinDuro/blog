import { beforeEach, describe, expect, it, vi } from "vitest";
import openGraphMiddleware, { config } from "../../middleware.js";

// next() de Vercel se reemplaza por una respuesta marcada para reconocerla
vi.mock("@vercel/functions", () => ({
  next: () => new Response(null, { headers: { "x-test": "next" } }),
}));

const BOT_USER_AGENT = "WhatsApp/2.23.20.0 A";
const BROWSER_USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64) Chrome/131.0 Safari/537.36";
const APP_SHELL =
  "<html><head><!-- open-graph:start --><title>Blog personal</title><!-- open-graph:end --></head><body></body></html>";
const POST = { id: 6, title: "El punto medio", content: "<p>Equilibrio entre tickets</p>" };

const buildRequest = (path, userAgent = BOT_USER_AGENT) =>
  new Request(`https://blog.test${path}`, { headers: { "user-agent": userAgent } });

const isNext = (response) => response.headers.get("x-test") === "next";

/** fetch falso: responde la API y el index.html según la URL pedida. */
const stubFetch = ({ postResponse, shellResponse }) => {
  const fetchMock = vi.fn(async (url) => {
    const target = String(url);
    if (target.endsWith("/index.html")) return shellResponse();
    return postResponse();
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

const jsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

beforeEach(() => {
  vi.stubEnv("VITE_API_URL", "https://api.test/");
  vi.stubEnv("VITE_SITE_URL", "https://blog.test");
});

describe("openGraphMiddleware", () => {
  it("only runs on post pages", () => {
    expect(config).toEqual({ matcher: "/post/:id" });
  });

  it("lets regular visitors through without calling the API", async () => {
    const fetchMock = stubFetch({ postResponse: () => jsonResponse({ post: POST }), shellResponse: () => new Response(APP_SHELL) });

    const response = await openGraphMiddleware(buildRequest("/post/6", BROWSER_USER_AGENT));

    expect(isNext(response)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("serves the post card to link preview bots", async () => {
    const fetchMock = stubFetch({ postResponse: () => jsonResponse({ post: POST }), shellResponse: () => new Response(APP_SHELL) });

    const response = await openGraphMiddleware(buildRequest("/post/6"));
    const html = await response.text();

    expect(response.headers.get("content-type")).toBe("text/html; charset=utf-8");
    expect(html).toContain("<title>El punto medio | Blog personal</title>");
    expect(html).toContain('<meta property="og:url" content="https://blog.test/post/6" />');
    expect(html).toContain('content="https://blog.test/og-default.png"');
    expect(String(fetchMock.mock.calls[0][0])).toBe("https://api.test/posts/6");
  });

  it.each(["/post/abc", "/post/6.5"])("ignores the non numeric id in %s", async (path) => {
    const fetchMock = stubFetch({ postResponse: () => jsonResponse({}), shellResponse: () => new Response(APP_SHELL) });

    expect(isNext(await openGraphMiddleware(buildRequest(path)))).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("falls back to the default tags when the post does not exist", async () => {
    stubFetch({ postResponse: () => jsonResponse({ error: "El post no existe" }, 404), shellResponse: () => new Response(APP_SHELL) });

    expect(isNext(await openGraphMiddleware(buildRequest("/post/999")))).toBe(true);
  });

  it("falls back and logs only the error type when the API fails", async () => {
    const logSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    stubFetch({
      postResponse: () => Promise.reject(Object.assign(new Error("connect https://api.test failed"), { name: "TimeoutError" })),
      shellResponse: () => new Response(APP_SHELL),
    });

    const response = await openGraphMiddleware(buildRequest("/post/6"));

    expect(isNext(response)).toBe(true);
    expect(logSpy).toHaveBeenCalledWith(expect.any(String), "TimeoutError");
    expect(JSON.stringify(logSpy.mock.calls)).not.toContain("api.test");
  });

  it("falls back when index.html has no open-graph markers", async () => {
    stubFetch({ postResponse: () => jsonResponse({ post: POST }), shellResponse: () => new Response("<html><head></head></html>") });

    expect(isNext(await openGraphMiddleware(buildRequest("/post/6")))).toBe(true);
  });

  it("falls back when VITE_API_URL is not configured", async () => {
    vi.stubEnv("VITE_API_URL", "");
    const fetchMock = stubFetch({ postResponse: () => jsonResponse({ post: POST }), shellResponse: () => new Response(APP_SHELL) });

    expect(isNext(await openGraphMiddleware(buildRequest("/post/6")))).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("uses the request origin when VITE_SITE_URL is missing", async () => {
    vi.stubEnv("VITE_SITE_URL", "");
    stubFetch({ postResponse: () => jsonResponse({ post: POST }), shellResponse: () => new Response(APP_SHELL) });

    const html = await (await openGraphMiddleware(buildRequest("/post/6"))).text();

    expect(html).toContain('content="https://blog.test/post/6"');
  });
});
