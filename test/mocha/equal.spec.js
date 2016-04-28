/* eslint-env mocha */
'use strict';

var expect = require('expect.js');

var nj = require('../../src');

describe('equal', function () {
  it('should be true if all items are the same', function () {
    var arr = nj.arange(3);
    expect(nj.equal(arr, [0, 1, 2])).to.equal(true);
    expect(nj.equal(arr.reshape(3, 1), arr.reshape(3, 1))).to.equal(true);
  });
  it('should be false if arrays do not have the same shape', function () {
    var arr = nj.arange(3);
    expect(nj.equal(arr, [0, 1])).to.equal(false);
    expect(nj.equal(arr, arr.reshape(3, 1))).to.equal(false);
    expect(nj.equal(arr, arr.reshape(1, 3))).to.equal(false);
    expect(nj.equal(arr.reshape(1, 3), arr.reshape(3, 1))).to.equal(false);
  });
});
