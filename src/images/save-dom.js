'use strict';

var _ = require('./utils');
var errors = require('../errors');

/**
 * Save image on the given destination
 *
 * @param {NdArray} img
 * @param {HTMLCanvasElement} dest
 */
module.exports = function saveImageDom (img, dest) {
  var iShape = img.shape;
  var iH = iShape[0];
  var iW = iShape[1];
  if (dest instanceof HTMLCanvasElement) {
    var $tmp = document.createElement('canvas');
    $tmp.height = iH; $tmp.width = iW;
    var tmpCtx = $tmp.getContext('2d');
    var originalImg = tmpCtx.createImageData(iW, iH);
    var err = _.setRawData(img.selection, originalImg.data);

    if (err) { throw err; }

    tmpCtx.putImageData(originalImg, 0, 0);
    tmpCtx.drawImage($tmp, iW, iH);
    dest.getContext('2d').drawImage($tmp, 0, 0, iW, iH, 0, 0, dest.width, dest.height);
  } else {
    throw new errors.ValueError('expect input to be either an HTML Canvas or a (loaded) Image');
  }
};
