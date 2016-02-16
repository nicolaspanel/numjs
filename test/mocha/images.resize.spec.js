'use strict';

/* jshint ignore:start */
var expect = require('expect.js');
/* jshint ignore:end */
var _ = require('lodash');
var nj = require('../../src');

describe('images', function () {

    describe('resize', function () {
        var img;
        before(function (done) {
            nj.images.data.five(function (err, _img_) { img = _img_; done(); });
        });
        it('should be able to downscale a Grayscale img', function(done){
            nj.images.resize(img, 14, 10, function (err, resized) {
                if (err){ return done(err);}
                expect(resized).to.be.an(nj.NdArray);
                expect(resized.shape).to.eql([14, 10]);
                expect(resized.tolist())
                    .to.eql([
                        [   0,   0,   0,   0,   0,   0,   0,   0,   0,   0 ],
                        [   0,   0,   0,   0,   0,   0,   0,   0,   0,   0 ],
                        [   0,   0,   0,   0,   6,   9,  66,  51, 106,  94 ],
                        [   0,  13, 140, 189, 233, 253, 253, 143, 159,  75 ],
                        [   0,   5, 178, 217, 241,  98, 172,   0,   0,   0 ],
                        [   0,   0,   4,  74, 197,   1,   0,   0,   0,   0 ],
                        [   0,   0,   0,   3, 180, 114,  28,   0,   0,   0 ],
                        [   0,   0,   0,   0,  21, 182, 220,  51,   0,   0 ],
                        [   0,   0,   0,   0,   0,   4, 149, 236,  16,   0 ],
                        [   0,   0,   0,   0,  47, 165, 236, 224,   1,   0 ],
                        [   0,   0,  23, 152, 245, 240, 135,  20,   0,   0 ],
                        [  57, 167, 245, 251, 148,  23,   0,   0,   0,   0 ],
                        [  98, 127,  87,  37,   0,   0,   0,   0,   0,   0 ],
                        [   0,   0,   0,   0,   0,   0,   0,   0,   0,   0 ] ]);
                done();
            });
        });
        it('should be able to upscale a Grayscale img', function(done){
            nj.images.resize(img, 32, 32, function (err, resized) {
                if (err){ return done(err);}
                expect(resized).to.be.an(nj.NdArray);
                expect(resized.dtype).to.be('uint8');
                expect(resized.shape).to.eql([32, 32]);
                nj.images.save(resized, 'tmp.png', function () {});
                done();
            });
        });
    });

});