'use strict';

var expect = require('expect.js');
var _ = require('lodash');
var nj = require('../../src');

describe('dot', function(){
    it('should exists', function () {
        expect(nj.dot).to.be.ok();
    });
    describe('on vectors', function () {
        var v3, v12;

        beforeEach(function () {
            v3 = nj.arange(3); v12 = nj.arange(12);
        });

        it('should work if vectors have the same length', function () {
            expect(nj.dot(v3,v3).tolist()).to.eql([5]);
            expect(nj.dot(v12,v12).tolist()).to.eql([506]);
        });

        it('should throw an error lengths are different', function(){
            expect(function(){ nj.dot([v3,v12]); }).to.throwException();
        });
    });

    it('should work on matrix', function(){
        var a = nj.arange(12).reshape([4,3]),
            b = nj.arange(12).reshape([3,4]);
        expect(nj.dot(a, b).tolist()).to.eql([
            [ 20,  23,  26,  29],
            [ 56,  68,  80,  92],
            [ 92, 113, 134, 155],
            [128, 158, 188, 218]
        ]);
        expect(nj.dot(b, a).tolist()).to.eql([
            [ 42,  48,  54],
            [114, 136, 158],
            [186, 224, 262]
        ]);

    });
    it('should be able to multiply a vector with a matrix', function(){
        var a = nj.arange(2),
            b = nj.arange(6).reshape([2,3]);

        expect(nj.dot(a,b).tolist())
            .to.eql([3,4,5]);
        expect(nj.dot(b.transpose(), a).tolist())
            .to.eql([3,4,5]);
    });

});