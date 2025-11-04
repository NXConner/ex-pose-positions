module.exports = {
  extends: ["stylelint-config-standard", "stylelint-config-standard-scss"],
  ignoreFiles: [
    "**/*.js",
    "**/*.ts",
    "**/*.tsx",
    "**/*.md",
    "node_modules/**",
    "dist/**",
  ],
  rules: {
    "color-hex-case": "lower",
    "color-hex-length": "short",
    "string-quotes": "double",
    "selector-max-id": 0,
    "selector-max-universal": 0,
    "declaration-block-no-redundant-longhand-properties": true,
    "property-no-vendor-prefix": true,
    "value-no-vendor-prefix": true,
    "scss/at-import-partial-extension": "never",
  },
};

