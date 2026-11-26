import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { validateSchema } from "../../../middleware/validate.js";
import { createMockResponse } from "../../helpers/http.js";

const nameSchema = z.object({ name: z.string().min(2) });

describe("validateSchema", () => {
  it("stores parsed data in req.validated and calls next", () => {
    const request = { body: { name: "Ana", extra: "ignored" } };
    const next = vi.fn();

    validateSchema(nameSchema)(request, createMockResponse(), next);

    expect(request.validated).toEqual({ name: "Ana" });
    expect(next).toHaveBeenCalledOnce();
  });

  it("responds 400 with details when data is invalid", () => {
    const response = createMockResponse();
    const next = vi.fn();

    validateSchema(nameSchema)({ body: { name: "A" } }, response, next);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Validation failed" })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("responds 400 when the body is missing", () => {
    const response = createMockResponse();

    validateSchema(nameSchema)({}, response, vi.fn());

    expect(response.status).toHaveBeenCalledWith(400);
  });

  it("can validate another part of the request", () => {
    const request = { query: { name: "Luis" } };
    const next = vi.fn();

    validateSchema(nameSchema, "query")(request, createMockResponse(), next);

    expect(request.validated).toEqual({ name: "Luis" });
    expect(next).toHaveBeenCalledOnce();
  });
});
