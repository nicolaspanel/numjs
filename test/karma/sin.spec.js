/* eslint-env jasmine */
'use strict';

describe('sin', function () {
  it('should work on vectors', function () {
    var x = nj.array([-Math.PI / 2, 0, Math.PI / 2]);
    expect(nj.sin(x).round().tolist())
      .to.eql([-1, 0, 1]);
  });
});
