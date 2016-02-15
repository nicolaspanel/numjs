'use strict';

/* jshint ignore:start */
var expect = require('expect.js');
/* jshint ignore:end */
var _ = require('lodash');
var nj = require('../../src');

describe('negative', function(){
    it('should exist', function () {
       expect(nj.negative).to.be.ok();
    });
    it('should numerical negative, element-wise.', function(){
        expect(nj.arange(3).negative().tolist())
            .to.eql([0,-1,-2]);
        expect(nj.negative(nj.arange(3)).tolist())
            .to.eql([0,-1,-2]);
    });
});