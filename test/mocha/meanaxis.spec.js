/* eslint-env mocha */
'use strict';

var expect = require('expect.js');

var nj = require('../../src');

describe('meanaxis', function () {
    it('should work on square matrices', function () {
      var x = nj.array([[1, 2],[3, 4]]);
      var y = nj.array([1, 2, 3]);
      expect(nj.meanaxis(x, 0).tolist())
        .to.eql([2, 3]);
      expect(nj.meanaxis(x, 1).tolist())
        .to.eql([1.5, 3.5]);
      expect(nj.meanaxis(y, 0)).to.equal(2.0);
    });
  });