import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

export default tseslint.config(
  {
    ignores: ["dist", "node_modules", "coverage", "**/*.d.ts", "**/*.js", ".dependency-cruiser.cjs"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      prettier: prettierPlugin,
    },
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
    },
    rules: {
      ...prettierConfig.rules,
      "prettier/prettier": "error",
      "no-magic-numbers": "off",
      "@typescript-eslint/no-magic-numbers": "off",
      "complexity": ["warn", 25],
      "max-lines": ["warn", { "max": 400, "skipBlankLines": true, "skipComments": true }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }]
    }
  }
);
