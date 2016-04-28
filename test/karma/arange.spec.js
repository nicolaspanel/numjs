/* eslint-env jasmine */
/* global nj */
'use strict';

describe('arange', function () {
  it('should work if only stop given', function () {
    var arr = nj.arange(3);
    expect(arr.tolist()).to.eql([0, 1, 2]);
    expect(arr.shape).to.eql([3]);
  });
  it('should work if both start and stop are given', function () {
    var arr = nj.arange(3, 7);
    expect(arr.tolist()).to.eql([3, 4, 5, 6]);
    expect(arr.shape).to.eql([4]);
  });
  it('should work if start, stop and step are given', function () {
    var arr = nj.arange(3, 7, 2);
    expect(arr.tolist()).to.eql([3, 5]);
    expect(arr.shape).to.eql([2]);
  });

  it('should accept a dtype', function () {
    expect(nj.arange(3, 'uint8').dtype).to.equal('uint8');
    expect(nj.arange(0, 3, 'uint8').dtype).to.equal('uint8');
    expect(nj.arange(0, 3, 1, 'uint8').dtype).to.equal('uint8');
  });
});
