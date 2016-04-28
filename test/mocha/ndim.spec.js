/* eslint-env mocha */
'use strict';

var expect = require('expect.js');

var nj = require('../../src');

describe('ndim', function () {
  it('should be readable', function () {
    var a = nj.arange(15);
    expect(a.ndim).to.equal(1);
    expect(a.reshape(3, 5).ndim).to.equal(2);
  });
});
