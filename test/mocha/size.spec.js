'use strict';

/* jshint ignore:start */
var expect = require('expect.js');
/* jshint ignore:end */
var _ = require('lodash');
var nj = require('../../src');

describe('size', function () {
    it('should be readable', function () {
        expect(nj.arange(3).size).to.equal(3);
    });
    it('should not be writableable', function () {
        expect(function(){ nj.arange(3).size = 3; }).to.throwException();
    });
});