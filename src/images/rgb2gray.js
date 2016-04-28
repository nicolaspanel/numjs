'use strict';

var cwise = require('cwise');
var NdArray = require('../ndarray');
var __ = require('../utils');

// takes ~157ms on a 5000x5000 image
var doRgb2gray = cwise({
  args: ['array', 'array', 'array', 'array'],
  body: function rgb2grayCwise (y, xR, xG, xB) {
    y = (xR * 4899 + xG * 9617 + xB * 1868 + 8192) >> 14;
  }
});

/**
 * Compute Grayscale version of an RGB image.
 * @param {NdArray}  img The image in RGB format. In a 3-D array of shape (h, w, 3), or in RGBA format with shape (h, w, 4).
 * @returns {NdArray} The grayscale image, a 3-D array  of shape (h, w, 1).
 */
module.exports = function rgb2gray (img) {
  if (!(img instanceof NdArray)) {
    img = new NdArray(img); // assume it is an ndarray
  }
  var iShape = img.shape;
  var h = iShape[0];
  var w = iShape[1];
  var k = (iShape[2] || 1);
  if (k === 1) {
    return img; // already gray
  }
  var oShape = [h, w];
  var out = new NdArray(new Uint8Array(__.shapeSize(oShape)), oShape);
  var r = img.selection.pick(null, null, 0);
  var g = img.selection.pick(null, null, 1);
  var b = img.selection.pick(null, null, 2);
  doRgb2gray(out.selection, r, g, b);

  return out;
};
