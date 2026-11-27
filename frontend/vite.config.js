import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// Sin estas variables el build saldría roto (API inaccesible, tarjetas Open
// Graph con URLs inválidas), por eso se valida antes de arrancar.
const REQUIRED_ENV_VARS = ["VITE_API_URL", "VITE_SITE_URL"];

/**
 * Falla con un mensaje claro si falta alguna variable de entorno requerida.
 *
 * @param {Record<string, string>} env - Variables cargadas por Vite.
 * @throws {Error} Si falta alguna variable.
 */
const assertRequiredEnv = (env) => {
  const missingVars = REQUIRED_ENV_VARS.filter((name) => !env[name]);
  if (missingVars.length > 0) {
    throw new Error(
      `Faltan variables de entorno: ${missingVars.join(", ")}. Ver "Setup local" en el README.`
    );
  }
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // loadEnv lee los .env y también process.env (Vercel y CI)
  assertRequiredEnv(loadEnv(mode, process.cwd(), "VITE_"));

  return {
    plugins: [react()],
  };
});
