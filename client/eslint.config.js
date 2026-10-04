import {defineConfig} from "eslint/config";
import js from "@eslint/js";

import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

import stylistic from "@stylistic/eslint-plugin";
import cssModules from "eslint-plugin-css-modules-next";

import customSemi from "@ditpowuh/eslint-stylistic-semi";

export default defineConfig([
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat["recommended-latest"],
      reactRefresh.configs.vite
    ],
    plugins: {
      "stylistic": stylistic,
      "css-modules-next": cssModules,
      "custom-semi": customSemi
    },
    rules: {
      "stylistic/comma-dangle": "warn",
      "stylistic/jsx-pascal-case": "warn",
      "stylistic/array-bracket-spacing": "warn",
      "stylistic/arrow-spacing": "warn",
      "stylistic/jsx-equals-spacing": "warn",
      "stylistic/no-extra-semi": "warn",
      "css-modules-next/no-unused-class": "warn",
      "css-modules-next/no-undefined-class": "warn",
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "off",
      "@next/next/no-img-element": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", {
        "argsIgnorePattern": "^_$",
        "varsIgnorePattern": "^_$",
        "caughtErrorsIgnorePattern": "^_$"
      }],
      "custom-semi/semi": ["warn", "always"]
    }
  }
]);
