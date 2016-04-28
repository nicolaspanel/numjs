/* eslint-env jasmine */
'use strict';

describe('cos', function () {
  it('should work on vectors', function () {
    var x = nj.array([0, Math.PI / 2, Math.PI]);
    expect(nj.cos(x).tolist())
      .to.eql([1, 6.123233995736766e-17, -1]);
  });
});
