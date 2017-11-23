/* eslint-env mocha */
'use strict';

var expect = require('expect.js');

var nj = require('../../src');

describe('rot90', function () {
  it('should throw the error if value is not an array', function () {
    expect(function () {
      nj.rot90(null);
    })
    .to.throwException(function (e) {
      expect(e.toString()).to.equal('ValueError: Value is not an array');
    });
  });

  it('should throw the error that matrix is not symmetric', function () {
    expect(function () {
      nj.rot90([[1, 2], [3, 4], [5, 6]]);
    })
    .to.throwException(function (e) {
      expect(e.toString()).to.equal('ValueError: Matrix is not symmetric');
    });
  });

  it('should rotate 3x matrix once', function () {
    var input = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9]
    ];
    var rotated = nj.rot90(input);
    expect(rotated).to.eql([[3, 6, 9], [2, 5, 8], [1, 4, 7]]);
  });

  it('should handle negative iterations', function () {
    var input = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9]
    ];
    var rotated = nj.rot90(input, -1);
    expect(rotated).to.eql([[3, 6, 9], [2, 5, 8], [1, 4, 7]]);
  });

  it('should not break on invalid iterations number', function () {
    var input = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9]
    ];
    var rotated = nj.rot90(input, false);
    expect(rotated).to.eql([[3, 6, 9], [2, 5, 8], [1, 4, 7]]);
  });

  it('should rotate 3x matrix 180 deg', function () {
    var input = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9]
    ];
    var rotated = nj.rot90(input, 2);
    expect(rotated).to.eql([[9, 8, 7], [6, 5, 4], [3, 2, 1]]);
  });

  it('should rotate 3x matrix 360 deg', function () {
    var input = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9]
    ];
    var rotated = nj.rot90(input, 4);
    expect(rotated).to.eql(input);
  });

  it('should rotate 4x matrix once', function () {
    const input = [
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 'a', 'b', 'c'],
      ['d', 'e', 'f', 'g']
    ];
    const target = [
      [4, 8, 'c', 'g'],
      [3, 7, 'b', 'f'],
      [2, 6, 'a', 'e'],
      [1, 5, 9, 'd']
    ];
    var rotated = nj.rot90(input);
    expect(rotated).to.eql(target);
  });
});
