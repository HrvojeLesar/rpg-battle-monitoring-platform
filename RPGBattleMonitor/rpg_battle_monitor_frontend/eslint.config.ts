import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";
import reactHooks from "eslint-plugin-react-hooks";

export default defineConfig([
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
        plugins: { js },
        extends: ["js/recommended"],
        languageOptions: { globals: globals.browser },
    },
    tseslint.configs.recommended,
    pluginReact.configs.flat.recommended,
    {
        // run after the react recommended config to override it
        files: ["**/*.{jsx,tsx,js,ts}"],
        rules: {
            "react/react-in-jsx-scope": "off",
        },
    },
    {
        files: ["src/**/*.{js,jsx,ts,tsx}"],
        plugins: {
            "reactHooks": reactHooks,
        },
        extends: ["reactHooks/recommended-latest"],
    },
]);
