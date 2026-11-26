import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { createMockResponse } from "../../helpers/http.js";

const VALID_PASSWORD = "correct-password";

const mockEnv = vi.hoisted(() => ({
  JWT_SECRET: "test-secret",
  ADMIN_USER: "admin",
  ADMIN_PASSWORD: "",
}));

vi.mock("../../../config/env.js", () => ({ env: mockEnv }));

let Login;

beforeAll(async () => {
  // El módulo lee la contraseña al importarse, por eso el hash se define antes
  mockEnv.ADMIN_PASSWORD = bcrypt.hashSync(VALID_PASSWORD, 4);
  ({ Login } = await import("../../../middleware/auth.js"));
});

const attemptLogin = async (body) => {
  const response = createMockResponse();
  await Login.loginUser({ body }, response);
  return response;
};

describe("Login.loginUser", () => {
  it("returns a signed JWT for valid credentials", async () => {
    const response = await attemptLogin({ user: "admin", password: VALID_PASSWORD });

    const { token } = response.json.mock.calls[0][0];
    expect(jwt.verify(token, "test-secret").username).toBe("admin");
  });

  it("returns the same generic message for wrong user and wrong password", async () => {
    const wrongUser = await attemptLogin({ user: "other", password: VALID_PASSWORD });
    const wrongPassword = await attemptLogin({ user: "admin", password: "nope-nope" });

    expect(wrongUser.status).toHaveBeenCalledWith(401);
    expect(wrongPassword.status).toHaveBeenCalledWith(401);
    expect(wrongUser.json.mock.calls[0]).toEqual(wrongPassword.json.mock.calls[0]);
  });

  it("responds 500 without leaking details when comparison fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await attemptLogin({ user: "admin", password: undefined });

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ error: "Internal server error" });
  });
});
