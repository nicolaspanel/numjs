/* eslint-env mocha */
'use strict';

var expect = require('expect.js');

var nj = require('../../src');

describe('arccos', function () {
  it('should work on vectors', function () {
    var x = nj.array([-1, 0, 1]);
    expect(nj.arccos(x).tolist())
      .to.eql([ Math.PI, Math.PI / 2, 0 ]);
  });
});
