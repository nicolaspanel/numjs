/* eslint-env jasmine */
'use strict';

describe('softmax', function () {
  it('should work on vectors', function () {
    var x = nj.zeros(3);
    var expected = [1 / 3, 1 / 3, 1 / 3];
    expect(nj.softmax(x).tolist())
      .to.eql(expected);
  });

  it('should work on matrix', function () {
    var x = nj.zeros(4).reshape([2, 2]);
    var expected = [[1 / 4, 1 / 4], [1 / 4, 1 / 4]];
    expect(nj.softmax(x).tolist())
      .to.eql(expected);
  });
});
