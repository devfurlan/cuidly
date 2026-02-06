import baseConfig from "@cuidly/eslint-config";
import { globalIgnores } from "eslint/config";

/** @type {import('eslint').Linter.Config[]} */
const config = [
  ...baseConfig,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
];

export default config;
