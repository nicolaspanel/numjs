'use strict';

/* jshint ignore:start */
var expect = require('expect.js');
/* jshint ignore:end */
var _ = require('lodash');
var nj = require('../../src');

describe('softmax', function(){

    it('should work on vectors', function () {
        var x  = nj.zeros(3),
            expected = [1/3,1/3,1/3];
        expect(nj.softmax(x).tolist())
            .to.eql(expected);
    });

    it('should work on matrix', function () {
        var x = nj.zeros(4).reshape([2,2]),
            expected = [[1/4,1/4],[1/4, 1/4]];
        expect(nj.softmax(x).tolist())
            .to.eql(expected);
    });
});