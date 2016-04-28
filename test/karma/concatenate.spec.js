/* eslint-env jasmine */
'use strict';

describe('concat', function () {
  describe('with numbers', function () {
    var c;
    beforeEach(function () {
      c = nj.concatenate([1, 0]);
    });
    it('should produce a vector', function () {
      expect(c.tolist()).to.eql([1, 0]);
    });
  });

  it('can concatenate 2 vectors', function () {
    expect(nj.concatenate([[0], [1]]).tolist())
      .to.eql([0, 1]);
    expect(nj.concatenate([[0], [1, 2, 3]]).tolist())
      .to.eql([0, 1, 2, 3]);
    expect(nj.concatenate([[0], [1, 2, 3], [4]]).tolist())
      .to.eql([0, 1, 2, 3, 4]);
  });
  it('should raise an error when trying to concat array with different dims', function () {
    var a = nj.arange(12).reshape([4, 3]);
    var b = nj.arange(4).add(1);
    expect(function () {
      nj.concatenate([a, b]);
    }).to.throw();
  });
  it('should concatenate multidimensional arrays along the last axis', function () {
    var a = nj.arange(12).reshape([4, 3]);
    var b = nj.arange(4).add(1).reshape([4, 1]);
    var c = nj.arange(4 * 3 * 2).reshape([4, 3, 2]); // (4,3,2)

    expect(nj.concatenate([a, b]).tolist())
      .to.eql([
      [0, 1, 2, 1],
      [3, 4, 5, 2],
      [6, 7, 8, 3],
      [9, 10, 11, 4]]);
    expect(nj.concatenate([b, a]).tolist())
      .to.eql([
      [1, 0, 1, 2],
      [2, 3, 4, 5],
      [3, 6, 7, 8],
      [4, 9, 10, 11]]);
    expect(nj.concatenate([b, b]).tolist())
      .to.eql([
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4]]);
    expect(nj.concatenate([a, a]).tolist())
      .to.eql([
      [0, 1, 2, 0, 1, 2],
      [3, 4, 5, 3, 4, 5],
      [6, 7, 8, 6, 7, 8],
      [9, 10, 11, 9, 10, 11]]);
    expect(nj.concatenate([c, c]).tolist())
      .to.eql([
      [[0, 1, 0, 1],
        [2, 3, 2, 3],
        [4, 5, 4, 5]],
      [[6, 7, 6, 7],
        [8, 9, 8, 9],
        [10, 11, 10, 11]],
      [[12, 13, 12, 13],
        [14, 15, 14, 15],
        [16, 17, 16, 17]],
      [[18, 19, 18, 19],
        [20, 21, 20, 21],
        [22, 23, 22, 23]]]);
    expect(nj.concatenate([a.reshape([4, 3, 1]), c]).tolist())
      .to.eql([
      [[0, 0, 1],
        [1, 2, 3],
        [2, 4, 5]],
      [[3, 6, 7],
        [4, 8, 9],
        [5, 10, 11]],
      [[6, 12, 13],
        [7, 14, 15],
        [8, 16, 17]],
      [[9, 18, 19],
        [10, 20, 21],
        [11, 22, 23]]]);
  });
});
