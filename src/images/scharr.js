'use strict';

var cwise = require('cwise');
var ops = require('ndarray-ops');
var NdArray = require('../ndarray');
var __ = require('../utils');
var rgb2gray = require('./rgb2gray');

var doScharr = cwise({
  args: [
    'array', // schar
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
    var sV = (3 * a + 10 * b + 3 * c - 3 * g - 10 * h - 3 * i);
    var sH = (3 * a - 3 * c + 10 * d - 10 * f + 3 * g - 3 * i);
    s = Math.sqrt(sH * sH + sV * sV);
  }
});

/**
 * Find the edge magnitude using the Scharr transform.
 *
 * @note
 * Take the square root of the sum of the squares of the horizontal and vertical Scharrs to get a magnitude
 * that is somewhat insensitive to direction. The Scharr operator has a better rotation invariance than other
 * edge filters, such as the Sobel operators.
 *
 * @param {NdArray} img
 */
module.exports = function computeScharr (img) {
  var gray = rgb2gray(img);
  var iShape = gray.shape;
  var iH = iShape[0];
  var iW = iShape[1];
  var out = new NdArray(new Float32Array(__.shapeSize(iShape)), iShape);

  doScharr(out.selection, gray.selection);

  // set borders to zero (invalid anyway)
  ops.assigns(out.selection.pick(0, null), 0); // first line
  ops.assigns(out.selection.pick(null, 0), 0); // first col
  ops.assigns(out.selection.pick(iH - 1, null), 0); // last line
  ops.assigns(out.selection.pick(null, iW - 1), 0); // last col

  return out.divide(16 * Math.sqrt(2), false);
};
