module.exports = [
  {
    files: ['assets/js/frontend/**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        jQuery: 'readonly',
        $: 'readonly',
        wp: 'readonly',
        MLB: 'readonly',
        cqb_params: 'readonly',
        window: 'readonly',
        document: 'readonly',
      },
    },
    plugins: {},
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
      'no-undef': 'error',
      'semi': ['error', 'always'],
      'quotes': ['error', 'single', { avoidEscape: true }]
    }
  }
];
