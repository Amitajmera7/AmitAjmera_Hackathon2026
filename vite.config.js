import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Same-origin /api in dev → avoids CORS on POST /api/transcribe (GET /health in the address bar does not prove CORS works for the SPA).
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
    },
  },
});
