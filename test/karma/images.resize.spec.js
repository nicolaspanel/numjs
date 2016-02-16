'use strict';

var urlToData = 'http://localhost:9876/base/data/';
var nj = window.nj;
describe('images', function () {

    describe('resize', function () {
        var mnistImg, nodeImg;

        beforeEach(function loadMnistImg(done) {
            nj.images.read(urlToData + 'five.png', function(err, _img_) {
                if (err){ return done.fail(err); }
                mnistImg = _img_;
                done();
            });
        });

        beforeEach(function loadNodePngImg(done) {
            nj.images.read(urlToData + 'nodejs.png', function(err, _img_) {
                if (err){ return done.fail(err); }
                nodeImg = _img_;
                done();
            });
        });

        it('should be able to downscale a Grayscale img', function(done){
            expect(mnistImg.shape).toEqual([28,28]);
            nj.images.resize(mnistImg, 14, 10, function (err, resized) {
                if (err){ return done.fail(err);}
                expect(resized.shape).toEqual([14, 10]);
                expect(resized.tolist())
                    .toEqual([ 
                        [   0,   0,   0,   0,   0,   0,   0,   0,   0,   0 ], 
                        [   0,   0,   0,   0,   0,   0,   0,   0,   0,   0 ],
                        [   0,   0,   0,   0,   5,   8,  65,  50, 105,  93 ],
                        [   0,  12, 139, 188, 232, 253, 252, 143, 158,  74 ],
                        [   0,   4, 177, 216, 241,  97, 171,   0,   0,   0 ],
                        [   0,   0,   3,  73, 196,   0,   0,   0,   0,   0 ],
                        [   0,   0,   0,   2, 179, 113,  27,   0,   0,   0 ],
                        [   0,   0,   0,   0,  20, 181, 219,  50,   0,   0 ],
                        [   0,   0,   0,   0,   0,   3, 148, 235,  15,   0 ],
                        [   0,   0,   0,   0,  46, 164, 235, 223,   0,   0 ],
                        [   0,   0,  22, 150, 244, 239, 134,  19,   0,   0 ],
                        [  56, 166, 244, 250, 148,  22,   0,   0,   0,   0 ],
                        [  97, 126,  86,  37,   0,   0,   0,   0,   0,   0 ],
                        [   0,   0,   0,   0,   0,   0,   0,   0,   0,   0 ] ]);
                done();
            });
        });

        it('should be able to upscale a Grayscale img', function(done){
            expect(mnistImg.shape).toEqual([28,28]);
            nj.images.resize(mnistImg, 32, 32, function (err, resized) {
                if (err){ return done.fail(err);}
                expect(resized.shape).toEqual([32, 32]);
                done();
            });
        });
        
        it('should be able to downscale an RGB img', function(done){
            expect(nodeImg.shape).toEqual([300,600,4]);
            nj.images.resize(nodeImg, 150, 300, function (err, resized) {
                if (err){ return done.fail(err);}
                expect(resized.shape).toEqual([150, 300, 4]);
                done();
            });
        });
    });

});