/* eslint-env jasmine */
'use strict';

describe('shape', function () {
  it('should be readable', function () {
    expect(nj.arange(3).shape)
      .to.eql([3]);
  });
  it('should not be writableable', function () {
    expect(function () { nj.arange(4).shape = [2, 2]; }).to.throw();
  });

  it('should be correct if array empty', function () {
    expect(nj.array([]).shape)
      .to.eql([0]);
  });
  it('should be correct if array is a vector', function () {
    expect(nj.array([0, 1, 2]).shape)
      .to.eql([3]);
  });
  it('should be correct if array is a matrix', function () {
    expect(nj.array([[0, 1], [2, 3]]).shape)
      .to.eql([2, 2]);
  });
  it('should be correct if array is a 3d array', function () {
    expect(nj.array([[[0], [1]],
      [[2], [3]]]).shape)
      .to.eql([2, 2, 1]);
  });
});
