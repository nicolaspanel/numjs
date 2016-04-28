/* eslint-env mocha */
'use strict';

var expect = require('expect.js');

var nj = require('../../src');

describe('fft', function () {
  it('should work on vectors', function () {
    var C = nj.random([10, 2]);
    var fft = nj.fft(C);
    var ifft = nj.ifft(fft);
    expect(ifft.multiply(10000).round().tolist())
      .to.eql(C.multiply(10000).round().tolist());
  });
});
