'use strict';

var NdArray = require('../ndarray');

/**
 *
 * @param {NdArray} array
 * @returns {*}
 */
module.exports.getRawData = function getRawData (array) {
  if (array instanceof NdArray) {
    array = array.selection; // faster
  }

  var h;
  var w;
  var ptr = 0;
  var aShape = array.shape;
  var H = aShape[0];
  var W = aShape[1];
  var K = (aShape[2] || 1);
  var data = new Uint8Array(H * W * K);

  if (array.shape.length === 3) {
    if (K === 3) {
      for (h = 0; h < H; ++h) {
        for (w = 0; w < W; ++w) {
          data[ptr++] = array.get(h, w, 0);
          data[ptr++] = array.get(h, w, 1);
          data[ptr++] = array.get(h, w, 2);
        }
      }
    } else if (K === 4) {
      for (h = 0; h < H; ++h) {
        for (w = 0; w < W; ++w) {
          data[ptr++] = array.get(h, w, 0);
          data[ptr++] = array.get(h, w, 1);
          data[ptr++] = array.get(h, w, 2);
          data[ptr++] = array.get(h, w, 3);
        }
      }
    } else if (K === 1) {
      for (h = 0; h < H; ++h) {
        for (w = 0; w < W; ++w) {
          data[ptr++] = array.get(h, w, 0);
        }
      }
    } else {
      return new Error('Incompatible array shape');
    }
  } else if (array.shape.length === 2) {
    for (h = 0; h < H; ++h) {
      for (w = 0; w < W; ++w) {
        data[ptr++] = array.get(h, w);
      }
    }
  } else {
    return new Error('Invalid image');
  }
  return data;
};

module.exports.setRawData = function setRawData (array, data) {
  var h;
  var w;
  var ptr = 0;
  var c;
  var H = array.shape[0];
  var W = array.shape[1];
  var K = array.shape[2] || 1;

  if (array.shape.length === 3) {
    if (K === 3) {
      for (h = 0; h < H; ++h) {
        for (w = 0; w < W; ++w) {
          data[ptr++] = array.get(h, w, 0);
          data[ptr++] = array.get(h, w, 1);
          data[ptr++] = array.get(h, w, 2);
          data[ptr++] = 255;
        }
      }
    } else if (K === 4) {
      for (h = 0; h < H; ++h) {
        for (w = 0; w < W; ++w) {
          data[ptr++] = array.get(h, w, 0);
          data[ptr++] = array.get(h, w, 1);
          data[ptr++] = array.get(h, w, 2);
          data[ptr++] = array.get(h, w, 3);
        }
      }
    } else if (K === 1) {
      for (h = 0; h < H; ++h) {
        for (w = 0; w < W; ++w) {
          c = array.get(h, w, 0);
          data[ptr++] = c;
          data[ptr++] = c;
          data[ptr++] = c;
          data[ptr++] = 255;
        }
      }
    } else {
      return new Error('Incompatible array shape');
    }
  } else if (array.shape.length === 2) {
    for (h = 0; h < H; ++h) {
      for (w = 0; w < W; ++w) {
        c = array.get(h, w);
        data[ptr++] = c;
        data[ptr++] = c;
        data[ptr++] = c;
        data[ptr++] = 255;
      }
    }
  } else {
    return new Error('Invalid image');
  }
};
