'use strict';

/* global HTMLCanvasElement */

var ndarray = require('ndarray');
var NdArray = require('../ndarray');
var errors = require('../errors');
var isGrayscale = require('./is-grayscale');

module.exports = function readImageDom (input) {
  if (input instanceof HTMLCanvasElement) {
    return processCanvas(input);
  } else if (input instanceof HTMLImageElement) {
    return processImg(input);
  } else {
    throw new errors.ValueError('expect input to be either an HTML Canvas or a (loaded) Image');
  }
};

function processCanvas (canvas) {
  var context = canvas.getContext('2d');
  var pixels = context.getImageData(0, 0, canvas.width, canvas.height);

  var shape = [canvas.width, canvas.height, 4];
  var stride = [4, 4 * canvas.width, 1];
  var wxh = ndarray(new Uint8Array(pixels.data), shape, stride, 0);
  var hxw = wxh.transpose(1, 0);

  if (isGrayscale(hxw)) {
    hxw = hxw.pick(null, null, 0);
  }
  return new NdArray(hxw);
}

function processImg (img) {
  var canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  var context = canvas.getContext('2d');
  context.drawImage(img, 0, 0);
  var pixels = context.getImageData(0, 0, img.width, img.height);

  var shape = [img.width, img.height, 4];
  var stride = [4, 4 * img.width, 1];
  var wxh = ndarray(new Uint8Array(pixels.data), shape, stride, 0);
  var hxw = wxh.transpose(1, 0);

  if (isGrayscale(hxw)) {
    hxw = hxw.pick(null, null, 0);
  }
  return new NdArray(hxw);
}
