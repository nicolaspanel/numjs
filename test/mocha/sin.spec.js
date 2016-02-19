'use strict';

/* jshint ignore:start */
var expect = require('expect.js');
/* jshint ignore:end */
var _ = require('lodash');
var nj = require('../../src');

describe('sin', function () {
    it('should work on vectors', function () {
        var x = nj.array([-Math.PI/2,0,Math.PI/2]);
        expect(nj.sin(x).round().tolist())
            .to.eql([ -1, 0, 1]);
    });
});