'use strict';

var sharp = require('sharp');
var _ = require('./utils');

/**
 * save image on the given destination
 *
 * @param {NdArray} img
 * @param {string} dest
 */
module.exports = async function saveImageNode(img, dest) {
  var iShape = img.shape;
  var H = iShape[0];
  var W = iShape[1];
  var K = iShape[2] || 1;
  var rawData = _.getRawData(img);
  await sharp(Buffer.from(rawData.buffer), {
    raw: { width: W, height: H, channels: K },
  }).toFile(dest);
};
