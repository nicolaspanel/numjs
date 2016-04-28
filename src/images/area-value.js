'use strict';

var areaSum = require('./area-sum');

module.exports = function areaValue (h0, w0, H, W, SAT) {
  return areaSum(h0, w0, H, W, SAT) / (H * W);
};
