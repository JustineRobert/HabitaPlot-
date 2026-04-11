module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.js'],
  testMatch: ['**/?(*.)+(spec|test).js'],
  moduleFileExtensions: ['js', 'json', 'node'],
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/fixtures/'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 75,
      statements: 75
    }
  }
};
