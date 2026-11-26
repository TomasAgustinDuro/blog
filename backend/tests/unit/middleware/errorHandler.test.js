import { describe, expect, it, vi } from "vitest";
import { errorHandler } from "../../../middleware/errorHandler.js";
import { createMockResponse } from "../../helpers/http.js";

const callErrorHandler = (error) => {
  const response = createMockResponse();
  errorHandler(error, {}, response, vi.fn());
  return response;
};

describe("errorHandler", () => {
  it("exposes the message of client errors (4xx)", () => {
    const error = Object.assign(new Error("Post not found"), { status: 404 });

    const response = callErrorHandler(error);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Post not found", code: "REQUEST_ERROR" })
    );
  });

  it("hides internal details of unexpected errors", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    const response = callErrorHandler(new Error("db password leaked"));

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      })
    );
  });

  it("maps Prisma P2025 (record not found) to a 404", () => {
    const prismaError = Object.assign(new Error("Record not found"), {
      code: "P2025",
    });

    const response = callErrorHandler(prismaError);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Resource not found" })
    );
  });

  it("logs only server errors", () => {
    const logSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    callErrorHandler(Object.assign(new Error("bad"), { status: 400 }));

    expect(logSpy).not.toHaveBeenCalled();
  });
});
