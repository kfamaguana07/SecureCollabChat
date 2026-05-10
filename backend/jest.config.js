module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/tests/**',
    '!src/app.js'       // app.js inicia el servidor, se excluye de cobertura
  ],
  coverageThreshold: {
    global: {
      lines: 70,
      functions: 70,
      branches: 60
    }
  },
  verbose: true
};