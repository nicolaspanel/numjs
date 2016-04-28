/* eslint-env mocha */
'use strict';

var expect = require('expect.js');

var nj = require('../../src');

describe('round', function () {
  it('should work on vectors', function () {
    var x = nj.arange(6).divide(5);
    expect(nj.round(x).tolist())
      .to.eql([ 0, 0, 0, 1, 1, 1 ]);
  });
});
