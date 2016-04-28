/* eslint-env mocha */
'use strict';

var expect = require('expect.js');

var util = require('util');
var errors = require('../../src/errors');

describe('errors', function () {
  it('can be a ValueError', function () {
    expect(function () {
      throw new errors.ValueError('txt...');
    }).to.throwException(function (e) { // get the exception object
      expect(e.name).to.equal('ValueError');
      expect(util.isError(e)).to.equal(true);
      expect(e.toString()).to.equal('ValueError: txt...');
    });
  });
  it('can be a ConfigError', function () {
    expect(function () {
      throw new errors.ConfigError('txt...');
    }).to.throwException(function (e) { // get the exception object
      expect(e.name).to.equal('ConfigError');
      expect(util.isError(e)).to.equal(true);
      expect(e.toString()).to.equal('ConfigError: txt...');
    });
  });
  it('can be a NotImplementedError', function () {
    expect(function () {
      throw new errors.NotImplementedError();
    }).to.throwException(function (e) { // get the exception object
      expect(e.name).to.equal('NotImplementedError');
      expect(util.isError(e)).to.equal(true);
      expect(e.toString()).to.equal('NotImplementedError');
    });
  });
});
