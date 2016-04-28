/* eslint-env jasmine */
'use strict';

describe('exp', function () {
  it('should work on scalars', function () {
    expect(nj.exp(0).tolist())
      .to.eql([1]);
  });
  it('should work on vectors', function () {
    var x = nj.arange(3);
    expect(nj.exp(x).tolist())
      .to.eql([1, Math.exp(1), Math.exp(2)]);
  });
});
