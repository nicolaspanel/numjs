/* eslint-env mocha */
'use strict';

var expect = require('expect.js');

var nj = require('../../src');

describe('zeros', function () {
  it('can generate a vectors', function () {
    expect(nj.zeros(0).tolist()).to.eql([]);
    expect(nj.zeros(2).tolist()).to.eql([0, 0]);
    expect(nj.zeros([2]).tolist()).to.eql([0, 0]);
  });

  it('can generate matrix', function () {
    expect(nj.zeros([2, 2]).tolist())
      .to.eql([
      [0, 0],
      [0, 0]]);
  });

  it('should accept a dtype', function () {
    expect(nj.zeros(0, 'uint8').dtype).to.equal('uint8');
  });
});
