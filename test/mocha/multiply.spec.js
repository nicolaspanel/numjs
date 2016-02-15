'use strict';

var expect = require('expect.js');
var _ = require('lodash');
var nj = require('../../src');

describe('multiply', function () {
    it('should exists', function () {
        expect(nj.multiply).to.be.ok();
    });
    it('can multiply a vector with a scalar and create a new copy', function () {
        var x = nj.arange(3),
            scalar = 2,
            expected = [0,2,4];
        var newX = x.multiply(scalar);
        expect(newX).not.to.be(x);
        expect(newX.tolist())
            .to.eql(expected);
    });
    it('can multiply a vector with a scalar without creating a copy', function () {
        var x = nj.arange(3),
            scalar = 2,
            expected = [0,2,4];
        var newX = x.multiply(scalar, false);
        expect(newX).to.be(x);
        expect(newX.tolist())
            .to.eql(expected);
    });
    it('can multiply two vectors', function () {
        var v = nj.arange(3);
        expect(v.multiply(v).tolist())
            .to.eql([0,1,4]);
    });
    it('can multiply two matrix with the same shape', function () {
        var m = nj.arange(6).reshape([3,2]);
        expect(m.multiply(m).tolist())
            .to.eql([
                [  0,  1],
                [  4,  9],
                [ 16, 25]]);
    });
    it('should throw an error when multiplying an array with a vector', function () {
        expect(function () {
            var x1 = nj.arange(9).reshape(3,3),
                x2 = nj.arange(3);
            nj.multiply(x1,x2);
        }).to.throwException();
    });
});