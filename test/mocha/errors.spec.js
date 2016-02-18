'use strict';

/* jshint ignore:start */
var expect = require('expect.js');
/* jshint ignore:end */
var util = require('util');
var errors = require('../../src/errors');

describe('errors', function () {
    it('can be a ValueError', function () {
        expect(function(){
            throw new errors.ValueError('txt...');
        }).to.throwException(function (e) { // get the exception object
                expect(e.name).to.be('ValueError');
                expect(util.isError(e)).to.be(true);
                expect(e.toString()).to.be('ValueError: txt...');
            });
    });
    it('can be a ConfigError', function () {
        expect(function(){
            throw new errors.ConfigError('txt...');
        }).to.throwException(function (e) { // get the exception object
                expect(e.name).to.be('ConfigError');
                expect(util.isError(e)).to.be(true);
                expect(e.toString()).to.be('ConfigError: txt...');
            });
    });
    it('can be a NotImplementedError', function () {
        expect(function(){
            throw new errors.NotImplementedError();
        }).to.throwException(function (e) { // get the exception object
                expect(e.name).to.be('NotImplementedError');
                expect(util.isError(e)).to.be(true);
                expect(e.toString()).to.be('NotImplementedError');
            });
    });
});