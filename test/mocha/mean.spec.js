'use strict';

var expect = require('expect.js');
var _ = require('lodash');
var nj = require('../../src');

describe('mean', function () {
    it('should work on vectors', function () {
        expect(nj.array([-1, 1]).mean()).to.be(0);
        expect(nj.arange(7).mean()).to.be(3);
        expect(nj.arange(10).mean()).to.be(4.5);
    });
});