import jwt from "jsonwebtoken";
import { describe, expect, it, vi } from "vitest";
import { verifyToken } from "../../../middleware/verifyToken.js";
import { runMiddleware } from "../../helpers/http.js";

const TEST_SECRET = "test-secret";

vi.mock("../../../config/env.js", () => ({ env: { JWT_SECRET: "test-secret" } }));

const buildRequest = (authorization) => ({
  headers: authorization ? { authorization } : {},
});

const signToken = (options = {}) =>
  jwt.sign({ username: "admin" }, TEST_SECRET, { expiresIn: "5m", ...options });

const rejectionOf = async (request) => {
  const { next } = await runMiddleware(verifyToken, request);
  return next.mock.calls[0][0];
};

describe("verifyToken", () => {
  it("asks to log in when there is no Authorization header", async () => {
    const error = await rejectionOf(buildRequest());

    expect(error).toMatchObject({ status: 401, code: "AUTH_REQUIRED" });
  });

  it.each(["Basic abc123", "Bearer", "Bearer "])(
    "rejects the malformed header %j",
    async (header) => {
      const error = await rejectionOf(buildRequest(header));

      expect(error).toMatchObject({ status: 401, code: "INVALID_TOKEN" });
    }
  );

  it("rejects a token signed with another secret", async () => {
    const forgedToken = jwt.sign({ username: "admin" }, "other-secret");

    const error = await rejectionOf(buildRequest(`Bearer ${forgedToken}`));

    expect(error).toMatchObject({ status: 401, code: "INVALID_TOKEN" });
  });

  it("tells the user that the session expired", async () => {
    const error = await rejectionOf(buildRequest(`Bearer ${signToken({ expiresIn: -10 })}`));

    expect(error).toMatchObject({ status: 401, code: "TOKEN_EXPIRED" });
    expect(error.message).toMatch(/sesión expiró/);
  });

  it("accepts a valid token and exposes the user in req.user", async () => {
    const request = buildRequest(`Bearer ${signToken()}`);

    const { next } = await runMiddleware(verifyToken, request);

    expect(next).toHaveBeenCalledWith();
    expect(request.user.username).toBe("admin");
  });
});
