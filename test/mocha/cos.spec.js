'use strict';

/* jshint ignore:start */
var expect = require('expect.js');
/* jshint ignore:end */
var _ = require('lodash');
var nj = require('../../src');

describe('cos', function () {
    it('should work on vectors', function () {
        var x = nj.array([0, Math.PI / 2, Math.PI]);
        expect(nj.cos(x).tolist())
            .to.eql([ 1, 6.123233995736766e-17, -1]);
    });
});