'use strict';

/* jshint ignore:start */
var expect = require('expect.js');
/* jshint ignore:end */
var _ = require('lodash');
var nd = require('../../src');

describe('num4js', function(){
    describe('constuctors', function(){
        _.forEach(nd.dtypes, function(type, dtype){
            expect(nd.array([], dtype).dtype()).to.be(dtype);
            expect(nd.array([], dtype).tolist()).to.eql([]);
            expect(nd[dtype]([]).dtype()).to.be(dtype);
        });
        it('can be used with numbers', function(){
            var arr = nd.array(0),
                f32 = nd.float32(0);
            expect(arr.tolist()).to.eql([0]);
            expect(f32.tolist()).to.eql([0]);
        });
    });

    describe('shape', function () {
        it('should be correct if array empty', function () {
            expect(nd.array([]).shape()).to.eql([0]);
        });
        it('should be correct if array is a vector', function () {
            expect(nd.array(_.range(5)).shape()).to.eql([5]);
        });
        it('should be correct if array is a matrix', function () {
            expect(nd.array([[0,1],[2,3]]).shape()).to.eql([2,2]);
        });
        it('should be correct if array is a matrix', function () {
            expect(nd.array([[[0],[1]],[[2],[3]]]).shape()).to.eql([2,2,1]);
        });
    });

    it('can locate index in matrix', function () {
        expect(nd.locate(5, [4,3])).to.eql([1,2]);
        expect(nd.locate(11, [4,3])).to.eql([3,2]);
        expect(nd.locate(0, [4,3,2])).to.eql([0,0,0]);
        expect(nd.locate(0, [6])).to.eql([0]);
        expect(nd.locate(5, [6,1])).to.eql([5,0]);
        expect(nd.locate(5, [6,1])).to.eql([5,0]);
        expect(nd.locate(5, [4,2,2])).to.eql([1,0,1]);
        expect(nd.locate(5, [4,4])).to.eql([1,1]);

    });

    it('can arange a new array', function () {
        expect(nd.arange(10, nd.dtypes.uint32).tolist()).to.eql(_.range(10));
    });

    it('can generate zeros', function(){
        expect(nd.zeros(0, 'uint8').dtype()).to.be('uint8');
        expect(nd.zeros(0).tolist()).to.eql([]);
        expect(nd.zeros(2).tolist()).to.eql([0,0]);
        expect(nd.zeros([2]).tolist()).to.eql([0, 0]);
        expect(nd.zeros([2,1]).tolist()).to.eql([[0], [0]]);
    });

    it('can generate ones', function(){
        expect(nd.ones([2,1]).tolist())
            .to.eql([[1],[1]]);
    });

    it('can generate random numbers', function () {
        expect(nd.random([2,1]).shape()).to.eql([2,1]);
    });

    describe('clone', function(){
        var x, c;
        beforeEach(function(){
            x = nd.arange(3, nd.dtypes.uint8);
            c = x.clone();
        });
        it('should create a deep copy', function(){
            expect(c.get(0)).to.be(0);
            c.set(0,1);
            expect(c.get(0)).to.be(1);
            expect(x.get(0)).to.be(0);
        });
    });

    describe('reshape', function () {
        it('should work on vectors and matrix', function(){
            var vector = nd.array(_.range(12));
            var init = vector.reshape([4,3]);
            expect(init.shape())
                .to.eql([4,3]);
            expect(init.tolist())
                .to.eql([[0,1,2],[3,4,5],[6,7,8],[9,10,11]]);

            var reshaped = init.reshape([3,4]);
            expect(reshaped.shape())
                .to.eql([3,4]);
            expect(reshaped.tolist())
                .to.eql([[0,1,2,3],[4,5,6,7],[8,9,10,11]]);
        });
        it('should preserve type', function(){
            expect(nd.arange(12, nd.dtypes.float32).reshape([4,3]).dtype())
                .to.be('float32');
        });
    });

    describe('generic array', function () {
        var vect;
        beforeEach(function () {
            vect = nd.zeros(12);
            expect(vect.dtype()).to.be('array');
        });
        it('can be converted to uint8', function () {
            vect.dtype('uint8');
            expect(vect.dtype()).to.be('uint8');
        });
    });

    describe('addition', function () {
        var v, m, n;
        beforeEach(function () {
            v=nd.arange(3);
            m=nd.arange(3*2).reshape([3,2]);
            n=m.reshape([3,2,1]);
        });
        it('can add a scalar to a vector', function () {
            var newV = nd.add(v,1);
            expect(newV).not.to.be(v); // should have create a copy
            expect(newV.tolist())
                .to.eql([1,2,3]);
        });

        it('can sum 2 vector', function () {
            var newV = v.add(v);
            expect(newV).not.to.be(v); // should have create a copy
            expect(newV.tolist())
                .to.eql([0,2,4]);

        });
        it('can add a scalar to a matrix', function () {
            var newMatrix = m.add(1);
            expect(newMatrix).not.to.be(m); // should have create a copy
            expect(newMatrix.tolist())
                .to.eql([[1,2],[3,4],[5,6]]);
        });
        it('can sum 2 matrx', function () {
            var newV = m.add(m);
            expect(newV).not.to.be(m); // should have create a copy
            expect(newV.tolist())
                .to.eql([[0,2],[4,6],[8,10]]);

        });
    });
    it('broadcast', function () {
        expect(nd.broadcast([], [])).to.be(undefined);
        expect(nd.broadcast([256,256,3], [3])).to.eql([256,256,3]);
        expect(nd.broadcast([8, 1, 6, 1], [7, 1, 5])).to.eql([8, 7, 6, 5]);
        expect(nd.broadcast([5, 4], [1])).to.eql([5,4]);
        expect(nd.broadcast([15, 3, 5], [15, 1, 5])).to.eql([15, 3, 5]);
    });

    describe('multiplication', function () {
        it('can multiply a vector with a scalar', function () {
            var x = nd.arange(3),
                scalar = 2,
                expected = [0,2,4];
            expect(x.mul(scalar).tolist())
                .to.eql(expected);
            expect(nd.mul(x,scalar).tolist())
                .to.eql(expected);
        });
        it('can multiply two vectors', function () {
            var v = nd.arange(3);
            expect(v.mul(v).tolist())
                .to.eql([0,1,4]);
        });
        it('can multiply two matrix with the same shape', function () {
            var m = nd.arange(6).reshape([3,2]);
            expect(m.mul(m).tolist())
                .to.eql([[0,1],[4,9],[16,25]]);
        });
    });

    describe('exp', function () {
        it('should work on scalars', function () {
            expect(nd.exp(0))
                .to.eql(1);
        });
        it('should work on vectors', function () {
            var x  = nd.arange(3),
                expected = [1,Math.exp(1),Math.exp(2)];
            expect(nd.exp(x).tolist())
                .to.eql(expected);
        });
    });

    describe('sum', function () {
        it('should work on vectors', function () {
            var x  = nd.arange(3);
            expect(nd.sum(x)).to.eql(3);
        });
    });

    describe('softmax', function(){
        it('should work on vectors', function () {
            var x  = nd.zeros(3),
                expected = [1/3,1/3,1/3];
            expect(nd.softmax(x).tolist())
                .to.eql(expected);
        });
        it('should work on matrix', function () {
            var x = nd.zeros(4).reshape([2,2]),
                expected = [[1/4,1/4],[1/4, 1/4]];
            expect(nd.softmax(x).tolist())
                .to.eql(expected);
        });
    });

    describe('sigmoid', function () {
        it('should work on vectors', function () {
            var x = nd.array([-100, -1,0, 1,100]);
            expect(nd.sigmoid(x).tolist())
                .to.eql([0, 1 / (1 + Math.exp(1)), 0.5, 1 / (1 + Math.exp(-1)), 1]);
        });
    });

    describe('clip', function () {
        it('should work on vectors', function () {
            var x = nd.array([-1,0,1]);
            expect(nd.clip(x, 0, Number.POSITIVE_INFINITY).tolist())
                .to.eql([0,0,1]);
            expect(nd.clip(x, Number.NEGATIVE_INFINITY, 0).tolist())
                .to.eql([-1,0,0]);
        });
    });

    describe('tanh', function () {
        it('should work on vectors', function () {
            var x = nd.array([-20,0,20]);
            expect(nd.tanh(x).tolist())
                .to.eql([ Math.tanh(-20), Math.tanh(0), Math.tanh(20)]);

        });
    });

    describe('dot', function(){

        describe('on vectors', function () {
            var a, b;
            beforeEach(function () {
                a = nd.arange(3); b = nd.arange(12);
            });
            it('should work if vectors have the same length', function () {
                expect(nd.dot(a,a).tolist()).to.eql([5]);
                expect(nd.dot(b,b).tolist()).to.eql([506]);
            });

            it('should throw an error lengths are different', function(){
                expect(function(){ nd.dot([a,b]); }).to.throwException();
            });
        });

        it('should work on matrix', function(){
            var a = nd.arange(12).reshape([4,3]),
                b = nd.arange(12).reshape([3,4]);
            expect(nd.dot(a, b).tolist()).to.eql([
                [ 20,  23,  26,  29],
                [ 56,  68,  80,  92],
                [ 92, 113, 134, 155],
                [128, 158, 188, 218]
            ]);
            expect(nd.dot(b, a).tolist()).to.eql([
                [ 42,  48,  54],
                [114, 136, 158],
                [186, 224, 262]
            ]);

        });
        it('should be able to multiply a vector with a matrix', function(){
            var a = nd.arange(2),
                b = nd.arange(6).reshape([2,3]);
            expect(nd.dot(a,b).tolist())
                .to.eql([3,4,5]);
        });

    });

    describe('concat', function(){

        describe('with numbers', function () {
            var c = nd.concatenate([1,0], nd.dtypes.float32);
            it('should produce a vector', function () {
                expect(c.tolist()).to.eql([1,0]);
            });
            it('should output a float32 array', function () {
                expect(c.dtype()).to.be('float32');
            });
        });


        it('can concatenate 2 vectors', function () {
            expect(nd.concatenate([[0],[1]]).tolist())
                .to.eql([0,1]);
            expect(nd.concatenate([[0],[1,2,3]]).tolist())
                .to.eql([0,1,2,3]);
            expect(nd.concatenate([[0],[1,2,3],[4]]).tolist())
                .to.eql([0,1,2,3,4]);
        });
        it('should raise an error when trying to concat array with different dims', function(){
            var a = nd.arange(12).reshape([4,3]),
                b = nd.arange(4).add(1);
            expect(function(){
                nd.concatenate([a,b]);
            }).to.throwException(function (e) {
                    expect(e.toString()).to.be('ValueError: all the input arrays must have same number of dimensions');
                });
        });
        it('should concatenate multidimensional arrays along the last axis', function(){
            var a = nd.arange(12).reshape([4,3]),
                b = nd.arange(4).add(1).reshape([4,1]),
                c = nd.arange(4*3*2).reshape([4,3,2]); // (4,3,2)

            expect(nd.concatenate([a, b]).tolist())
                .to.eql([
                    [ 0,  1,  2,  1],
                    [ 3,  4,  5,  2],
                    [ 6,  7,  8,  3],
                    [ 9, 10, 11,  4]]);
            expect(nd.concatenate([b,a]).tolist())
                .to.eql([
                    [ 1, 0,  1,  2],
                    [ 2, 3,  4,  5],
                    [ 3, 6,  7,  8],
                    [ 4, 9, 10, 11]]);
            expect(nd.concatenate([b,b]).tolist())
                .to.eql([
                    [ 1, 1],
                    [ 2, 2],
                    [ 3, 3],
                    [ 4, 4]]);
            expect(nd.concatenate([a,a]).tolist())
                .to.eql([
                    [ 0,  1,  2, 0,  1,  2],
                    [ 3,  4,  5, 3,  4,  5],
                    [ 6,  7,  8, 6,  7,  8],
                    [ 9, 10, 11, 9, 10, 11]]);
            expect(nd.concatenate([c,c]).tolist())
                .to.eql([
                    [
                        [ 0,  1,  0,  1],
                        [ 2,  3,  2,  3],
                        [ 4,  5,  4,  5]],

                    [
                        [ 6,  7,  6,  7],
                        [ 8,  9,  8,  9],
                        [10, 11, 10, 11]],

                    [
                        [12, 13, 12, 13],
                        [14, 15, 14, 15],
                        [16, 17, 16, 17]],

                    [
                        [18, 19, 18, 19],
                        [20, 21, 20, 21],
                        [22, 23, 22, 23]]]);
            expect(nd.concatenate([a.reshape([4,3,1]),c]).tolist())
                .to.eql([
                    [
                        [ 0,  0,  1],
                        [ 1,  2,  3],
                        [ 2,  4,  5]],

                    [
                        [ 3,  6,  7],
                        [ 4,  8,  9],
                        [ 5, 10, 11]],

                    [
                        [ 6, 12, 13],
                        [ 7, 14, 15],
                        [ 8, 16, 17]],

                    [
                        [ 9, 18, 19],
                        [10, 20, 21],
                        [11, 22, 23]]]);
        });
    });

    describe('transpose', function(){
        describe('matrix', function(){
            var x = nd.arange(12).reshape([4,3]),
                y = x.transpose();
            expect(x.shape()).to.eql([4,3]);
            expect(y.shape()).to.eql([3,4]);
            expect(y.tolist())
                .to.eql([
                    [ 0,  3,  6,  9],
                    [ 1,  4,  7, 10],
                    [ 2,  5,  8, 11]]);
        });
        describe('multdimensional array with custom axes', function(){
            var x = nd.arange(5*4*3*2).reshape([5,4,3,2]),
                y = x.transpose([0,2,1,3]);
            expect(x.shape()).to.eql([5,4,3,2]);
            expect(y.shape()).to.eql([5,3,4,2]);
        });
    });

    describe('neg', function(){
        it('should return -x', function(){
            expect(nd.arange(3).neg().tolist())
                .to.eql([0,-1,-2]);
            expect(nd.neg(nd.arange(3)).tolist())
                .to.eql([0,-1,-2]);
        });
    });


    describe('to string', function(){
        it('should display the array', function(){
            expect(nd.arange(6).reshape([3,2]).toString())
                .to.be('array([[0,1],[2,3],[4,5]])');
        });
        it('should display the array with dtype if different than native array', function(){
            expect(nd.arange(6, nd.dtypes.float32).reshape([3,2]).toString())
                .to.be('array([[0,1],[2,3],[4,5]], dtype=float32)');
        });
    });

    describe('iteraxis', function () {
        var x;
        beforeEach(function(){
            x = nd.arange(12).reshape([4,3]);
        });
        it('should raise an error if axis NOT valid', function(){
            expect(function(){
                x.iteraxis(2, function(xi){});
            }).to.throwException(function (e) {
                    expect(e.toString()).to.be('ValueError: invalid axis');
                });
        });
        it('can iterate over rows', function(){
            var y = [];
            x.iteraxis(0, function (xr, i) {
                y[i] = xr.tolist();
            });
            expect(x.tolist()).to.eql(y);
        });
        it('can iterate over columns', function(){
            var y = [];
            x.iteraxis(1, function (xc, i) {
                y[i] = xc.tolist();
            });
            expect(x.transpose().tolist()).to.eql(y);
        });
        it('can iterate over the last axis', function(){
            var y = [];
            x.iteraxis(-1, function (xc, i) {
                y[i] = xc.tolist();
            });
            expect(x.transpose().tolist()).to.eql(y);
        });
    });

    describe('hi', function () {
        it('should truncates from the bottom-right of the array', function () {
            expect(nd.arange(4*4).reshape([4,4]).hi(2,2).tolist())
                .to.eql([
                    [0, 1],
                    [4, 5]]);

        });
    });

    describe('lo', function () {
        it('should creates a shifted view of the array', function () {
            expect(nd.arange(4*4).reshape([4,4]).lo(2,2).tolist())
                .to.eql([
                    [10, 11],
                    [14, 15]]);

        });
    });

    describe('mean', function () {
        it('should work on vectors', function () {
            expect(nd.array([-1, 1]).mean()).to.be(0);
            expect(nd.arange(7).mean()).to.be(3);
            expect(nd.arange(10).mean()).to.be(4.5);
        });
    });

    describe('std', function () {
        it('should work on vectors', function () {
            expect(nd.array([-1,1]).std()).to.be(1);
            expect(nd.arange(7).std()).to.be(2);
        });
    });
});
