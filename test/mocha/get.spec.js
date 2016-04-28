/* eslint-env mocha */
'use strict';

var expect = require('expect.js');

var nj = require('../../src');

describe('get', function () {
  describe('on 1d array', function () {
    var a;
    beforeEach(function () {
      a = nj.arange(3);
    });
    it('can locate with positive index', function () {
      expect(a.get(1)).to.equal(1);
    });
    it('can locate with positive index', function () {
      expect(a.get(1)).to.equal(1);
    });
    it('can locate with negative index', function () {
      expect(a.get(-1)).to.equal(2);
    });
  });
  describe('on 2d array', function () {
    var a;
    beforeEach(function () {
      a = nj.arange(3 * 3).reshape(3, 3);
    });
    it('should work with positive index', function () {
      expect(a.get(1, 1)).to.equal(4);
    });
    it('should accept negative integer', function () {
      expect(a.get(-1, -1)).to.equal(8);
    });
  });
});
