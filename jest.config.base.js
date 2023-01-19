module.exports = {
  verbose: true,
  preset: 'ts-jest',
  transform: {
    '^.+\\.ts?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
        isolatesModules: true,
      },
    ],
  },
  roots: ['<rootDir>/src'],
  testMatch: ['**/+(*.)*(spec).ts'],
  verbose: true,
};
