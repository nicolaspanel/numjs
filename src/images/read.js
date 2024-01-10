'use strict';

var sharp = require('sharp');
var NdArray = require('../ndarray');
var isGrayscale = require('./is-grayscale');

module.exports = async function readImageNode(input, type) {
  var hxw;
  const { data, info } = await sharp(input)
    .raw()
    .toBuffer({ resolveWithObject: true });
  var shape = [info.width | 0, info.height | 0, info.channels];
  var stride = [info.channels, (info.channels * info.width) | 0, 1];
  var wxh = new NdArray(new Uint8Array(data), shape, stride, 0);
  hxw = wxh.transpose(1, 0);
  if (isGrayscale(hxw)) {
    hxw = hxw.pick(null, null, 1);
  }
  return hxw;
};
