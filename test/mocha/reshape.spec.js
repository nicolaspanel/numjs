/* eslint-env mocha */
'use strict';

var expect = require('expect.js');

var _ = require('lodash');
var nj = require('../../src');

describe('reshape', function () {
  it('should accept native array as input', function () {
    var arr = nj.reshape([0, 1, 2, 3], [2, 2]);
    expect(arr.tolist())
      .to.eql([[0, 1], [2, 3]]);
    expect(arr.shape).to.eql([2, 2]);
  });

  it('should work on vectors', function () {
    var vector = nj.array(_.range(12));
    var init = vector.reshape([4, 3]);
    expect(init.shape)
      .to.eql([4, 3]);
    expect(init.tolist())
      .to.eql([[0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11]]);
  });
  it('should work on matrix', function () {
    var vector = nj.array(_.range(12));
    var reshaped = vector.reshape([3, 4]);
    expect(reshaped.shape)
      .to.eql([3, 4]);
    expect(reshaped.tolist())
      .to.eql([[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11]]);
  });
  it('should preserve type', function () {
    expect(nj.arange(12, 'float32').reshape([4, 3]).dtype)
      .to.equal('float32');
  });
  it('should work on a sliced array but create a cpy', function () {
    var x = nj.arange(15).reshape([3, 5]);
    var reshaped = x.hi(3, 4).reshape([4, 3]);

    expect(x.tolist())
      .to.eql([
      [0, 1, 2, 3, 4],
      [5, 6, 7, 8, 9],
      [10, 11, 12, 13, 14]]);

    expect(reshaped.tolist())
      .to.eql([
      [0, 1, 2],
      [3, 5, 6],
      [7, 8, 10],
      [11, 12, 13]]);

    x.set(0, 0, 1);

    expect(x.tolist())
      .to.eql([
      [1, 1, 2, 3, 4],
      [5, 6, 7, 8, 9],
      [10, 11, 12, 13, 14]]);

    expect(reshaped.tolist())
      .to.eql([
      [0, 1, 2],
      [3, 5, 6],
      [7, 8, 10],
      [11, 12, 13]]);
  });
  it('should not create a copy of the data if adding a new dim at the end', function () {
    var x = nj.arange(15).reshape([3, 5]);
    var reshaped = x.reshape([3, 5, 1]);

    x.set(0, 0, 1);
    expect(reshaped.tolist())
      .to.eql([
      [[1], [1], [2], [3], [4]],
      [[5], [6], [7], [8], [9]],
      [[10], [11], [12], [13], [14]]]);
  });
  it('should not create a removing the last dim', function () {
    var x = nj.arange(15).reshape([3, 5, 1]);
    var reshaped = x.reshape([3, 5]);

    x.set(0, 0, 0, 1);
    expect(reshaped.tolist())
      .to.eql([
      [1, 1, 2, 3, 4],
      [5, 6, 7, 8, 9],
      [10, 11, 12, 13, 14]]);
  });
  it('should flatten the array if shape is -1', () => {
    var arr = nj.arange(8)
    .reshape([2, 2, 2])
    .reshape(-1);
    expect(arr.tolist())
      .to.eql(nj.arange(8).tolist());
    expect(arr.shape).to.eql([8]);
  });
  it('should throw an error if more than 1 dimension is set to -1', () => {
    expect(() => nj.arange(8).reshape([-1, -1]))
    .to.throwException((e) => {
      expect(e.toString()).to.equal('ValueError: can only specify one unknown dimension');
    });
  });
  it('should replace unknown dimension with the right value', () => {
    expect(nj.arange(8).reshape([4, -1]).tolist())
    .to.eql([[0, 1],
             [2, 3],
             [4, 5],
             [6, 7]]);
  });
});
