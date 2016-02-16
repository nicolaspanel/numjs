'use strict';

var _ = require('./utils');
var ndarray = require('ndarray');
var NdArray = require('../ndarray');
var isGrayscale = require('./is-grayscale');

module.exports =  function readImageDom(input, type, cb){
    if (arguments.length === 2){
        cb = type;
        type = 'input';
    }
    if(Buffer.isBuffer(input)) {
        //url = 'data:' + type + ';base64,' + url.toString('base64')
        input = 'data:image/png;base64,' + input.toString('base64');
    }

    if ((input instanceof HTMLImageElement)){
        return processImg(input, cb);
    }
    else if ((input instanceof HTMLCanvasElement)){
        return processCanvas(input, cb);
    }
    else {
        var img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = function() { processImg(img, cb); };
        img.onerror = function(err) { cb(err); };
        img.src = input;
    }
};

function processCanvas(canvas, cb){
    var context = canvas.getContext('2d');
    var pixels = context.getImageData(0, 0, canvas.width, canvas.height);

    var shape = [canvas.width, canvas.height, 4],
        stride = [4, 4*canvas.width, 1],
        wxh = ndarray(new Uint8Array(pixels.data), shape, stride, 0),
        hxw = wxh.transpose(1,0);

    if (isGrayscale(hxw)){
        hxw = hxw.pick(null,null,0);
    }
    cb(null, new NdArray(hxw));
}


function processImg(img, cb){
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    var context = canvas.getContext('2d');
    context.drawImage(img, 0, 0);
    var pixels = context.getImageData(0, 0, img.width, img.height);

    var shape = [img.width, img.height, 4],
        stride = [4, 4*img.width, 1],
        wxh = ndarray(new Uint8Array(pixels.data), shape, stride, 0),
        hxw = wxh.transpose(1,0);

    if (isGrayscale(hxw)){
        hxw = hxw.pick(null,null,0);
    }
    cb(null, new NdArray(hxw));
}