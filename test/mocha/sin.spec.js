'use strict';

/* jshint ignore:start */
var expect = require('expect.js');
/* jshint ignore:end */
var _ = require('lodash');
var nj = require('../../src');

describe('sin', function () {
    it('should work on vectors', function () {
        var x = nj.array([-Math.PI,0,Math.PI]);
        expect(nj.sin(x).tolist())
            .to.eql([ -1.2246467991473532e-16, 0, 1.2246467991473532e-16]);
    });
});