'use strict';

var urlToData = 'http://localhost:9876/base/data/';
var nj = window.nj;
describe('images', function () {

    describe('read', function () {
        it('should accept loaded img as input', function(done){
            var img = new Image();
            img.onload = function() {
                nj.images.read(img, function (err, imgArray) {
                    if (err){ return done.fail(err); }
                    expect(imgArray.shape).toEqual([28,28]); // grayscale image from mnist
                    done();
                });
            };
            img.onerror = done;
            img.src = urlToData + 'five.png';
        });
        it('should accept canvas as input', function(done){
            var c = document.createElement('canvas');
            c.height = c.width = 28;
            nj.images.read(c, function (err, imgArray) {
                if (err){ return done.fail(err); }
                expect(imgArray.shape).toEqual([28,28]); // grayscale image from mnist
                done();
            });
        });
        it('should accept base64 data', function (done) {
            var data = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAAAAABXZoBIAAAA8UlEQVR4nGNgGMSA1XzL3/9/7yVKcGORdPnz589fIP5zeqEjulzLE5jk3z/b0eS0oeJg4oIgquQduOTkk3/+6CJLsS8AuuXv388rSkIYGCT+/tVDlowGavpyrsAIzJH488cZWXIHUHIdjGP+588CJDm1D3/+9MAd0YUqmQx0Rwmctx9VchHQLVlwHtBpSUiSC//86UTw0PyJIhmKFkLIkkq3/r52QJPcC9N368/fmchyIAf9beBk4JRQmg9kPddCkQwA+vPvoYWHwGGLJsfAkAqPkD8zVdHkGHi7v0AkD/pyossBQR0wov6c8ObAIkVlAAAW/aum17TLUQAAAABJRU5ErkJggg==';
            nj.images.read(data, function(err, img){
                if (err){ return done.fail(err); }
                expect(img.shape).toEqual([28,28]); // grayscale image from mnist
                done();
            });
        });
        it('should accept url to a PNG file containing a grayscale img', function (done) {
            nj.images.read(urlToData + 'five.png', function(err, img){
                if (err){ return done.fail(err); }
                expect(img.shape).toEqual([28,28]); // grayscale image from mnist
                done();
            });
        });

        it('should accept url to a PNG file containing a Color image', function (done) {
            nj.images.read(urlToData + 'nodejs.png', function(err, img){
                if (err){ return done.fail(err); }
                expect(img.shape).toEqual([300, 600, 4]);
                done();
            });
        });
    });

});