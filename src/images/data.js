'use strict';
var path = require('path');

var read = require('./read');

var DATA_DIR = path.join(path.resolve(__dirname), '../../data');

/**
 * 28x28 grayscale image with an handwritten (5) digit
 *
 * Extracted from Mnist database
 * @param {imgCallback} cb
 * @returns {undefined}
 */
module.exports.five = function (cb) { return read(path.join(DATA_DIR, 'five.png'), cb); };

/**
 * 300x600 COLOR image
 *
 * @param {imgCallback} cb
 * @returns {undefined}
 */
module.exports.nodejs = function (cb) { return read(path.join(DATA_DIR, 'nodejs.png'), cb); };

/**
 * Colour “Lena” image.
 *
 * The standard, yet sometimes controversial Lena test image was scanned from the November 1972 edition of Playboy magazine.
 *
 * From an image processing perspective, this image is useful because it contains smooth, textured, shaded as well as detail areas.
 * @param {imgCallback} cb
 * @returns {undefined}
 */
module.exports.lena = function (cb) { return read(path.join(DATA_DIR, 'lena.tiff'), cb); };

/**
 * Surface of the moon.
 *
 * This low-contrast image of the surface of the moon is useful for illustrating histogram equalization and contrast stretching.
 * @param {imgCallback} cb
 * @returns {undefined}
 */
module.exports.moon = function (cb) { return read(path.join(DATA_DIR, 'moon.tiff'), cb); };