/* eslint-env mocha */
'use strict';

var expect = require('expect.js');

var nj = require('../../src');

describe('images', function () {
  describe('scharr', function () {
    var FILTER_H = nj.array([
      [3, 10, 3],
      [0, 0, 0],
      [-3, -10, -3]]).divide(16, false);
    var FILTER_V = FILTER_H.T;

    it('should work on 3x3 images', function () {
      var img = nj.arange(3 * 3).reshape([3, 3]);
      var sV = nj.convolve(img, FILTER_V);
      var sH = nj.convolve(img, FILTER_H);
      var scharr = nj.sqrt(nj.add(sV.pow(2), sH.pow(2))).divide(Math.sqrt(2), false);

      expect(nj.images.scharr(img).lo(1, 1).hi(1, 1).round().tolist())
        .to.eql(scharr.round().tolist());
    });
    it('should work on 25x25 images', function () {
      var img = nj.arange(16 * 16).reshape([16, 16]);

      var sV = nj.convolve(img, FILTER_V);
      var sH = nj.convolve(img, FILTER_H);
      var scharr = nj.sqrt(nj.add(sV.pow(2), sH.pow(2))).divide(Math.sqrt(2), false);

      expect(nj.images.scharr(img).lo(1, 1).hi(14, 14).round().tolist())
        .to.eql(scharr.round().tolist());
    });
    it('should be full of zeros if no edges', function () {
      expect(nj.images.scharr(nj.ones([5, 5])).round().tolist())
        .to.eql(nj.zeros([5, 5]).tolist());
    });
  });
});
