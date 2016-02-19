'use strict';

/* jshint ignore:start */
var expect = require('expect.js');
/* jshint ignore:end */
var _ = require('lodash');
var nj = require('../../src');

describe('cos', function () {
    it('should work on vectors', function () {
        var x = nj.array([0, Math.PI / 2, Math.PI]);
        expect(nj.cos(x).round().tolist())
            .to.eql([ 1, 0, -1]);
    });
});