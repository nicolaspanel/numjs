'use strict';

var _ = require('./utils');
var ndarray = require('ndarray');
var NdArray = require('../ndarray');

module.exports = function resizeImageDom (img, height, width) {
    var iShape = img.shape,
        H = iShape[0], W = iShape[1], K = iShape[2] || 1;
    var originalCanvas = document.createElement('canvas');
    originalCanvas.height = H; originalCanvas.width = W;

    var originalCtx=originalCanvas.getContext('2d');
    var originalImg = originalCtx.createImageData(W ,H);
    var err = _.setRawData(img.selection, originalImg.data);
    if (err){ throw err; }

    // compute cropping
    var cfH = H / height, cfW = W / width,
        cf = Math.min(cfH, cfW),
        cH = height * cf, cW = width * cf,
        cdH = (H - cf * height) / 2, cdW = (W - cf * width) / 2;

    //console.warn('cf: ', cf);
    //console.warn('cH: ', cH);
    //console.warn('cW: ', cW);
    //console.warn('cdH: ', cdH);
    //console.warn('cdW: ', cdW);

    originalCtx.putImageData(originalImg, 0, 0);
    originalCtx.drawImage(originalCanvas, cdW, cdH, cW, cH, 0, 0, width, height);

    var resizedImg = originalCtx.getImageData(0, 0, width, height);
    var shape  = [width | 0, height | 0, 4],
        stride = [4, 4 * width | 0, 1],
        wxh    = ndarray(new Uint8Array(resizedImg.data), shape, stride, 0),
        hxw    = wxh.transpose(1,0);
    if (iShape.length === 2){
        hxw = hxw.pick(null, null, 0);
    }
    else if (iShape.length === 3 && K === 1){
        hxw = hxw.pick(null, null, 0);
    }
    return new NdArray(hxw);
};