'use strict';

/* jshint ignore:start */
var expect = require('expect.js');
/* jshint ignore:end */
var _ = require('lodash');
var nj = require('../../src');

describe('std', function () {

    it('should work on vectors', function () {
        expect(nj.array([-1,1]).std()).to.equal(1);
        expect(nj.arange(7).std()).to.equal(2);
    });
    it('should be zeros if the array is full of 0s', function () {
        expect(nj.zeros(10).std())
            .to.eql(0);
    });
});