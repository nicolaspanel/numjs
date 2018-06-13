/* eslint-env mocha */
'use strict';

var expect = require('expect.js');

var nj = require('../../src');

describe('images', function () {
  describe('resize', function () {
    it('should be able to downscale a Grayscale img', function () {
      var resized = nj.images.resize(nj.images.data.digit, 14, 10);
      expect(resized).to.be.an(nj.NdArray);
      expect(resized.shape).to.eql([14, 10]);
    });

    it('should be able to upscale a Grayscale img', function () {
      var resized = nj.images.resize(nj.images.data.digit, 32, 32);
      expect(resized).to.be.an(nj.NdArray);
      expect(resized.dtype).to.equal('uint8');
      expect(resized.shape).to.eql([32, 32]);
    });
  });
});
