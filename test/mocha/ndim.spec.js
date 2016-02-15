'use strict';

/* jshint ignore:start */
var expect = require('expect.js');
/* jshint ignore:end */
var _ = require('lodash');
var nj = require('../../src');

describe('ndim', function(){
    it('should be readable', function(){
        var a = nj.arange(15);
        expect(a.ndim).to.be(1);
        expect(a.reshape(3,5).ndim).to.be(2);
    });
});