/* eslint-env mocha */
'use strict';

var expect = require('expect.js');

var nj = require('../../src');

describe('divide', function () {
  it('can divide a vector with a scalar and create a new copy', function () {
    var x = nj.arange(3);
    var scalar = 2;
    var newX = x.divide(scalar);
    expect(newX).not.to.equal(x);
    expect(newX.tolist())
      .to.eql([0, 0.5, 1]);
  });
  it('can divide a vector with a scalar without creating a copy', function () {
    var x = nj.arange(3);
    var scalar = 2;
    var newX = x.divide(scalar, false);
    expect(newX).to.equal(x);
    expect(newX.tolist())
      .to.eql([0, 0.5, 1]);
  });
  it('can divide two vectors', function () {
    var v = nj.ones([3]);
    expect(v.divide(v).tolist())
      .to.eql(v.tolist());
  });
  it('can divide two matrix with the same shape', function () {
    var m = nj.ones(6).reshape([3, 2]);
    expect(m.divide(m).tolist())
      .to.eql(m.tolist());
  });
  it('should throw an error when dividing an array with a vector', function () {
    expect(function () {
      var x1 = nj.arange(9).reshape(3, 3);
      var x2 = nj.arange(3);
      nj.divide(x1, x2);
    }).to.throwException();
  });
});
