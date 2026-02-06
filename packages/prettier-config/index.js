/** @type {import("prettier").Config} */
const config = {
  trailingComma: 'all',
  singleQuote: true,
  tailwindPreserveWhitespace: false,
  tailwindPreserveDuplicates: true,
  plugins: ['prettier-plugin-tailwindcss'],
};

module.exports = config;
