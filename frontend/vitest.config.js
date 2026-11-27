import { defineConfig } from "vitest/config";

// Config propia para que los tests no dependan de las variables que exige vite.config.js
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"],
    clearMocks: true,
    restoreMocks: true,
    unstubGlobals: true,
    unstubEnvs: true,
  },
});
