/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      },
      include: ['src/**/*.ts'],
      exclude: ['src/domain/entities/*.ts', 'src/domain/interfaces/*.ts'] // Interfaces don't have runtime code
    },
    globals: true,
  },
});
