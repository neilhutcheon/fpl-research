import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api/fpl": {
        target: "https://fantasy.premierleague.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fpl/, "/api"),
        headers: {
          "User-Agent": "Mozilla/5.0 FPL-Research-Desk",
        },
      },
      "/api/draft": {
        target: "https://draft.premierleague.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/draft/, "/api"),
        headers: {
          "User-Agent": "Mozilla/5.0 FPL-Research-Desk",
        },
      },
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"],
  },
});
