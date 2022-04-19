module.exports = {
  env: {
    browser: true,
    es6: true,
    greasemonkey: true
  },
  extends: [
    "eslint:recommended",
  ],
  rules: {
    // General
    // 'no-console': 'off',
    "no-use-before-define": "error",
    "space-before-function-paren": ["error", "never"],
    // ab hier wieder noch fixen
    "no-mixed-spaces-and-tabs": "off",
    "no-useless-escape": "warn"
    // "no-mixed-spaces-and-tabs": ["error","smart-tabs"]
  },
};