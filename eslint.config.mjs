import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import importPlugin from "eslint-plugin-import";
import tseslint from "typescript-eslint";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
    "playwright-report/**",
    "test-results/**",
    ".claude/**",
    "coverage/**",
    "public/**",
    "**/*.spec.ts",
    "**/*.spec.tsx",
    "**/*.test.ts",
    "**/*.test.tsx",
    "tests/**",
    "e2e/**",
  ]),
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      import: importPlugin,
      "@typescript-eslint": tseslint.plugin,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // ── Lines / length ─────────────────────────────────────────────────────
      "max-lines": [
        "error",
        { max: 200, skipBlankLines: true, skipComments: true },
      ],
      "max-len": ["error", { code: 160 }],

      // ── Formatting ──────────────────────────────────────────────────────────
      "no-console": ["error", { allow: ["warn", "error"] }],
      "max-depth": ["error", 3],
      "eol-last": ["error", "always"],
      "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 0, maxBOF: 0 }],
      "quotes": ["error", "single", { avoidEscape: true }],
      "indent": ["error", 2, { SwitchCase: 1 }],

      // ── Naming: ban single-letter variables ─────────────────────────────────
      "id-length": [
        "error",
        {
          min: 2,
          // i/j: loop counters, e: event, _: intentional discard
          exceptions: ["_", "i", "j", "e"],
          properties: "never",
        },
      ],

      // ── Imports ─────────────────────────────────────────────────────────────
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling", "index"],
            "object",
            "type",
          ],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
          pathGroups: [
            { pattern: "@/**", group: "internal", position: "after" },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
        },
      ],

      // ── React: 1 file = 1 component ─────────────────────────────────────────
      "react/no-multi-comp": ["error", { ignoreStateless: false }],

      // ── TypeScript: strict non-type-aware rules ──────────────────────────────
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-unused-expressions": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/array-type": ["error", { default: "array-simple" }],

      // ── TypeScript: type-aware rules (requires parserOptions.project) ────────
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        { allowNumber: true, allowBoolean: false, allowNullish: false },
      ],
    },
  },
  {
    files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}", "tests/**", "e2e/**"],
    rules: {
      "max-lines": "off",
      "max-len": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
    },
  },
  {
    files: ["**/mongo.{ts,tsx}", "**/redis.{ts,tsx}", "**/catch-async.{ts,tsx}", "src/proxy.ts"],
    rules: {
      "no-console": "off",
    },
  },
  {
    files: ["src/shared/components/**/*.{ts,tsx}"],
    rules: {
      "react/no-multi-comp": "off",
    },
  },
  {
    // shadcn/ui primitives are generated (`npx shadcn add`): long class strings and
    // multi-part component files are expected there. Do not hand-write app code here.
    files: ["src/shared/components/ui/**/*.{ts,tsx}"],
    rules: {
      "max-len": "off",
      "max-lines": "off",
    },
  },
]);

export default eslintConfig;
