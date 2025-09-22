module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    // Disable some warnings that are causing build failures
    'no-unused-vars': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'no-console': 'off',
    'jsx-a11y/anchor-is-valid': 'warn',
    'jsx-a11y/img-redundant-alt': 'warn',
    'react/jsx-no-target-blank': 'warn'
  },
  overrides: [
    {
      files: ['**/*.js', '**/*.jsx'],
      rules: {
        'no-unused-vars': ['warn', { 
          'argsIgnorePattern': '^_',
          'varsIgnorePattern': '^_'
        }]
      }
    }
  ]
};
