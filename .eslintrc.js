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
    
    /*
     * 'no-duplicate-imports': 'off', 'no-invalid-this': 'off', 'no-loop-func':
     * 'off', 'no-loss-of-precision': 'off', 'no-redeclare': 'off', 'no-shadow':
     * 'off', 'no-throw-literal': 'off', 'no-unused-expressions': 'off',
     * 'no-return-await': 'off',
     * 
     */
  },
};