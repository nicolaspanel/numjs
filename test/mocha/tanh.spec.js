/* eslint-env mocha */
'use strict';

var expect = require('expect.js');

var nj = require('../../src');

describe('tanh', function () {
  it('should work on vectors', function () {
    var x = nj.array([-20, 0, 20]);
    expect(nj.tanh(x).tolist())
      .to.eql([Math.tanh(-20), Math.tanh(0), Math.tanh(20)]);
  });
});
