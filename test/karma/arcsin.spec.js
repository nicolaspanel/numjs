/* eslint-env jasmine */
'use strict';

describe('arcsin', function () {
  it('should work on vectors', function () {
    var x = nj.array([-1, 0, 1]);
    expect(nj.arcsin(x).tolist())
      .to.eql([ -Math.PI / 2, 0, Math.PI / 2 ]);
  });
});
