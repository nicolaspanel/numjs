/* eslint-env mocha */
'use strict';

var expect = require('expect.js');

var nj = require('../../src');

describe('tan', function () {
  it('should work on vectors', function () {
    expect(nj.tan([0, Math.PI / 4, Math.PI]).round().tolist())
      .to.eql([0, 1, 0]);
  });
});
