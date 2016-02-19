'use strict';

/* jshint ignore:start */
var expect = require('expect.js');
/* jshint ignore:end */
var _ = require('lodash');
var nj = require('../../src');

describe('tan', function () {
    it('should work on vectors', function () {
        expect(nj.tan([0, Math.PI/4 , Math.PI]).round().tolist())
            .to.eql([ 0, 1, 0]);
    });
});