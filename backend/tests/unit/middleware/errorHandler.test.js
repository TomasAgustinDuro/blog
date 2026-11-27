import { beforeEach, describe, expect, it, vi } from "vitest";
import { HttpError, validationError } from "../../../lib/httpError.js";
import { errorHandler, routeNotFoundHandler } from "../../../middleware/errorHandler.js";
import { createMockResponse } from "../../helpers/http.js";

const callErrorHandler = (error) => {
  const response = createMockResponse();
  errorHandler(error, { method: "GET", originalUrl: "/test" }, response, vi.fn());
  return { status: response.status.mock.calls[0][0], body: response.json.mock.calls[0][0] };
};

const prismaError = (code, meta = {}) => Object.assign(new Error("prisma internals"), { code, meta });

let logSpy;

beforeEach(() => {
  logSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("errorHandler: controlled errors", () => {
  it("responds with message and code of an HttpError", () => {
    const { status, body } = callErrorHandler(new HttpError(404, "NOT_FOUND", "El post no existe"));

    expect(status).toBe(404);
    expect(body).toMatchObject({ error: "El post no existe", code: "NOT_FOUND" });
    expect(body.details).toBeUndefined();
    expect(body.timestamp).toEqual(expect.any(String));
  });

  it("includes field details for validation errors", () => {
    const details = [{ field: "title", message: "El título es obligatorio" }];

    const { status, body } = callErrorHandler(validationError(details));

    expect(status).toBe(400);
    expect(body.details).toEqual(details);
  });

  it("does not log client errors", () => {
    callErrorHandler(new HttpError(400, "BAD_REQUEST", "x"));

    expect(logSpy).not.toHaveBeenCalled();
  });
});

describe("errorHandler: unexpected errors", () => {
  it("hides internal details and logs the original error", () => {
    const internalError = new Error("password authentication failed for user admin");

    const { status, body } = callErrorHandler(internalError);

    expect(status).toBe(500);
    expect(body.code).toBe("INTERNAL_ERROR");
    expect(body.error).not.toContain("password");
    expect(logSpy).toHaveBeenCalledWith("[GET /test]", internalError);
  });

  it("does not forward messages of 4xx errors thrown by libraries", () => {
    const libraryError = Object.assign(new Error("charset utf-7 unsupported"), { status: 415 });

    const { status, body } = callErrorHandler(libraryError);

    expect(status).toBe(415);
    expect(body.error).toBe("La solicitud no es válida");
  });

  it("delegates to Express when the response was already sent", () => {
    const response = { ...createMockResponse(), headersSent: true };
    const next = vi.fn();
    const error = new Error("late");

    errorHandler(error, {}, response, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(response.status).not.toHaveBeenCalled();
  });
});

describe("errorHandler: express.json errors", () => {
  it("translates malformed JSON to 400 INVALID_JSON", () => {
    const parseError = Object.assign(new SyntaxError("Unexpected token"), {
      type: "entity.parse.failed",
      status: 400,
    });

    const { status, body } = callErrorHandler(parseError);

    expect(status).toBe(400);
    expect(body).toMatchObject({ code: "INVALID_JSON" });
    expect(body.error).not.toContain("Unexpected token");
  });

  it("translates a too large body to 413", () => {
    const tooLarge = Object.assign(new Error("request entity too large"), {
      type: "entity.too.large",
      status: 413,
    });

    expect(callErrorHandler(tooLarge)).toMatchObject({
      status: 413,
      body: { code: "PAYLOAD_TOO_LARGE" },
    });
  });
});

describe("errorHandler: Prisma errors", () => {
  it.each([
    ["posts", "El post no existe"],
    ["comments", "El comentario no existe"],
    ["images", "La imagen no existe"],
    [undefined, "El recurso solicitado no existe"],
  ])("maps P2025 of model %s to a 404 with a specific message", (modelName, message) => {
    const { status, body } = callErrorHandler(prismaError("P2025", { modelName }));

    expect(status).toBe(404);
    expect(body.error).toBe(message);
  });

  it.each([
    [{ constraint: "comments_post_id_fkey" }],
    [{ field_name: "comments_post_id_fkey (index)" }],
  ])("maps a missing post foreign key (P2003, meta %j) to 404", (meta) => {
    const error = prismaError("P2003", meta);

    expect(callErrorHandler(error)).toMatchObject({
      status: 404,
      body: { error: "El post indicado no existe" },
    });
  });

  it("maps a missing image foreign key (P2003) to 400 without exposing the index", () => {
    const error = prismaError("P2003", { constraint: "post_images_image_id_fkey" });

    const { status, body } = callErrorHandler(error);

    expect(status).toBe(400);
    expect(body.error).toBe("Alguna de las imágenes indicadas no existe");
    expect(JSON.stringify(body)).not.toContain("fkey");
  });

  it("maps a unique constraint violation (P2002) to 409", () => {
    expect(callErrorHandler(prismaError("P2002")).status).toBe(409);
  });

  it("maps database connection errors to 503 and logs them", () => {
    const { status, body } = callErrorHandler(prismaError("P1001"));

    expect(status).toBe(503);
    expect(body.code).toBe("SERVICE_UNAVAILABLE");
    expect(logSpy).toHaveBeenCalled();
  });
});

describe("routeNotFoundHandler", () => {
  it("forwards a 404 ROUTE_NOT_FOUND error", () => {
    const next = vi.fn();

    routeNotFoundHandler({}, createMockResponse(), next);

    expect(next.mock.calls[0][0]).toMatchObject({ status: 404, code: "ROUTE_NOT_FOUND" });
  });
});
