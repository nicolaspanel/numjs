'use strict';

var NdArray = require('../ndarray');

module.exports = function flipImage (img) {
  return new NdArray(img.selection.step(null, -1));
};
