/* eslint-env mocha */
'use strict';

var expect = require('expect.js');

var nj = require('../../src');

describe('images', function () {
  describe('Sum Area Table (SAT)', function () {
    it('should work on 3x3 matrix', function () {
      var A = nj.arange(9).reshape([3, 3]);
      var SAT = nj.images.sat(A);
      expect(SAT.shape).to.eql([3, 3]);
      expect(SAT.dtype).to.equal('uint32');
      expect(SAT.tolist())
        .to.eql([
        [0, 1, 3],
        [3, 8, 15],
        [9, 21, 36]]);
    });
  });
});
