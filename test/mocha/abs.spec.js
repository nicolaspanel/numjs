'use strict';

/* jshint ignore:start */
var expect = require('expect.js');
/* jshint ignore:end */
var _ = require('lodash');
var nj = require('../../src');

describe('abs', function () {
    it('should work on vectors', function () {
        var x = nj.array([-1,0,1]);
        expect(nj.abs(x).tolist())
            .to.eql([1, 0, 1]);

    });
});