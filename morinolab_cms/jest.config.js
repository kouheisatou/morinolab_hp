module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  moduleNameMapper: {
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@app/(.*)$': '<rootDir>/src/application/$1',
    '^@infra/(.*)$': '<rootDir>/src/infrastructure/$1',
  },
}; 