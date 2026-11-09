import js from '@eslint/js';
import globals from 'globals';
export default [
  { ignores: ['**/node_modules/**', '**/dist/**'] },
  js.configs.recommended,
  { files: ['client/src/**/*.{js,jsx}', 'client/*.js'], languageOptions: { globals: { ...globals.browser, ...globals.node }, parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } } }, rules: { 'no-unused-vars': 'off' } },
  { files: ['server/**/*.js', '*.js'], languageOptions: { globals: { ...globals.node } } }
];
