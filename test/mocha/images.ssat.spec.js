'use strict';

/* jshint ignore:start */
var expect = require('expect.js');
/* jshint ignore:end */
var _ = require('lodash');
var nj = require('../../src');

describe('images', function () {

    describe('Squared Sum Area Table (SSAT)', function () {
        it('should work on 3x3 matrix', function () {
            var A = nj.arange(9).reshape([3, 3]),
                SSAT = nj.images.ssat(A);
            expect(SSAT.shape).to.eql([3,3]);
            expect(SSAT.dtype).to.be('uint32');
            expect(SSAT.tolist())
                .to.eql([
                    [   0,    1,    5],
                    [   9,   26,   55],
                    [  45,  111,  204]]);
        });
    });

});