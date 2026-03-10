import js from "@eslint/js";
import globals from "globals";
import nodePlugin from "eslint-plugin-node";

export default [
  js.configs.recommended,
  {
    plugins: {
      node: nodePlugin,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.es2021
      }
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-console": "off",
    }
  }
];
