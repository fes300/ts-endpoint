module.exports = {
  verbose: true,
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      tsConfig: './tsconfig.json',
    },
  },
  roots: ['<rootDir>/src'],
  transform: { '^.+typespec\\.ts$': 'dts-jest/transform' },
  testMatch: ['**/+(*.)*(typespec).ts'],
};
