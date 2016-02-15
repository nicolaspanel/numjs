'use strict';

/* jshint ignore:start */
var expect = require('expect.js');
/* jshint ignore:end */
var _ = require('lodash');
var nj = require('../../src');

describe('clone', function(){
    var x, c;
    beforeEach(function(){
        x = nj.arange(3, nj.dtypes.uint8);
        c = x.clone();
    });
    it('should create a deep copy', function(){
        expect(c.get(0)).to.be(0);
        c.set(0,1);
        expect(c.get(0)).to.be(1);
        expect(x.get(0)).to.be(0);
    });
    it('should preserve dtype', function () {
        expect(c.dtype).to.be('uint8');
    });
});