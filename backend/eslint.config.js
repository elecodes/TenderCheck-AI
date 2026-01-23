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
      "@typescript-eslint/no-magic-numbers": [
        "error",
        {
          "ignore": [-1, 0, 1, 2, 100, 200, 201, 400, 401, 403, 404, 500],
          "ignoreEnums": true,
          "ignoreReadonlyClassProperties": true
        }
      ],
      "complexity": ["error", 20],
      "max-lines": ["error", { "max": 300, "skipBlankLines": true, "skipComments": true }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }]
    }
  }
);
