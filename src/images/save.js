'use strict';

var sharp = require('sharp');
var NdArray = require('../ndarray');
var _ = require('./utils');
/**
 * save image on the given location
 *
 * @param {NdArray} img
 * @param {string} dest
 * @param {imgCallback} cb
 */
module.exports = function saveImageNode(img, dest, cb){
    var iShape = img.shape, H = iShape[0], W = iShape[1], K = (iShape[2] || 1);
    var rawData = _.getRawData(img);
    return sharp(new Buffer(rawData.buffer), {raw: {width: W, height: H, channels: K}})
        .toFile(dest, function (err) {
            return cb(err);
        });

};