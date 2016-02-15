'use strict';

var expect = require('expect.js');
var _ = require('lodash');
var nj = require('../../src');

describe('sigmoid', function () {
    it('should exists', function () {
        expect(nj.sigmoid).to.be.ok();
    });
    it('should work on vectors', function () {
        var x = nj.array([-100, -1,0, 1,100]);
        expect(nj.sigmoid(x).tolist())
            .to.eql([
                0,
                1 / (1 + Math.exp(1)),
                0.5, 1 / (1 + Math.exp(-1)),
                1]);
    });
});