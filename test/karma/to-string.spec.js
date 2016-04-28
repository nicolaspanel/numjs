/* eslint-env jasmine */
'use strict';

describe('toString', function () {
  it('should properly format 1d array', function () {
    expect(nj.array([0, 1, 2]).toString())
      .to.eql('array([ 0, 1, 2])');
  });
  it('should properly format 2d array', function () {
    var arr = nj.arange(12).reshape(4, 3);
    expect(arr.toString())
      .to.eql('' +
      'array([[  0,  1,  2],\n' +
      '       [  3,  4,  5],\n' +
      '       [  6,  7,  8],\n' +
      '       [  9, 10, 11]])' +
      '');
  });
  it('should properly format 3d arrays', function () {
    var a0 = nj.arange(12).reshape(1, 4, 3);
    expect(a0.toString())
      .to.eql('' +
      'array([[[  0,  1,  2],\n' +
      '        [  3,  4,  5],\n' +
      '        [  6,  7,  8],\n' +
      '        [  9, 10, 11]]])' +
      '');
    expect(nj.arange(18).reshape(3, 3, 2).toString())
      .to.eql('' +
      '' +
      'array([[[  0,  1],\n' +
      '        [  2,  3],\n' +
      '        [  4,  5]],\n' +
      '       [[  6,  7],\n' +
      '        [  8,  9],\n' +
      '        [ 10, 11]],\n' +
      '       [[ 12, 13],\n' +
      '        [ 14, 15],\n' +
      '        [ 16, 17]]])' +
      '');
  });
  it('should properly format typed array', function () {
    expect(nj.uint8([0, 1, 2]).toString())
      .to.eql('array([ 0, 1, 2], dtype=uint8)');
  });
  it('should hide some data if it is too big', function () {
    expect(nj.arange(100).toString())
      .to.eql('array([  0,  1,  2, ..., 97, 98, 99])');
    expect(nj.arange(100).reshape(10, 10).toString())
      .to.eql('' +
      'array([[  0,  1,  2, ...,  7,  8,  9],\n' +
      '       [ 10, 11, 12, ..., 17, 18, 19],\n' +
      '       [ 20, 21, 22, ..., 27, 28, 29],\n' +
      '        ...\n' +
      '       [ 70, 71, 72, ..., 77, 78, 79],\n' +
      '       [ 80, 81, 82, ..., 87, 88, 89],\n' +
      '       [ 90, 91, 92, ..., 97, 98, 99]])');
  });
  describe('with custom printThreshold', function () {
    var def;
    beforeEach(function () {
      def = nj.config.printThreshold;
      nj.config.printThreshold = 5;
    });
    afterEach(function () {
      nj.config.printThreshold = def;
    });
    it('should give less information', function () {
      expect(nj.arange(100).toString())
        .to.eql('array([  0,  1, ..., 98, 99])');
      expect(nj.arange(100).reshape(10, 10).toString())
        .to.eql('' +
        'array([[  0,  1, ...,  8,  9],\n' +
        '       [ 10, 11, ..., 18, 19],\n' +
        '        ...\n' +
        '       [ 80, 81, ..., 88, 89],\n' +
        '       [ 90, 91, ..., 98, 99]])');
    });
  });
});
