const { assert }   = require('chai'),
      helpers     = require('../../helpers/helpers.js'),
      expected     = require('../expected/helpers.json'),
      fixtures     = require('../fixtures/helpers.json');

describe('Helpers', () => {

  describe('sortAlphabetically', () => {
    it('sorts alphabetically (A-Z) based on title key', () => {
      const result = fixtures.az.sort(helpers.sortAlphabetically);
      return assert.deepEqual(result, expected.az);
    });
  });

});
