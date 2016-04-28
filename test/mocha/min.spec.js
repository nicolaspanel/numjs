/* eslint-env mocha */
'use strict';

var expect = require('expect.js');

var nj = require('../../src');

describe('min', function () {
  it('should be null for an empty array', function () {
    var arr = nj.array([]);
    expect(arr.min()).to.equal(null);
  });
  it('should return the min element in array', function () {
    var arr = nj.arange(10);
    expect(arr.min()).to.equal(0);
  });
});
