import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { HttpError } from "../../../lib/httpError.js";
import { validateSchema } from "../../../middleware/validate.js";
import { createMockResponse } from "../../helpers/http.js";

const nameSchema = z.object({ name: z.string().min(2, "Nombre muy corto") });
const idSchema = z.object({ id: z.coerce.number() });

describe("validateSchema", () => {
  it("stores parsed body data in req.validated.body and calls next", () => {
    const request = { body: { name: "Ana", extra: "ignored" } };
    const next = vi.fn();

    validateSchema(nameSchema)(request, createMockResponse(), next);

    expect(request.validated.body).toEqual({ name: "Ana" });
    expect(next).toHaveBeenCalledWith();
  });

  it("keeps previous validated parts when validating another source", () => {
    const request = { params: { id: "7" }, body: { name: "Ana" } };

    validateSchema(idSchema, "params")(request, createMockResponse(), vi.fn());
    validateSchema(nameSchema)(request, createMockResponse(), vi.fn());

    expect(request.validated).toEqual({ params: { id: 7 }, body: { name: "Ana" } });
  });

  it("forwards a VALIDATION_ERROR with field details when data is invalid", () => {
    const response = createMockResponse();
    const next = vi.fn();

    validateSchema(nameSchema)({ body: { name: "A" } }, response, next);

    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(HttpError);
    expect(error).toMatchObject({ status: 400, code: "VALIDATION_ERROR" });
    expect(error.details).toEqual([{ field: "name", message: "Nombre muy corto" }]);
    expect(response.status).not.toHaveBeenCalled();
  });

  it("reports nested paths with dot notation", () => {
    const listSchema = z.object({ items: z.array(z.object({ id: z.number() })) });
    const next = vi.fn();

    validateSchema(listSchema)({ body: { items: [{ id: "x" }] } }, createMockResponse(), next);

    expect(next.mock.calls[0][0].details[0].field).toBe("items.0.id");
  });

  it("rejects a missing body", () => {
    const next = vi.fn();

    validateSchema(nameSchema)({}, createMockResponse(), next);

    expect(next.mock.calls[0][0].status).toBe(400);
  });
});
