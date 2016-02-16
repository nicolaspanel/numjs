'use strict';

/* jshint ignore:start */
var expect = require('expect.js');
/* jshint ignore:end */
var _ = require('lodash');
var nj = require('../../src');

describe('images', function () {

    describe('area avg', function () {
        var img, sat, ssat;
        beforeEach(function () {
            img = nj.arange(4*4).reshape([4,4]);
            sat = nj.images.sat(img);
            ssat = nj.images.ssat(img);
        });
        it('should exsits', function () {
            expect(nj.images.areaValue).to.be.ok();
        });
        it('should work on the top left corner', function () {
            expect(nj.images.areaValue(0,   0,   2, 3, sat))
                .to.be(18/6);
            expect(nj.images.areaValue(0,   0,   3, 2, sat))
                .to.be(27/6);
        });
        it('should work on the middle corner', function () {
            expect(nj.images.areaValue(1, 1, 2, 2, sat))
                .to.be(30/4);
        });
        it('should work on the first line', function () {
            expect(nj.images.areaValue(0,   0,   1, 4, sat))
                .to.be(6/4);
            expect(nj.images.areaValue(0,   0,   1, 4, ssat))
                .to.be(14/4);
        });
        it('should work on the last line', function () {
            expect(nj.images.areaValue(3, 0, 1, 4, sat))
                .to.be(54/4);
        });
        it('should work on the last col', function () {
            expect(nj.images.areaValue(0, 3, 4, 1, sat))
                .to.be(36/4);
        });
    });

});