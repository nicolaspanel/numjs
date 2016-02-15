'use strict';

var expect = require('expect.js');
var _ = require('lodash');
var nj = require('../../src');

describe('sum', function () {
    it('should exists', function () {
        expect(nj.sum).to.be.ok();
    });

    it('should work on vectors', function () {
        var x  = nj.arange(3);
        expect(nj.sum(x)).to.eql(3);
    });

    it('should work on matrix', function () {
        var x  = nj.ones([10, 10]);
        expect(nj.sum(x)).to.eql(100);
    });
});