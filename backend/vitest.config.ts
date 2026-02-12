import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: {
      TURSO_DB_URL: ":memory:",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "test/**", 
        "**/*.d.ts", 
        "**/*.config.*",
        "src/domain/entities/**",
        "src/domain/interfaces/**"
      ],
      thresholds: {
        global: {
          statements: 60,
          branches: 60,
          functions: 60,
          lines: 60,
        },
        "src/domain/**": {
          statements: 60,
          branches: 60,
          functions: 60,
          lines: 60,
        },
      },
    },
  },
});
