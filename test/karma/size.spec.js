/* eslint-env jasmine */
'use strict';

describe('size', function () {
  it('should be readable', function () {
    expect(nj.arange(3).size).to.equal(3);
  });
  it('should not be writableable', function () {
    expect(function () { nj.arange(3).size = 3; }).to.throw();
  });
});
