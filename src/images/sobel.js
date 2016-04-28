'use strict';

var cwise = require('cwise');
var ops = require('ndarray-ops');
var NdArray = require('../ndarray');
var __ = require('../utils');
var rgb2gray = require('./rgb2gray');

var doSobel = cwise({
  args: [
    'array', //  sobel
    'array', // img
    {offset: [-1, -1], array: 1}, // a
    {offset: [-1, 0], array: 1}, // b
    {offset: [-1, 1], array: 1}, // c
    {offset: [0, -1], array: 1}, // d
    // {offset:[ 9,  0], array:1}, // useless since available already and always multiplied by zero
    {offset: [0, 1], array: 1}, // f
    {offset: [1, -1], array: 1}, // g
    {offset: [1, 0], array: 1}, // h
    {offset: [1, 1], array: 1} // i
  ],
  body: function doSobelBody (s, img, a, b, c, d, f, g, h, i) {
    var sV = (a + 2 * b + c - g - 2 * h - i);
    var sH = (a - c + 2 * d - 2 * f + g - i);
    s = Math.sqrt(sH * sH + sV * sV);
  }
});

/**
 * Find the edge magnitude using the Sobel transform.
 *
 * @note
 * Take the square root of the sum of the squares of the horizontal and vertical Sobels to get a magnitude that’s somewhat insensitive to direction.
 *
 * The 3x3 convolution kernel used in the horizontal and vertical Sobels is an approximation of the
 * gradient of the image (with some slight blurring since 9 pixels are used to compute the gradient at a given pixel).
 * As an approximation of the gradient, the Sobel operator is not completely rotation-invariant. The Scharr operator should be used for a better rotation invariance.
 * @param {NdArray} img
 */
module.exports = function computeSobel (img) {
  var gray = rgb2gray(img);
  var iShape = gray.shape;
  var iH = iShape[0];
  var iW = iShape[1];

  var out = new NdArray(new Float32Array(__.shapeSize(iShape)), iShape);

  doSobel(out.selection, gray.selection);

  // set borders to zero (invalid anyway)
  ops.assigns(out.selection.pick(0, null), 0); // first line
  ops.assigns(out.selection.pick(null, 0), 0); // first col
  ops.assigns(out.selection.pick(iH - 1, null), 0); // last line
  ops.assigns(out.selection.pick(null, iW - 1), 0); // last col

  return out.divide(4 * Math.sqrt(2), false);
};
