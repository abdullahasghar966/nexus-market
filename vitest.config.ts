import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    // Unit tests use *.test.*; Playwright E2E uses *.spec.* (kept separate).
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next", "e2e/**", "design/**"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
