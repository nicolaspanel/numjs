'use strict';

var nj = window.nj;
describe('images', function () {

    describe('save', function () {
        it('should exist', function () {
            expect(nj.images.save).toBeTruthy();
        });
        it('should be able to render a Grayscale img into a canvas', function(done){
            var H = 10, W = 12,
                img = nj.ones([H,W]),
                $cv = document.createElement('canvas');
            $cv.height = H; $cv.width = W;
            nj.images.save(img, $cv, function (err1) {
                if (err1){ return done.fail(err1); }
                nj.images.read($cv, function(err2, rendered){
                    if (err2) { return done.fail(err2); }
                    expect(rendered.tolist())
                        .toEqual(img.tolist());
                    done();
                });
            });
        });
        it('should be able to render a RGB img into a canvas', function(done){
            var H = 10, W = 12,
                img = nj.concatenate(nj.ones([H,W,2]), nj.zeros([H,W,1]), nj.ones([H,W,1]).multiply(255)),
                $cv = document.createElement('canvas');
            $cv.height = H; $cv.width = W;
            nj.images.save(img, $cv, function (err1) {
                if (err1){ return done.fail(err1); }
                nj.images.read($cv, function(err2, rendered){
                    if (err2) { return done.fail(err2); }
                    expect(rendered.tolist())
                        .toEqual(img.tolist());
                    done();
                });
            });
        });
    });
});