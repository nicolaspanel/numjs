/* eslint-env mocha */
'use strict';

var expect = require('expect.js');

var nj = require('../../src');

describe('images', function () {
  describe('read', function () {
    it('should be able to convert Color images', async function () {
      var img = await nj.images.read('data/five.png');

      expect(img).to.be.a(nj.NdArray);
      expect(img.shape).to.eql([28, 28]);
    });

    it('should be able to read PNG Color images from file', async function () {
      var img = await nj.images.read('data/nodejs.png');
      expect(img).to.be.a(nj.NdArray);
      expect(img.shape).to.eql([300, 600, 4]);
    });
  });
});
