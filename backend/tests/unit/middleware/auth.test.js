import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { HttpError } from "../../../lib/httpError.js";
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
  const next = vi.fn();
  await Login.loginUser({ validated: { body } }, response, next);
  return { response, next };
};

describe("Login.loginUser", () => {
  it("returns a signed JWT for valid credentials", async () => {
    const { response, next } = await attemptLogin({ user: "admin", password: VALID_PASSWORD });

    const { token } = response.json.mock.calls[0][0];
    expect(jwt.verify(token, "test-secret").username).toBe("admin");
    expect(next).not.toHaveBeenCalled();
  });

  it("returns the same generic error for wrong user and wrong password", async () => {
    const wrongUser = await attemptLogin({ user: "other", password: VALID_PASSWORD });
    const wrongPassword = await attemptLogin({ user: "admin", password: "nope-nope" });

    const [userError] = wrongUser.next.mock.calls[0];
    const [passwordError] = wrongPassword.next.mock.calls[0];
    expect(userError).toMatchObject({ status: 401, code: "INVALID_CREDENTIALS" });
    expect(passwordError.message).toBe(userError.message);
  });

  it("forwards unexpected errors to the error handler", async () => {
    const { next } = await attemptLogin({ user: "admin", password: undefined });

    const [error] = next.mock.calls[0];
    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(HttpError);
  });
});
