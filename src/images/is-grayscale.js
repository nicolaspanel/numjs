'use strict';

var cwise = require('cwise');
var NdArray = require('../ndarray');

var doCheckIsGrayscale = cwise({
  args: ['array', 'array', 'array'],
  pre: function () {
    this.isgray = true;
  },
  body: function doCheckIsGrayscaleCwise (xR, xG, xB) {
    if (xR !== xG || xG !== xB) {
      this.isgray = false;
    }
  },
  post: function () {
    return this.isgray;
  }
});

module.exports = function isGrayscaleImage (arr) {
  if (arr instanceof NdArray) {
    arr = arr.selection;
  }
  var aShape = arr.shape;
  if (aShape.length === 1) {
    return false;
  }
  if (aShape.length === 2 || aShape.length === 3 && aShape[2] === 1) {
    return true;
  } else if (aShape.length === 3 && (aShape[2] === 3 || aShape[2] === 4)) {
    return doCheckIsGrayscale(arr.pick(null, null, 0), arr.pick(null, null, 1), arr.pick(null, null, 2));
  }
  return false;
};
