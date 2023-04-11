const { transform, testMatch, globals, preset } = require('./jest.typetests-config.base');

module.exports = {
  globals,
  preset,
  transform,
  testMatch,
  projects: ['<rootDir>/packages/*/jest.typetests-config.js'],
};
