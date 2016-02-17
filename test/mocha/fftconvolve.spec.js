'use strict';

/* jshint ignore:start */
var expect = require('expect.js');
/* jshint ignore:end */
var _ = require('lodash');
var nj = require('../../src');

describe('fftconvolve', function () {
    it('should work on vectors', function () {
        var x = nj.float32([0,0,1,2,1,0,0]),
            filter = [-1,0,1],
            conv = nj.fftconvolve(x, filter);
        expect(conv.round().tolist())
            .to.eql([-1, -2,  0,  2,  1]);
        expect(conv.dtype).to.be('float32');
    });

    it('should work on matrix', function () {
        var x = nj.arange(256).reshape(16,16),
            sobelFilterH = nj.array([[ 1, 2, 1], [ 0, 0, 0], [-1,-2,-1]]),
            sobelFilterV = sobelFilterH.T;
        var gX1 = nj.fftconvolve(x, sobelFilterV),
            gH1 = nj.fftconvolve(x, sobelFilterH);

        var gX2 = nj.fftconvolve(nj.fftconvolve(x, [[1, 0,-1]]), [[1],[2],[1]]),
            gY2 = nj.fftconvolve(nj.fftconvolve(x, [[1, 2, 1]]), [[1],[0],[-1]]);

        expect(gX1.round().tolist()).to.eql(gX2.round().tolist());
        expect(gH1.round().tolist()).to.eql(gY2.round().tolist());
        var s = nj.sqrt(nj.add(gX1.pow(2), gH1.pow(2)));
        console.log('G mean: ', s.mean());
    });
});