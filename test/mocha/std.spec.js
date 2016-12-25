/* eslint-env mocha */
'use strict';

var expect = require('expect.js');

var nj = require('../../src');

describe('std', function () {
  it('should work on vectors', function () {
    expect(nj.array([-1, 1]).std()).to.equal(1);
    expect(nj.arange(7).std()).to.equal(2);
  });
  it('should be zeros if the array is full of 0s', function () {
    expect(nj.zeros(10).std())
      .to.eql(0);
  });
  describe('support for both sample and population variance', function () {
      beforeEach(function() {
        this.array = [3,3,3,2,4,4,3,3,3,3,4,3,3,5,3,4,2,3,4,4,3,2,3,4,3,3,3,3,3,3,2,1,4,3,4,3,3,4,4,4,2,3,4,3,2,4,3];
      });
      it('should default to using the sample variance', function() {
        var expectation = 0.752842809061879;
        expect(nj.array(this.array).std()).to.equal(expectation);
        expect(nj.std(this.array)).to.equal(expectation);
      })
      it('should accomodate using the population variance', function() {
        var expectation = 0.7609818867801011;
        var options = { ddof: 1 };
        expect(nj.array(this.array).std(options)).to.equal(expectation);
        expect(nj.std(this.array, options)).to.equal(expectation);
      })
  })
});
