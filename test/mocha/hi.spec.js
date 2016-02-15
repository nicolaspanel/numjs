'use strict';

/* jshint ignore:start */
var expect = require('expect.js');
/* jshint ignore:end */
var _ = require('lodash');
var nj = require('../../src');

describe('hi', function () {
    it('should truncates from the bottom-right of the array', function () {
        expect(nj.arange(4*4).reshape([4,4]).hi(2,2).tolist())
            .to.eql([
                [0, 1],
                [4, 5]]);

    });
});