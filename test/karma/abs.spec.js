/* eslint-env jasmine */
'use strict';

describe('abs', function () {
  it('should work on vectors', function () {
    var x = nj.array([-1, 0, 1]);
    expect(nj.abs(x).tolist())
      .to.eql([1, 0, 1]);
  });
});
