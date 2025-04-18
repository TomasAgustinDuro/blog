// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: ['sequelize', 'wkx'], // Excluye estas dependencias del bundle del frontend
    },
  },
});
