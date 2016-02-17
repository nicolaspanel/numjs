'use strict';

var sharp = require('sharp');
var deasync = require('deasync');
var NdArray = require('../ndarray');
var _ = require('./utils');

/**
 * save image on the given destination
 *
 * @param {NdArray} img
 * @param {string} dest
 */
module.exports = function saveImageNode(img, dest){
    var done = false;
    var iShape = img.shape, H = iShape[0], W = iShape[1], K = (iShape[2] || 1);
    var rawData = _.getRawData(img);
    sharp(new Buffer(rawData.buffer), {raw: {width: W, height: H, channels: K}})
        .toFile(dest, function (err) {
            if (err){ throw err; }
            done = true;
        });
    deasync.loopWhile(function(){return !done;});
};