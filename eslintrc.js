// .eslintrc.js
module.exports = {
    env: {
      browser: true,
      es2021: true,
    },
    extends: [
      'eslint:recommended',
      'react-app',
      'react-app/jest',
    ],
    globals: {
      Spotify: 'readonly',  // Define Spotify as a global variable
    },
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      ecmaVersion: 12,
      sourceType: 'module',
    },
    plugins: [
      'react',
    ],
    rules: {
      // Your rules here
    },
  };
  