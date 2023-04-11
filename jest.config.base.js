module.exports = {
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
};
