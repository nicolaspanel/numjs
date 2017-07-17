/* eslint-env jasmine */
'use strict';

describe('log', function () {
  it('should work on scalars', function () {
    expect(nj.log(1).tolist())
      .to.eql([0]);
  });
  it('should work on vectors', function () {
    var x = nj.arange(3);
    expect(nj.log(nj.exp(x)).tolist())
      .to.eql(x.tolist());
  });
});
