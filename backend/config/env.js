import "dotenv/config";
import { z } from "zod";

const requiredString = (description = "is required") =>
  z.string({ error: description }).min(1, description);

/**
 * Variables de entorno requeridas por el backend.
 *
 * Se valida todo al arrancar para fallar rápido con un mensaje claro en vez
 * de romper en runtime. Este módulo también carga el archivo .env, por lo que
 * debe importarse antes que cualquier módulo que lea process.env.
 */
const envSchema = z.object({
  DATABASE_URL: requiredString(),
  JWT_SECRET: requiredString(),
  ADMIN_USER: requiredString(),
  ADMIN_PASSWORD: requiredString(),
  PORT: z.coerce.number().int().positive().default(3000),
  // Lista de orígenes permitidos por CORS, separados por coma
  CORS_ORIGINS: requiredString(
    "is required (comma separated list of allowed origins)"
  ).transform((rawOrigins) =>
    rawOrigins
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  ),
});

/**
 * Valida y normaliza un objeto de variables de entorno.
 *
 * @param {Record<string, string | undefined>} rawEnv - Variables a validar.
 * @returns {z.infer<typeof envSchema>} Variables validadas y tipadas.
 * @throws {Error} Si falta alguna variable o tiene un formato inválido.
 */
export const parseEnv = (rawEnv) => {
  const result = envSchema.safeParse(rawEnv);

  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${problems}`);
  }

  return result.data;
};

export const env = parseEnv(process.env);
