/* eslint-env jasmine */
'use strict';

var urlToData = 'http://localhost:9876/base/data/';

describe('images', function () {
  describe('read', function () {
    it('should accept loaded img as input', function (done) {
      var $img = new Image();
      $img.onload = function () {
        var img = nj.images.read($img);
        expect(img.shape).to.eql([28, 28]); // grayscale image from mnist
        done();
      };
      $img.onerror = done.fail;
      $img.src = urlToData + 'five.png';
    });
    it('should accept canvas as input', function () {
      var $c = document.createElement('canvas');
      $c.height = $c.width = 28;
      var img = nj.images.read($c);
      expect(img.shape).to.eql([28, 28]); // grayscale image from mnist
    });

    it('should work from base64 data', function (done) {
      var $img = new Image();
      $img.onload = function () {
        var img = nj.images.read($img);
        expect(img.shape).to.eql([28, 28]); // grayscale image from mnist
        done();
      };
      $img.onerror = done.fail;
      $img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAAAAABXZoBIAAAA8UlEQVR4nGNgGMSA1XzL3/9/7yVKcGORdPnz589fIP5zeqEjulzLE5jk3z/b0eS0oeJg4oIgquQduOTkk3/+6CJLsS8AuuXv388rSkIYGCT+/tVDlowGavpyrsAIzJH488cZWXIHUHIdjGP+588CJDm1D3/+9MAd0YUqmQx0Rwmctx9VchHQLVlwHtBpSUiSC//86UTw0PyJIhmKFkLIkkq3/r52QJPcC9N368/fmchyIAf9beBk4JRQmg9kPddCkQwA+vPvoYWHwGGLJsfAkAqPkD8zVdHkGHi7v0AkD/pyossBQR0wov6c8ObAIkVlAAAW/aum17TLUQAAAABJRU5ErkJggg==';
    });

    it('should accept url to a PNG file containing a grayscale img', function (done) {
      var $img = new Image();
      $img.onload = function () {
        var img = nj.images.read($img);
        expect(img.shape).to.eql([28, 28]); // grayscale image from mnist
        done();
      };
      $img.onerror = done.fail;
      $img.src = urlToData + 'five.png';
    });

    it('should accept url to a PNG file containing a Color image', function (done) {
      var $img = new Image();
      $img.onload = function () {
        var img = nj.images.read($img);
        expect(img.shape).to.eql([300, 600, 4]);
        done();
      };
      $img.onerror = done.fail;
      $img.src = urlToData + 'nodejs.png';
    });
  });
});
