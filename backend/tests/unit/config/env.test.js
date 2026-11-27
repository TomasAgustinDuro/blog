import { beforeAll, describe, expect, it, vi } from "vitest";

// Evita que dotenv cargue un .env real y haga los tests dependientes del equipo
vi.mock("dotenv/config", () => ({}));

const validEnv = {
  DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
  JWT_SECRET: "secret",
  ADMIN_USER: "admin",
  ADMIN_PASSWORD: "hash",
  CORS_ORIGINS: "http://localhost:5173",
};

let parseEnv;

beforeAll(async () => {
  // El módulo valida process.env al importarse, por eso se simulan las variables
  Object.entries(validEnv).forEach(([key, value]) => vi.stubEnv(key, value));
  ({ parseEnv } = await import("../../../config/env.js"));
});

describe("parseEnv", () => {
  it("returns validated values with defaults applied", () => {
    const result = parseEnv(validEnv);

    expect(result.PORT).toBe(3000);
    expect(result.CORS_ORIGINS).toEqual(["http://localhost:5173"]);
  });

  it("splits and trims several CORS origins", () => {
    const result = parseEnv({
      ...validEnv,
      CORS_ORIGINS: " http://a.test , https://b.test ,",
    });

    expect(result.CORS_ORIGINS).toEqual(["http://a.test", "https://b.test"]);
  });

  it("coerces PORT to a number", () => {
    expect(parseEnv({ ...validEnv, PORT: "4010" }).PORT).toBe(4010);
  });

  it.each(Object.keys(validEnv))("throws a clear error when %s is missing", (key) => {
    const { [key]: removedValue, ...incompleteEnv } = validEnv;

    expect(removedValue).toBeDefined();
    expect(() => parseEnv(incompleteEnv)).toThrow(
      new RegExp(`Invalid environment configuration[\\s\\S]*${key}`)
    );
  });

  it("throws when a variable is an empty string", () => {
    expect(() => parseEnv({ ...validEnv, JWT_SECRET: "" })).toThrow(/JWT_SECRET/);
  });

  it("throws when PORT is not a valid number", () => {
    expect(() => parseEnv({ ...validEnv, PORT: "abc" })).toThrow(/PORT/);
  });
});
