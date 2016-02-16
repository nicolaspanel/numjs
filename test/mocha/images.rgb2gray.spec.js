'use strict';

/* jshint ignore:start */
var expect = require('expect.js');
/* jshint ignore:end */
var _ = require('lodash');
var nj = require('../../src');

describe('images', function () {

    it('can convert RGBA to grayscale', function (done) {
        nj.images.data.nodejs(function (err, img) {
            if (err){ return done(err); }
            var rgb = nj.images.rgb2gray(img);
            expect(img).to.be.an(nj.NdArray);
            expect(img.shape).to.eql([300, 600,4]); // PNG COLOR images have 4 color channels: RGBA
            expect(rgb.shape).to.eql([300, 600]);
            done();
        });
    });

});