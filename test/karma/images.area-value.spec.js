/* eslint-env jasmine */
'use strict';

describe('images', function () {
  describe('area avg', function () {
    var img, sat, ssat;
    beforeEach(function () {
      img = nj.arange(4 * 4).reshape([4, 4]);
      sat = nj.images.sat(img);
      ssat = nj.images.ssat(img);
    });

    it('should work on the top left corner', function () {
      expect(nj.images.areaValue(0, 0, 2, 3, sat))
        .to.equal(18 / 6);
      expect(nj.images.areaValue(0, 0, 3, 2, sat))
        .to.equal(27 / 6);
    });
    it('should work on the middle corner', function () {
      expect(nj.images.areaValue(1, 1, 2, 2, sat))
        .to.equal(30 / 4);
    });
    it('should work on the first line', function () {
      expect(nj.images.areaValue(0, 0, 1, 4, sat))
        .to.equal(6 / 4);
      expect(nj.images.areaValue(0, 0, 1, 4, ssat))
        .to.equal(14 / 4);
    });
    it('should work on the last line', function () {
      expect(nj.images.areaValue(3, 0, 1, 4, sat))
        .to.equal(54 / 4);
    });
    it('should work on the last col', function () {
      expect(nj.images.areaValue(0, 3, 4, 1, sat))
        .to.equal(36 / 4);
    });
  });
});
