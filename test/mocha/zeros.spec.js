'use strict';

var expect = require('expect.js');
var _ = require('lodash');
var nj = require('../../src');

describe('zeros', function () {
    it('should exist', function () {
        expect(nj.zeros).to.be.ok();
    });

    it('can generate a vectors', function(){
        expect(nj.zeros(0).tolist()).to.eql([]);
        expect(nj.zeros(2).tolist()).to.eql([0,0]);
        expect(nj.zeros([2]).tolist()).to.eql([0, 0]);
    });

    it('can generate matrix', function(){
        expect(nj.zeros([2,2]).tolist())
            .to.eql([
                [0, 0],
                [0, 0]]);
    });

    it('should accept a dtype', function(){
        expect(nj.zeros(0, 'uint8').dtype).to.be('uint8');
    });
});