/* eslint-env mocha */
'use strict';

var expect = require('expect.js');

var nj = require('../../src');

describe('clip', function () {
  it('should work on vectors', function () {
    var x = nj.array([-1, 0, 1]);
    expect(nj.clip(x, 0, Number.POSITIVE_INFINITY).tolist())
      .to.eql([0, 0, 1]);
    expect(nj.clip(x, Number.NEGATIVE_INFINITY, 0).tolist())
      .to.eql([-1, 0, 0]);
  });
});
