/* eslint-env jasmine */
'use strict';

describe('images', function () {
  describe('flip', function () {
    it('should work on gray scale img', function () {
      var img = nj.arange(16 * 16, 'uint8').reshape(16, 16);
      var flipped = nj.images.flip(img);
      expect(flipped.shape).to.eql(img.shape);
      expect(flipped.tolist())
        .to.eql(img.step(null, -1).tolist());
    });
  });
});
