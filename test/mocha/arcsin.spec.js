/* eslint-env mocha */
'use strict';

var expect = require('expect.js');

var nj = require('../../src');

describe('arcsin', function () {
  it('should work on vectors', function () {
    var x = nj.array([-1, 0, 1]);
    expect(nj.arcsin(x).tolist())
      .to.eql([ -Math.PI / 2, 0, Math.PI / 2 ]);
  });
});
