'use strict';

/* jshint ignore:start */
var expect = require('expect.js');
/* jshint ignore:end */
var _ = require('lodash');
var nj = require('../../src');

describe('random', function () {
    it('should exists', function () {
        expect(nj.random).to.be.ok();
    });

    it('can generate vectors', function () {
        expect(nj.random(3).shape).to.eql([3]);
    });

    it('should vectors', function () {
        expect(nj.random(3).shape).to.eql([3]);
    });

    it('can generate matrix', function () {
        expect(nj.random([2,1]).shape).to.eql([2,1]);
    });
});