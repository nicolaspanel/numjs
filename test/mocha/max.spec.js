'use strict';

var expect = require('expect.js');
var _ = require('lodash');
var nj = require('../../src');

describe('max', function () {
    it('should exist', function () {
        expect(nj.max).to.be.ok();
    });
    it('should be null for an empty array', function () {
        var arr = nj.array([]);
        expect(arr.max()).to.be(null);
    });
    it('should return the max element in array', function () {
        var arr = nj.arange(10);
        expect(arr.max()).to.be(9);
    });

});