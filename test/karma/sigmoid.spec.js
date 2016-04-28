/* eslint-env jasmine */
'use strict';

describe('sigmoid', function () {
  it('should work on vectors', function () {
    var x = nj.array([-100, -1, 0, 1, 100]);
    expect(nj.sigmoid(x).tolist())
      .to.eql([0, 1 / (1 + Math.exp(1)), 0.5, 1 / (1 + Math.exp(-1)), 1]);
  });
});
