/* eslint-env jasmine */
'use strict';

var urlToData = 'http://localhost:9876/base/data/';

describe('images', function () {
  describe('resize', function () {
    var gray, rgba;

    beforeEach(function loadMnistImg (done) {
      var $img = new Image();
      $img.onload = function () {
        gray = nj.images.read($img);
        done();
      };
      $img.onerror = done.fail;
      $img.src = urlToData + 'five.png';
    });

    beforeEach(function loadNodePngImg (done) {
      var $img = new Image();
      $img.onload = function () {
        rgba = nj.images.read($img);
        done();
      };
      $img.onerror = done.fail;
      $img.src = urlToData + 'nodejs.png';
    });

    it('should be able to downscale a Grayscale img', function () {
      expect(gray.shape).to.eql([28, 28]);
      var resized = nj.images.resize(gray, 14, 10);
      expect(resized.shape).to.eql([14, 10]);
    // expect(resized.tolist())
    //    .to.eql([
    //        [   0,   0,   0,   0,   0,   0,   0,   0,   0,   0 ],
    //        [   0,   0,   0,   0,   0,   0,   0,   0,   0,   0 ],
    //        [   0,   0,   0,   0,   5,   8,  65,  50, 105,  93 ],
    //        [   0,  12, 139, 188, 232, 253, 252, 143, 158,  74 ],
    //        [   0,   4, 177, 216, 241,  97, 171,   0,   0,   0 ],
    //        [   0,   0,   3,  73, 196,   0,   0,   0,   0,   0 ],
    //        [   0,   0,   0,   2, 179, 113,  27,   0,   0,   0 ],
    //        [   0,   0,   0,   0,  20, 181, 219,  50,   0,   0 ],
    //        [   0,   0,   0,   0,   0,   3, 148, 235,  15,   0 ],
    //        [   0,   0,   0,   0,  46, 164, 235, 223,   0,   0 ],
    //        [   0,   0,  22, 150, 244, 239, 134,  19,   0,   0 ],
    //        [  56, 166, 244, 250, 148,  22,   0,   0,   0,   0 ],
    //        [  97, 126,  86,  37,   0,   0,   0,   0,   0,   0 ],
    //        [   0,   0,   0,   0,   0,   0,   0,   0,   0,   0 ] ]);
    //    .to.eql([
    //        [   0,   0,   0,   0,   0,   0,   0,   0,   0,   0],
    //        [   0,   0,   0,   0,   0,   0,   0,   0,   0,   0],
    //        [   0,   0,   0,   0,   4,   7,  57,  48,  89,  85],
    //        [   0,   9, 125, 178, 226, 253, 252, 152, 170,  87],
    //        [   0,   4, 181, 217, 243, 110, 177,   0,   0,  0],
    //        [   0,   0,   3,  64, 200,   0,   0,   0,   0,  0],
    //        [   0,   0,   0,   2, 177, 108,  26,   0,   0,  0],
    //        [   0,   0,   0,   0,  19, 184, 220,  49,   0,  0],
    //        [   0,   0,   0,   0,   0,   3, 139, 235,  15,  0],
    //        [   0,   0,   0,   0,  37, 151, 230, 227,   0,  0],
    //        [   0,   0,  18, 136, 242, 242, 149,  24,   0,  0],
    //        [  46, 151, 242, 251, 162,  27,   0,   0,   0,  0],
    //        [ 105, 142, 100,  45,   0,   0,   0,   0,   0,  0],
    //        [   0,   0,   0,   0,   0,   0,   0,   0,   0,  0]]);
    // !!! canvas scaling not right. look like it comes from phantomjs !!!
    });

    it('should be able to upscale a Grayscale img', function () {
      expect(gray.shape).to.eql([28, 28]);
      expect(nj.images.resize(gray, 32, 30).shape)
        .to.eql([32, 30]);
    });

    it('should be able to downscale an RGB img', function () {
      expect(rgba.shape).to.eql([300, 600, 4]);
      expect(nj.images.resize(rgba, 150, 300).shape)
        .to.eql([150, 300, 4]);
    });
  });
});
