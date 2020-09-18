module.exports = {
  verbose: true,
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      tsConfig: './tsconfig.json',
    },
  },
  roots: ['<rootDir>/src'],
  testMatch: ['**/+(*.)*(spec).ts'],
  verbose: true,
};
