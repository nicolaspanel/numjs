'use strict';

var sharp = require('sharp');
var ndarray = require('ndarray');
var _ = require('./utils');
var NdArray = require('../ndarray');

module.exports = async function resizeImageNode(img, height, width) {
  var hxw;
  var iShape = img.shape;
  var H = iShape[0];
  var W = iShape[1];
  var K = iShape[2] || 1;
  var rawData = _.getRawData(img.selection);
  if (rawData instanceof Error) {
    throw rawData;
  }
  const { data, info } = await sharp(Buffer.from(rawData.buffer), {
    raw: { width: W, height: H, channels: K },
  })
    .resize(width, height)
    .raw()
    .toBuffer({ resolveWithObject: true });
  var shape = [info.width | 0, info.height | 0, info.channels];
  var stride = [info.channels, (info.channels * info.width) | 0, 1];
  var wxh = new NdArray(ndarray(new Uint8Array(data), shape, stride, 0));
  hxw = wxh.transpose(1, 0);
  if (iShape.length === 2) {
    hxw = hxw.pick(null, null, 0);
  } else if (iShape.length === 3 && K === 1) {
    hxw = hxw.hi(null, null, 1);
  }
  return hxw;
};
