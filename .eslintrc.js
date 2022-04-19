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
    "no-use-before-define": "error",
    "space-before-function-paren": ["error", "never"],
  },
};