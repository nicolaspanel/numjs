/* eslint-env mocha */
'use strict';

var expect = require('expect.js');

var nj = require('../../src');

describe('lo', function () {
  it('should creates a shifted view of the array', function () {
    expect(nj.arange(4 * 4).reshape([4, 4]).lo(2, 2).tolist())
      .to.eql([
      [10, 11],
      [14, 15]]);
  });
});
