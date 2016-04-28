/* eslint-env jasmine */
'use strict';

describe('tanh', function () {
  it('should work on vectors', function () {
    var x = nj.array([-20, 0, 20]);
    expect(nj.tanh(x).tolist())
      .to.eql([-1, 0, 1]);
  });
});
