'use strict';

var sharp = require('sharp');
var NdArray = require('../ndarray');
var isGrayscale = require('./is-grayscale');

module.exports = function readImageNode(input, type, cb) {
    if (arguments.length === 2){
        cb = type;
        type = 'input';
    }
    sharp(input)
        .toFormat(type)
        .raw()
        .toBuffer(function(err, data, info){
            if (err){return cb(err); }
            var shape = [info.width | 0, info.height | 0, info.channels],
                stride = [info.channels, info.channels * info.width | 0, 1],
                wxh = new NdArray(new Uint8Array(data), shape, stride, 0),
                hxw = wxh.transpose(1,0);
            if (isGrayscale(hxw)){
                hxw = hxw.pick(null,null,1);
            }
            cb(null, hxw);
        });
};



