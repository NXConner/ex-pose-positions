/** @type {import('prettier').Config} */
const config = {
  trailingComma: "all",
  printWidth: 100,
  tabWidth: 2,
  singleQuote: false,
  bracketSpacing: true,
  arrowParens: "always",
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindFunctions: ["clsx", "cva"],
  overrides: [
    {
      files: ["*.md"],
      options: {
        proseWrap: "always",
      },
    },
  ],
};

module.exports = config;

