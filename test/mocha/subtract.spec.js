/* eslint-env mocha */
'use strict';

var expect = require('expect.js');

var nj = require('../../src');

describe('subtract', function () {
  var v, m;
  beforeEach(function () {
    v = nj.arange(3);
    m = nj.arange(3 * 2).reshape([3, 2]);
  });
  it('can subtract a scalar to a vector and create a new copy', function () {
    var newV = nj.subtract(v, 1);
    expect(newV).not.to.equal(v); // should have create a copy
    expect(newV.tolist())
      .to.eql([-1, 0, 1]);
  });
  it('can subtract a scalar to a vector without crating a copy', function () {
    var newV = v.subtract(1, false);
    expect(newV).to.equal(v); // should NOT have create a copy
    expect(v.tolist())
      .to.eql([-1, 0, 1]);
  });

  it('can sum 2 vector', function () {
    var newV = v.subtract(v);
    expect(newV).not.to.equal(v); // should have create a copy
    expect(newV.tolist())
      .to.eql([0, 0, 0]);
  });
  it('can subtract a scalar to a matrix', function () {
    var newMatrix = m.subtract(1);
    expect(newMatrix).not.to.equal(m); // should have create a copy
    expect(newMatrix.tolist())
      .to.eql([[-1, 0], [1, 2], [3, 4]]);
  });
  it('can subtract 2 matrix', function () {
    var newV = m.subtract(m);
    expect(newV).not.to.equal(m); // should have create a copy
    expect(newV.tolist())
      .to.eql([[0, 0], [0, 0], [0, 0]]);
  });
});
