'use strict';

/**
 * This callback type is called `imgCallback` and is displayed as a global symbol.
 *
 * @callback imgCallback
 * @param {err} error - if any, null otherwise
 * @param {NdArray} - image represented as a (H, W, [K,]) array, with K the number of color channels. if image is grayscale (or B&W) then image only have two dimensions H and W
 */

module.exports = {
  data: require('./data'),
  read: require('./read'),
  save: require('./save'),
  resize: require('./resize'),
  sat: require('./sat'),
  ssat: require('./ssat'),
  sobel: require('./sobel'),
  scharr: require('./scharr'),
  areaSum: require('./area-sum'),
  areaValue: require('./area-value'),
  rgb2gray: require('./rgb2gray'),
  flip: require('./flip')
};
