'use strict';

var sharp = require('sharp');
var NdArray = require('../ndarray');
var isGrayscale = require('./is-grayscale');
var deasync = require('deasync');

module.exports = function readImageNode (input, type) {
  var done = false;
  var hxw;
  sharp(input)
    .raw()
    .toBuffer(function (err, data, info) {
      if (err) { throw err; }
      var shape = [info.width | 0, info.height | 0, info.channels];
      var stride = [info.channels, info.channels * info.width | 0, 1];
      var wxh = new NdArray(new Uint8Array(data), shape, stride, 0);
      hxw = wxh.transpose(1, 0);
      if (isGrayscale(hxw)) {
        hxw = hxw.pick(null, null, 1);
      }
      done = true;
    });
  deasync.loopWhile(function () { return !done; });
  return hxw;
};
