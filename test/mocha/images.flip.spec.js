'use strict';

/* jshint ignore:start */
var expect = require('expect.js');
/* jshint ignore:end */
var _ = require('lodash');
var nj = require('../../src');

describe('images', function () {

    describe('flip', function () {
        it('should work on gray scale img', function () {
            var img = nj.arange(16*16, 'uint8').reshape(16,16),
                flipped = nj.images.flip(img);
            expect(flipped.shape).to.eql(img.shape);
            expect(flipped.tolist())
                .to.eql(img.step(null,-1).tolist());
        });
    });

});