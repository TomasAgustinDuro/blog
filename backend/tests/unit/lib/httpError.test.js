import { describe, expect, it } from "vitest";
import {
  HttpError,
  badRequest,
  notFound,
  unauthorized,
  validationError,
} from "../../../lib/httpError.js";

describe("HttpError factories", () => {
  it.each([
    [badRequest("x"), 400, "BAD_REQUEST"],
    [notFound("x"), 404, "NOT_FOUND"],
    [unauthorized("TOKEN_EXPIRED", "x"), 401, "TOKEN_EXPIRED"],
  ])("builds an HttpError with the right status and code", (error, status, code) => {
    expect(error).toBeInstanceOf(HttpError);
    expect(error).toMatchObject({ status, code, details: [] });
  });
});

describe("validationError", () => {
  it("summarizes every field message and keeps the details", () => {
    const details = [
      { field: "title", message: "El título es obligatorio" },
      { field: "content", message: "El contenido es obligatorio" },
    ];

    const error = validationError(details);

    expect(error.status).toBe(400);
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.message).toBe("El título es obligatorio. El contenido es obligatorio");
    expect(error.details).toEqual(details);
  });

  it("does not repeat identical messages", () => {
    const repeated = { field: "images.0.id", message: "Id inválido" };

    const error = validationError([repeated, { ...repeated, field: "images.1.id" }]);

    expect(error.message).toBe("Id inválido");
    expect(error.details).toHaveLength(2);
  });
});
