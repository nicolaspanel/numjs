'use strict';
var path = require('path');

var read = require('./read');

var DATA_DIR = path.join(path.resolve(__dirname), '../../data');

function getArray (fileName) {
  return read(path.join(DATA_DIR, fileName));
}

var exports = {};

/**
* @property {NdArray} digit - 28x28 grayscale image with an handwritten digit extracted from MNIST database
*/
Object.defineProperty(exports, 'digit', {
  get: function () {
    return getArray('five.png');
  }
});

/**
* @property {NdArray} five - 28x28 grayscale image with an handwritten digit extracted from MNIST database
*/
Object.defineProperty(exports, 'five', {
  get: function () {
    return getArray('five.png');
  }
});

/**
* @property {NdArray} node - 300x600 COLOR image representing Node.js's logo
*/
Object.defineProperty(exports, 'node', {
  get: function () {
    return getArray('nodejs.png');
  }
});

/**
* @property {NdArray} lena - The standard, yet sometimes controversial Lena test image was scanned from the November 1972 edition of Playboy magazine. From an image processing perspective, this image is useful because it contains smooth, textured, shaded as well as detail areas.
*/
Object.defineProperty(exports, 'lena', {
  get: function () {
    return getArray('lenna.png');
  }
});

/**
* @property {NdArray} lenna - The standard, yet sometimes controversial Lena test image was scanned from the November 1972 edition of Playboy magazine. From an image processing perspective, this image is useful because it contains smooth, textured, shaded as well as detail areas.
*/
Object.defineProperty(exports, 'lenna', {
  get: function () {
    return getArray('lenna.png');
  }
});

/**
* @property {NdArray} moon - This low-contrast image of the surface of the moon is useful for illustrating histogram equalization and contrast stretching.
*/
Object.defineProperty(exports, 'moon', {
  get: function () {
    return getArray('moon.jpg');
  }
});

module.exports = exports;
