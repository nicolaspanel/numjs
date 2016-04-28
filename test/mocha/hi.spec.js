/* eslint-env mocha */
'use strict';

var expect = require('expect.js');

var nj = require('../../src');

describe('hi', function () {
  it('should truncates from the bottom-right of the array', function () {
    expect(nj.arange(4 * 4).reshape([4, 4]).hi(2, 2).tolist())
      .to.eql([
      [0, 1],
      [4, 5]]);
  });
});
