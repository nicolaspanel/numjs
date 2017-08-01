/* eslint-env mocha */
'use strict';

var expect = require('expect.js');

var nj = require('../../src');

describe('slice', function () {
  describe('on 1d array', function () {
    var a;
    beforeEach(function () {
      a = nj.arange(5);
    });
    it('can skip first items', function () {
      expect(a.slice(1).tolist()).to.eql([1, 2, 3, 4]); // same as a[1:]
      expect(a.slice(-4).tolist()).to.eql([1, 2, 3, 4]); // same as a[-4:]
    });
    it('can take first items', function () {
      expect(a.slice([4]).tolist()).to.eql([0, 1, 2, 3]); // same as a[:4]
      expect(a.slice([-1]).tolist()).to.eql([0, 1, 2, 3]); // same as a[:-1]
      expect(a.slice([0]).tolist()).to.eql([]); // same as a[:0]
    });
    it('can slice using both start and end indexes', function () {
      expect(a.slice([1, 4]).tolist()).to.eql([1, 2, 3]); // same as a[1:4]
      expect(a.slice([1, -1]).tolist()).to.eql([1, 2, 3]); // same as a[1:-1]
    });
    it('can slice using start, end and step', function () {
      expect(a.slice([1, 4, 2]).tolist()).to.eql([1, 3]); // same as a[1:4:2]
      expect(a.slice([0, 5, 2]).tolist()).to.eql([0, 2, 4]); // same as a[0:5:2]
      expect(a.slice([1, -1, 2]).tolist()).to.eql([1, 3]); // same as a[1:-1:2]
    });
    it('can just provide the step', function () {
      expect(a.slice([null, null, -1]).tolist()).to.eql([4, 3, 2, 1, 0]); // same as a[::-1]
      expect(a.slice([null, null, 2]).tolist()).to.eql([0, 2, 4]); // same as a[::2]
    });
    it('can slice using start and step', function () {
       expect(a.slice([1, null, null, 2]).tolist()).to.eql([1, 3]); // same as a[1::2]
    });
  });
  describe('on 2d array', function () {
    var a;
    beforeEach(function () {
      a = nj.arange(5 * 5).reshape(5, 5);
    });
    it('can skip first rows', function () {
      expect(a.slice(2).tolist())
        .to.eql([
        [10, 11, 12, 13, 14],
        [15, 16, 17, 18, 19],
        [20, 21, 22, 23, 24]]); // same as a[2:]
      expect(a.slice(-4).tolist())
        .to.eql([
        [5, 6, 7, 8, 9],
        [10, 11, 12, 13, 14],
        [15, 16, 17, 18, 19],
        [20, 21, 22, 23, 24]]); // same as a[-4:]
    });
    it('can skip first cols', function () {
      expect(a.slice(null, 2).tolist()) // same as a[:,2:]
        .to.eql([
        [2, 3, 4],
        [7, 8, 9],
        [12, 13, 14],
        [17, 18, 19],
        [22, 23, 24]]);
      expect(a.slice(null, -2).tolist()) // same as a[:,-2:]
        .to.eql([
        [3, 4],
        [8, 9],
        [13, 14],
        [18, 19],
        [23, 24]]);
    });
    it('can skip first rows and cols', function () {
      expect(a.slice(2, 2).tolist())
        .to.eql([
        [12, 13, 14],
        [17, 18, 19],
        [22, 23, 24]]); // same as a[2:,2:]
      expect(a.slice(-4, 2).tolist())
        .to.eql([
        [7, 8, 9],
        [12, 13, 14],
        [17, 18, 19],
        [22, 23, 24]]); // same as a[-4:,2:]
    });
    it('can slice in all dimensions using start, end and step', function () {
      expect(a.slice([1, 4, 2], [1, 4, 2]).tolist()) // same as a[1:4:2, 1:4:2]
        .to.eql([
        [6, 8],
        [16, 18]]);
    });
  });
});
