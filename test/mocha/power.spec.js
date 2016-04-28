/* eslint-env mocha */
'use strict';

var expect = require('expect.js');

var nj = require('../../src');

describe('power', function () {
  it('can pow a vector with a scalar', function () {
    var x = nj.array([-1, 0, 1, 2]);
    var newX = nj.power(x, 2);
    expect(newX.tolist())
      .to.eql([1, 0, 1, 4]);
    expect(newX).not.to.equal(x); // should have create a copy
    expect(x.tolist())
      .to.eql([-1, 0, 1, 2]);
  });
  it('can pow a vector with another vector', function () {
    var x = nj.array([-1, 0, 1, 2]);
    var newX = nj.power(x, x);
    expect(newX.tolist())
      .to.eql([-1, 1, 1, 4]);
    expect(newX).not.to.equal(x); // should have create a copy
  });
  it('can pow a vector with a scalar without crating a copy', function () {
    var x = nj.array([-1, 0, 1, 2]);
    x.pow(2, false);
    expect(x.tolist())
      .to.eql([1, 0, 1, 4]);
  });
  it('can pow a vector with another vector without crating a copy', function () {
    var x = nj.array([-1, 0, 1, 2]);
    x.pow(x, false);
    expect(x.tolist())
      .to.eql([-1, 1, 1, 4]);
  });
});
