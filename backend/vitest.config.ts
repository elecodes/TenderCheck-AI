import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: {
      TURSO_DB_URL: ":memory:",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "json-summary"],
      exclude: [
        "test/**",
        "**/*.d.ts",
        "**/*.config.*",
        "src/domain/entities/**",
        "src/domain/interfaces/**",
      ],
      thresholds: {
        global: {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
        "src/domain/**": {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
      },
    },
  },
});
