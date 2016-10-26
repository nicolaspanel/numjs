/* eslint-env mocha */
'use strict';

var expect = require('expect.js');
var nj = require('../../src');


describe('getRow', function () {
  /* Uncomment when expect is updated
  it("should error out on undefined index value", function () {
    expect(function () { return nj.arange(15).reshape(3,5).getRow(undefined); }).to.throw(Error);
  });
  it("should error out on inappropriate index type", function () {
    expect(function () { return nj.arange(15).reshape(3,5).getRow(10); }).to.throw(Error);
  });
  */
  it("should return proper result for last row of 3x5 arange matrix", function () {
    expect(nj.arange(15).reshape(3,5).getRow(2)).to.eql([10,11,12,13,14]);
  });
  it("should index a n,1 shaped njArray", function () {
    expect(-393 === nj.array([1,2,3,101,1111,NaN,-1010,1111,11111,-3939,-393,NaN]).reshape(12,1).getRow(10)[0]).to.be.ok;
  });
});