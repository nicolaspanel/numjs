/* eslint-env jasmine */
/* global nj */
'use strict';

describe('arccos', function () {
  it('should work on vectors', function () {
    var x = nj.array([-1, 0, 1]);
    expect(nj.arccos(x).tolist())
      .to.eql([ Math.PI, Math.PI / 2, 0 ]);
  });
});
