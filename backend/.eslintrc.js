module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2021: true,
    jest: true
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2021
  },
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-underscore-dangle': 'off',
    'consistent-return': 'off',
    'no-param-reassign': 'off'
  }
};
