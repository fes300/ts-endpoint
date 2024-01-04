const base = require('../../jest.config.base.js');

module.exports = {
  ...base,
  testEnvironment: 'jsdom',
  displayName: 'ts-endpoint-react-query',
};
