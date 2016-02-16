'use strict';

var _ = require('./utils');
var NdArray = require('../ndarray');

module.exports = function saveImageDom(img, dest, cb) {
    cb = cb || function () {};
    var iShape = img.shape,
        iH = iShape[0], iW = iShape[1];
    if (dest instanceof HTMLCanvasElement){
        var $tmp = document.createElement('canvas');
        var tmpCtx=$tmp.getContext('2d');
        var originalImg = tmpCtx.createImageData(iW ,iH);
        var err = _.setRawData(img.selection, originalImg.data);
        if (err){ return cb(err); }

        tmpCtx.putImageData(originalImg, 0, 0);
        tmpCtx.drawImage($tmp, iW, iH);
        dest.getContext('2d').drawImage($tmp, 0, 0, iW, iH, 0, 0, dest.width, dest.height);
        return cb();
    }
};