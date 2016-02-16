'use strict';

var sharp = require('sharp');
var _ = require('./utils');
var NdArray = require('../ndarray');

module.exports = function resizeImageNode(img, height, width, cb) {
    var iShape = img.shape,
        H = iShape[0], W = iShape[1], K = iShape[2] || 1;
    var data = _.getRawData(img.selection);
    if (data instanceof Error){ return cb(data); }
    sharp(new Buffer(data.buffer), { raw: { width: W, height: H, channels: K}})
        .resize(width, height)
        .raw()
        .toBuffer(function(err, data, info){
            if (err){ return cb(err); }
            var shape = [info.width | 0, info.height | 0, info.channels],
                stride = [info.channels, info.channels * info.width | 0, 1],
                wxh = new NdArray(new Uint8Array(data), shape, stride, 0),
                hxw = wxh.transpose(1,0);
            if (iShape.length === 2){
                hxw = hxw.pick(null, null, 0);
            }
            else if (iShape.length === 3 && K === 1){
                hxw = hxw.hi(null, null, 1);
            }
            cb(null, hxw);
        });
};