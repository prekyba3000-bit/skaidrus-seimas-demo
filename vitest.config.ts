import { defineConfig } from "vitest/config";
import path from "path";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@shared": path.resolve(__dirname, "./shared"),
      "@server": path.resolve(__dirname, "./server"),
    },
  },
  css: {
    // Disable CSS processing in tests to avoid PostCSS issues
    modules: {
      classNameStrategy: "non-scoped",
    },
  },
  test: {
    globals: true,
    environment: "jsdom", // Changed from "node" to support React components
    setupFiles: ["./vitest.setup.ts"],
    // Exclude PostCSS config from test environment
    exclude: ["**/node_modules/**", "**/dist/**", "**/e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      all: true,
      include: ["server/**/*.ts", "scripts/**/*.ts", "client/src/**/*.{ts,tsx}"],
      exclude: [
        "server/__tests__/**",
        "scripts/__tests__/**",
        "client/src/**/*.test.{ts,tsx}",
        "client/src/**/*.spec.{ts,tsx}",
        "**/*.test.ts",
        "**/*.spec.ts",
        "**/node_modules/**",
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 85,
        statements: 90,
      },
    },
    testTimeout: 5000,
  },
});
