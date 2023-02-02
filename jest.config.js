module.exports = {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  moduleFileExtensions: ['ts', 'js'],

  testPathIgnorePatterns: ['/.yalc/', '/data/', '/utils', '/dist'],

  testEnvironment: 'node',

  transformIgnorePatterns: ['<rootDir>/node_modules/(?!@assemblyscript/.*)', 'node_modules'],

  transform: {
    '^.+\\.(ts|js)$': 'ts-jest',
  },
};
