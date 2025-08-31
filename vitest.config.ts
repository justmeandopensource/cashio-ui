import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'url';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./test/setupTests.ts",
    include: ["**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "./test/coverage",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/App.tsx", "src/main.tsx", "src/components/Theme.tsx"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "./src"),
      "@components": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "./src/components"),
      "@features": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "./src/features"),
      "@test": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "./test"),
    },
  },
});
