/* eslint-env jasmine */
'use strict';

describe('arctan', function () {
  it('should work on vectors', function () {
    var x = nj.array([-1, 0, 1]);
    expect(nj.arctan(x).tolist())
      .to.eql([ -Math.PI / 4, 0, Math.PI / 4 ]);
  });
});
