import globals from "globals";
import pluginJs from "@eslint/js";
import stylisticJs from "@stylistic/eslint-plugin";

export default [
  {files: ["**/*.js"],
    ignores: ["**/eslint.config.mjs"],
    languageOptions: {sourceType: "script"}},
  {languageOptions: {
    ecmaVersion: 14,
    globals: {
      ...globals.browser,
      ...globals.greasemonkey,
      "wfes": "readonly"
    }
  }
  },
  pluginJs.configs.recommended,
  {plugins: {
    "@stylistic/js": stylisticJs
  }},
  {rules: {
    // errors & suggestions
    "block-scoped-var": "error",
    "curly": "error",
    "dot-notation": "warn",
    "eqeqeq": "error",
    "no-empty-function": "error",
    "no-eq-null": "error",
    "no-lone-blocks": "error",
    "no-lonely-if": "warn",
    // "no-magic-numbers": ["warn", { "ignore": [1] }],
    "no-mixed-operators": "error",
    "no-multi-str": "warn",
    "no-negated-condition": "warn",
    "no-param-reassign": "error",
    "no-self-compare": "error",
    "no-unmodified-loop-condition": "warn",
    "no-unreachable-loop": "warn",
    "no-use-before-define": "error",
    "no-useless-concat": "warn",
    "no-useless-return": "warn",
    "no-var": "error",
    "prefer-const": "warn",
    "prefer-spread": "warn",
    // "prefer-rest-params": "warn",
    "space-before-function-paren": ["error", "never"],
    "spaced-comment": ["warn", "always"],
    "strict": ["error", "function"],
    //      "strict": ["error", "global"],
    //      "strict": ["error", "never"],
    "yoda": ["error", "always", { "onlyEquality": true }],

    // keine Warnung für die init() Funktion
    "no-unused-vars": ["error", { "varsIgnorePattern": "init|ignored" }],

    // Layout
    "@stylistic/js/array-bracket-newline": ["warn", "consistent"],
    "@stylistic/js/brace-style": ["warn", "1tbs", { "allowSingleLine": true }],
    "@stylistic/js/comma-dangle": ["warn", "only-multiline"],
    "@stylistic/js/comma-spacing": ["warn", { "before": false, "after": true }],
    "@/func-call-spacing": ["warn", "never"],
    "@stylistic/js/indent": ["warn", 2, { "SwitchCase": 1 }],
    "@stylistic/js/newline-per-chained-call": "warn",
    "@stylistic/js/no-multi-spaces": "warn",
    "@stylistic/js/no-multiple-empty-lines": ["warn", { "max": 2, "maxEOF": 0 }],
    "@stylistic/js/no-tabs": ["warn", { "allowIndentationTabs": true }],
    "@stylistic/js/no-trailing-spaces": ["warn", { "skipBlankLines": false }],
    "@stylistic/js/no-whitespace-before-property": "error",
    "@stylistic/js/quotes": ["error", "double", { "avoidEscape": true }],
    "@stylistic/js/semi": ["warn", "always"],
    "@stylistic/js/semi-spacing": ["warn", {"before": false, "after": true}],
    "@stylistic/js/semi-style": ["warn", "last"],
    "@stylistic/js/space-before-blocks": "warn",
    "@stylistic/js/switch-colon-spacing": ["error", {"after": true, "before": false}]
  }}
];