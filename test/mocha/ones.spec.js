/* eslint-env mocha */
'use strict';

var expect = require('expect.js');

var nj = require('../../src');

describe('ones', function () {
  it('can generate a vectors', function () {
    expect(nj.ones(0).tolist()).to.eql([]);
    expect(nj.ones(2).tolist()).to.eql([1, 1]);
    expect(nj.ones([2]).tolist()).to.eql([1, 1]);
  });

  it('can generate matrix', function () {
    expect(nj.ones([2, 2]).tolist())
      .to.eql([[1, 1], [1, 1]]);
  });

  it('should accept a dtype', function () {
    expect(nj.ones(0, 'uint8').dtype).to.equal('uint8');
  });
});
