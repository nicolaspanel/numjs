'use strict';

var cwise = require('cwise');
var NdArray = require('../ndarray');
var rgb2gray = require('./rgb2gray');

var doIntegrate = cwise({
  args: ['array',
    'array',
    'index',
    {offset: [-1, -1], array: 0},
    {offset: [-1, 0], array: 0},
    {offset: [0, -1], array: 0}],
  body: function doIntegrateBody (sat, x, index, satA, satB, satC) {
    sat = (index[0] !== 0 && index[1] !== 0) ? x + satB + satC - satA
      : (index[0] === 0 && index[1] === 0) ? x
        : (index[0] === 0) ? x + satC
          : x + satB;
  }
});

/**
 * Compute Sum Area Table, also known as the integral of the image
 * @param {NdArray} img
 * @returns {NdArray}
 */
module.exports = function computeSumAreaTable (img) {
  var gray = rgb2gray(img);
  var iShape = gray.shape;
  var iH = iShape[0];
  var iW = iShape[1];
  var out = new NdArray(new Uint32Array(iH * iW), [iH, iW]);

  doIntegrate(out.selection, gray.selection);

  return out;
};
