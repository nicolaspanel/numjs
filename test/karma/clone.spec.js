/* eslint-env jasmine */
'use strict';

describe('clone', function () {
  var x, c;
  beforeEach(function () {
    x = nj.arange(3, 'uint8');
    c = x.clone();
  });
  it('should create a deep copy', function () {
    expect(c.get(0)).to.equal(0);
    c.set(0, 1);
    expect(c.get(0)).to.equal(1);
    expect(x.get(0)).to.equal(0);
  });
});
