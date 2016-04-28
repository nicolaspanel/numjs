/* eslint-env jasmine */
'use strict';

describe('images', function () {
  describe('Squared Sum Area Table (SSAT)', function () {
    it('should work on 3x3 matrix', function () {
      var A = nj.arange(9).reshape([3, 3]);
      var SSAT = nj.images.ssat(A);
      expect(SSAT.shape).to.eql([3, 3]);
      expect(SSAT.dtype).to.equal('uint32');
      expect(SSAT.tolist())
        .to.eql([
        [0, 1, 5],
        [9, 26, 55],
        [45, 111, 204]]);
    });
  });
});
