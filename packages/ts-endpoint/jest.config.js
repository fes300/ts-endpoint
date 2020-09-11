module.exports = {
  verbose: true,
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      tsConfig: './tsconfig.json',
    },
  },
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/+(*.)*(spec|typespec).ts'],
  transform: { '/.+typespec\\.ts$': 'dts-jest/transform' },
};
