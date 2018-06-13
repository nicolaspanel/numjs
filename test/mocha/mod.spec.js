/* eslint-env mocha */
'use strict';

const expect = require('expect.js');

const nj = require('../../src');

describe('mod', function () {
  [{
    x1: [4, 7],
    x2: [2, 3],
    expected: [0, 1],
  }, {
    x1: nj.arange(7),
    x2: 5,
    expected: [0, 1, 2, 3, 4, 0, 1],
  }].forEach(function (test) {
    it(`should compute (${nj.array(test.x1)} % ${nj.array(test.x1)}) => ${nj.array(test.expected)}`, function () {
      expect(nj.mod(test.x1, test.x2).tolist()).to.eql(test.expected);
    });
  });
});
