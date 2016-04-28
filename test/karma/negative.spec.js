/* eslint-env jasmine */
'use strict';

describe('negative', function () {
  it('should numerical negative, element-wise.', function () {
    expect(nj.arange(3).negative().tolist())
      .to.eql([-0, -1, -2]);
    expect(nj.negative(nj.arange(3)).tolist())
      .to.eql([-0, -1, -2]);
  });
});
