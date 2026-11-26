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

describe("verifyToken", () => {
  it("rejects requests without Authorization header", async () => {
    const { response, next } = await runMiddleware(verifyToken, buildRequest());

    expect(response.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects headers that are not Bearer tokens", async () => {
    const request = buildRequest("Basic abc123");

    const { response } = await runMiddleware(verifyToken, request);

    expect(response.status).toHaveBeenCalledWith(401);
  });

  it("rejects a token signed with another secret", async () => {
    const forgedToken = jwt.sign({ username: "admin" }, "other-secret");

    const { response } = await runMiddleware(
      verifyToken,
      buildRequest(`Bearer ${forgedToken}`)
    );

    expect(response.status).toHaveBeenCalledWith(403);
  });

  it("rejects expired tokens with a specific message", async () => {
    const expiredToken = signToken({ expiresIn: -10 });

    const { response } = await runMiddleware(
      verifyToken,
      buildRequest(`Bearer ${expiredToken}`)
    );

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ message: "Token expirado" });
  });

  it("accepts a valid token and exposes the user in req.user", async () => {
    const request = buildRequest(`Bearer ${signToken()}`);

    const { next } = await runMiddleware(verifyToken, request);

    expect(next).toHaveBeenCalledOnce();
    expect(request.user.username).toBe("admin");
  });
});
