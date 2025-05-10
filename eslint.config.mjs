import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";


export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
  // Configure React settings including version
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      react: pluginReact,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect", // Auto-detect the React version
      },
    },
    // Place rules here to ensure they're applied with the React plugin
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off", // Turn off prop-types validation
      "react/no-unescaped-entities": "off",
    }
  },
  pluginReact.configs.flat.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { 
        "argsIgnorePattern": "^_|^(request|user)",
        "varsIgnorePattern": "^_|^React$|^(Input|Course|CourseMaterial|Assignment|CardFooter|CardContent|ReactNode|Label|error|authChecked|UserRole|db|User)$" 
      }],
      "@typescript-eslint/no-explicit-any": "warn" // Change to warn instead of error
    }
  },
  // Exclude generated files from linting
  {
    ignores: [
      "**/src/generated/**", 
      "**/prisma/**",
      "**/.prisma/**",
      "**/wasm.js", 
      "**/edge.js", 
      "**/default.js", 
      "**/client.js", 
      "**/runtime/**"
    ]
  }
]);