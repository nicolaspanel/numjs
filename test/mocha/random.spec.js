/* eslint-env mocha */
'use strict';

var expect = require('expect.js');

var nj = require('../../src');

describe('random', function () {
  it('can generate vectors', function () {
    expect(nj.random(3).shape).to.eql([3]);
  });

  it('should vectors', function () {
    expect(nj.random(3).shape).to.eql([3]);
  });

  it('can generate matrix', function () {
    expect(nj.random([2, 1]).shape).to.eql([2, 1]);
  });
});
