/* eslint-env mocha */
'use strict';

var expect = require('expect.js');
var nj = require('../../src');


describe('getRows', function () {
	describe('on 2d array', function () {
		/* uncomment when expect is updated
		it("errors out on undefined index value", function () {
		  expect(function () { nj.arange(15).reshape(3,5).getRows(undefined); }).to.throw(Error);
		});
		it("errors out on inappropriate index value for size of matrix", function () {
		  expect(function () { nj.arange(15).reshape(3,5).getRows(nj.array([10])); }).to.throw(Error);
		});
		*/
		it("returns single row of 3x5 arange matrix", function () {
		  expect(nj.arange(15).reshape(3,5).getRows(nj.array([2])).tolist()).to.eql([[10,11,12,13,14]]);
		});
		it("return multiple rows of 5x5 array", function () {
		  expect(nj.arange(25).reshape(5,5).getRows(nj.array([2,3])).tolist()).to.eql([[10,11,12,13,14],[15,16,17,18,19]]);
		});
	});
});