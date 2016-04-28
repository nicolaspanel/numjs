/* eslint-env mocha */
'use strict';

var expect = require('expect.js');

var nj = require('../../src');

describe('images', function () {
  var img;
  beforeEach(function () {
    img = nj.images.data.node;
  });
  it('can convert RGBA to grayscale', function () {
    var rgb = nj.images.rgb2gray(img);
    expect(img).to.be.an(nj.NdArray);
    expect(img.shape).to.eql([300, 600, 4]); // PNG COLOR images have 4 color channels: RGBA
    expect(rgb.shape).to.eql([300, 600]);
  });
});
