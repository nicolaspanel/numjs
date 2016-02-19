'use strict';

/* jshint ignore:start */
var expect = require('expect.js');
/* jshint ignore:end */
var _ = require('lodash');
var nj = require('../../src');

describe('max', function () {

    it('should be null for an empty array', function () {
        var arr = nj.array([]);
        expect(arr.max()).to.equal(null);
    });
    it('should return the max element in array', function () {
        var arr = nj.arange(10);
        expect(arr.max()).to.equal(9);
    });

});