/* eslint-env jasmine */
'use strict';

describe('ndim', function () {
  it('should be readable', function () {
    var a = nj.arange(15);
    expect(a.ndim).to.equal(1);
    expect(a.reshape(3, 5).ndim).to.equal(2);
  });
});
