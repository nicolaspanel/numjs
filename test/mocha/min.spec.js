'use strict';

var expect = require('expect.js');
var _ = require('lodash');
var nj = require('../../src');

describe('min', function () {
    it('should exist', function () {
        expect(nj.min).to.be.ok();
    });
    it('should be null for an empty array', function () {
        var arr = nj.array([]);
        expect(arr.min()).to.be(null);
    });
    it('should return the min element in array', function () {
        var arr = nj.arange(10);
        expect(arr.min()).to.be(0);
    });

});