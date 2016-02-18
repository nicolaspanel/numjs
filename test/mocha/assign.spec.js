'use strict';
/* jshint ignore:start */
var expect = require('expect.js');
/* jshint ignore:end */
var _ = require('lodash');
var nj = require('../../src');

describe('assign', function () {
    var v, m, n;
    beforeEach(function () {
        v=nj.arange(3);
        m=nj.arange(3*2).reshape([3,2]);
        n=m.reshape([3,2,1]);
    });
    it('can assign a scalar to a vector and create a new copy', function () {
        var newV = v.assign(1);
        expect(newV).not.to.be(v); // should have create a copy
        expect(newV.tolist())
            .to.eql([1,1,1]);
    });
    it('can assign a scalar to a vector without crating a copy', function () {
        var newV = v.assign(1, false);
        expect(newV).to.be(v); // should NOT have create a copy
        expect(v.tolist())
            .to.eql([1,1,1]);
    });

    it('can assign a vector to another', function () {
        var newV = v.assign(v.add(1));
        expect(newV).not.to.be(v); // should have create a copy
        expect(newV.tolist())
            .to.eql([1,2,3]);

    });
    it('can assign to a matrix without creating a copy', function () {
        var zeros = nj.zeros([3,4]);
        zeros.slice([1,-1],[1,-1]).assign(1, false);

        expect(zeros.tolist()).to.eql([
            [ 0, 0, 0, 0],
            [ 0, 1, 1, 0],
            [ 0, 0, 0, 0]]);
    });
});