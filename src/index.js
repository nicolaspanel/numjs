'use strict';

var ndarray = require('ndarray');
var cwise = require('cwise');
var ops = require('ndarray-ops');
var errors = require('./errors');
var gemm = require('ndarray-gemm');
var ndFFT = require('ndarray-fft');
var ndPool = require('typedarray-pool');
var _ = require('lodash');

var DTYPES = {
    int8: Int8Array,
    int16: Int16Array,
    int32: Int32Array,
    uint8: Uint8Array,
    uint16: Uint16Array,
    uint32: Uint32Array,
    float32: Float32Array,
    float64: Float64Array
};

function initNativeArray(shape, i){
    i = i || 0;
    var c = shape[i]|0;
    if(c <= 0) {
        return [];
    }
    var result = new Array(c), j;
    if(i === shape.length-1) {
        for(j=0; j<c; ++j) {
            result[j] = 0;
        }
    } else {
        for(j=0; j<c; ++j) {
            result[j] = initNativeArray(shape, i+1);
        }
    }
    return result;
}

var doUnpack = cwise({
    args: ['array', 'scalar', 'index'],
    body: function unpackCwise(arr, a, idx) {
        var v = a, i;
        for(i=0;i<idx.length-1;++i) {
            v=v[idx[i]];
        }
        v[idx[idx.length-1]]=arr;
    }
});

function unpackArray(arr) {
    var result = initNativeArray(arr.shape, 0);
    doUnpack(arr, result);
    return result;
}

function size(shape){
    return _.reduce(shape || [], function(m, i){ return m*i; }, 1);
}

function locateIndex(index, shape){
    var max = size(shape);
    if (index < 0 || index >= max){
        throw new errors.ValueError('index must be gt 0 and lt "'+max+'"');
    }
    return []
        .concat(shape)
        .reverse()
        .map(function(d){
            var i = index % d;
            index -= i;
            index /= d;
            return i;
        })
        .reverse();
}

function _dim(x) {
    var ret = [];
    while(typeof x === 'object') { ret.push(x.length); x = x[0]; }
    return ret;
}

function dim(x) {
    var y,z;
    if(typeof x === 'object') {
        y = x[0];
        if(typeof y === 'object') {
            z = y[0];
            if(typeof z === 'object') {
                return _dim(x);
            }
            return [x.length,y.length];
        }
        return [x.length];
    }
    return [];
}

function getType(dtype){
    return _.isFunction(dtype)? dtype: (DTYPES[dtype] || Array);
}

function haveSameShape(shape1, shape2){
    return size(shape1) === size(shape2) && _.every(_.zip(shape1, shape2),function(pair){ return pair[0] === pair[1]; });
}

function broadcast(shape1, shape2) {
    if (_.isEmpty(shape1) || _.isEmpty(shape2)){
        return;
    }
    var reversed1 = [].concat(shape1).reverse();
    var reversed2 = [].concat(shape2).reverse();
    var bcst = _
        .chain(_.zip(reversed1, reversed2))
        .map(function(pair){
            if (!pair[0] || pair[0] === 1){ return pair[1]; }
            if (!pair[1] || pair[1] === 1){ return pair[0]; }
            if (pair[0] === pair[1]){ return pair[0]; }
        })
        .reverse()
        .value();
    return _.every(bcst)? bcst: undefined;
}

var NdArray = function NdArray(data, shape, stride, offset){
    if (arguments.length === 1){
        this.selection = data;
    }
    else if (arguments.length === 0){
        throw new errors.ValueError('array expected');
    }
    else {
        this.selection = ndarray(data, shape, stride, offset);
    }
};

NdArray.prototype.shape = function(){
    return this.selection.shape;
};

NdArray.prototype.pick = function(){
    return new NdArray(this.selection.pick.apply(this.selection, arguments));
};

NdArray.prototype.lo = function () {
    return new NdArray(this.selection.lo.apply(this.selection, arguments));
};

NdArray.prototype.hi = function () {
    return new NdArray(this.selection.hi.apply(this.selection, arguments));
};

NdArray.prototype.add = function(value){
    var shape = this.shape();
    var type = getType(this.dtype());
    var result = this.clone();
    if (_.isNumber(value)){
        ops.addseq(result.selection, value);
        return result;
    }
    if (value instanceof NdArray){
        ops.addeq(result.selection, value.selection);
        return result;
    }
    throw new errors.ValueError('value must be a number or an array');
};

NdArray.prototype.mul = function(value){
    var type = getType(this.dtype());
    var result, shape;
    if (_.isNumber(value)){
        shape = this.shape();
        result = new NdArray(new type(size(shape)), shape);
        ops.muls(result.selection, this.selection, value);
        return result;
    }
    if (!(value instanceof NdArray)){
        throw new Error('value must be a scalar or an array');
    }
    shape = broadcast(this.shape(), value.shape());
    if (!shape){
        throw new errors.ValueError('dimensions are not broadcastable');
    }
    result = new NdArray(new type(size(shape)), shape);
    ops.mul(result.selection, this.selection, value.selection);
    return result;
};

NdArray.prototype.reshape = function(shape){
    var currentShape = this.selection.shape;
    var currentSize = size(currentShape);
    var newSize = size(shape);
    if (currentSize !== newSize){
        throw new errors.ValueError('total size of new array must be unchanged');
    }
    else if (haveSameShape(currentShape, shape)){
        throw new Error('shape should change');
    }
    return new NdArray(this.selection.data.slice(), shape);
};

NdArray.prototype.dtype = function(dtype){
    if (!arguments.length){
        return this.selection.dtype;
    }
    var type = getType(dtype);
    if (type === getType(this.selection.dtype)){
        return;
    }
    this.selection = ndarray(new type(this.selection.data), this.shape());
    return this;
};

NdArray.prototype.tolist = function(){
    return unpackArray(this.selection);
};

NdArray.prototype.clone = function () {
    var s = this.selection,
        clone = ndarray(s.data.slice(), s.shape, s.stride, s.offset);
    return new NdArray(clone);
};

NdArray.prototype.exp = function(){
    var arr = this.clone() ;
    ops.expeq(arr.selection);
    return arr;
};

NdArray.prototype.sum = function(){
    return ops.sum(this.selection);
};

NdArray.prototype.mean = function(){
    return ops.sum(this.selection) / size(this.shape());
};

NdArray.prototype.std = function(){
    var squares = this.clone();
    ops.powseq(squares.selection, 2);
    var mean =  this.mean(),
        variance = Math.abs(ops.sum(squares.selection) / size(this.shape()) - mean * mean);
    return variance > 0? Math.sqrt(variance): 1;
};

NdArray.prototype.transpose = function (axes){
    var xT = this.clone();
    var shape = this.shape();
    if (shape.length === 1){
        return xT; // no transpose
    }
    if (_.isUndefined(axes)) {
        axes = _.range(shape.length).reverse();
    }
    xT.selection = xT.selection.transpose.apply(xT.selection, axes);
    return xT;
};

NdArray.prototype.neg = function(){
    var c = this.clone();
    ops.neg(c.selection, this.selection);
    return c;
};

NdArray.prototype.get = function(){
    return this.selection.get.apply(this.selection, arguments);
};

NdArray.prototype.set = function(){
    return this.selection.set.apply(this.selection, arguments);
};

NdArray.prototype.toString = function(){
    var dtype = this.dtype();
    if (dtype === 'array') {
        return 'array(' + JSON.stringify(this.tolist()) + ')';
    }
    else {
        return 'array(' + JSON.stringify(this.tolist()) + ', dtype='+dtype+')';
    }
};

NdArray.prototype.iteraxis = function(axis, cb){
    var shape = this.shape();
    if (axis === -1){
        axis = shape.length - 1;
    }
    if (axis < 0 || axis > shape.length -1){
        throw new errors.ValueError('invalid axis');
    }
    for (var i=0; i<shape[axis];i++){
        var loc = _.map(_.range(axis + 1), function(ii){ return ii === axis? i: null; });
        var subArr = this.selection.pick.apply(this.selection, loc);
        var xi = createArray(unpackArray(subArr), this.dtype());
        cb(xi, i);
    }
};

function createArray(arr, dtype){
    if (arr instanceof NdArray){ return arr; }
    var type = getType(dtype);
    if (_.isNumber(arr)){
        if (type !== Array){
            return new NdArray(new type([arr]), [1]);
        }
        else {
            return new NdArray([arr], [1]);
        }

    }

    var shape = dim(arr);
    if (shape.length > 1){
        arr = _.flattenDeep(arr);
    }
    if (!(arr instanceof type)){
        arr = new type(arr);
    }
    return new NdArray(arr, shape);
}

function arange(n, dtype) {
    var arr = _.range(n);
    return createArray(arr, dtype);
}

function zeros(shape, dtype){
    if (_.isNumber(shape) && shape >=0){
        shape = [shape];
    }
    else if (!_.isArray(shape)){
        throw new Error('shape must be a positive integer or an array');
    }
    var s = size(shape);
    var type = getType(dtype);
    var arr =  new NdArray(new type(s), shape);
    ops.assigns(arr.selection, 0);
    return arr;
}

function ones(shape, dtype){
    if (_.isNumber(shape) && shape >=0){
        shape = [shape];
    }
    else if (!_.isArray(shape)){
        throw new Error('shape must be a positive integer or an array');
    }
    var s = size(shape);
    var type = getType(dtype);
    var arr =  new NdArray(new type(s), shape);
    ops.assigns(arr.selection, 1);
    return arr;
}

function random(shape, dtype){
    if (_.isNumber(shape) && shape >=0){
        shape = [shape];
    }
    else if (!_.isArray(shape)){
        throw new Error('shape must be a positive integer or an array');
    }
    var s = size(shape);
    var type = getType(dtype);
    var arr =  new NdArray(new type(s), shape);
    ops.random(arr.selection);
    return arr;
}

function softmax(x){
    var e = (x instanceof NdArray)? x.exp(): createArray(x).exp();
    var se = e.sum(); // scalar
    ops.divseq(e.selection, se);
    return e;
}

function exp(x){
    if (_.isNumber(x)){ return Math.exp(x); }
    return (x instanceof NdArray)? x.exp() : createArray(x).exp();
}

function sum(x){
    if (_.isNumber(x)){ return x; }
    return (x instanceof NdArray)? x.sum() : createArray(x).sum();
}

function mean(x){
    if (_.isNumber(x)){ return x; }
    return (x instanceof NdArray)? x.mean() : createArray(x).mean();
}

function std(x){
    if (_.isNumber(x)){ return 0; }
    return (x instanceof NdArray)? x.std() : createArray(x).std();
}


var doSigmoid = cwise({
    args: ['array', 'scalar'],
    body: function sigmoidCwise(a, t) {
        a = a < -30? 0: a > 30? 1: 1 / (1 + Math.exp(-1 * t * a));
    }
});
function sigmoid(x, t){
    var s = (x instanceof NdArray)? x.clone(): createArray(x);
    t = t || 1;
    doSigmoid(s.selection, t);
    return s;
}

var doClip = cwise({
    args: ['array', 'scalar', 'scalar'],
    body: function clipCwise(a, min, max) {
        a = Math.min(Math.max(min, a), max);
    }
});

function clip(x, min, max){
    var s = (x instanceof NdArray)? x.clone(): createArray(x);
    doClip(s.selection, min, max);
    return s;
}

var doLeakyRelu = cwise({
    args: ['array', 'scalar'],
    body: function leakyReluCwise(xi, alpha) {
        xi = Math.max(alpha * xi, xi);
    }
});

function leakyRelu(x, alpha){
    alpha = alpha || 1e-3;
    var s = (x instanceof NdArray)? x.clone(): createArray(x);
    doLeakyRelu(s.selection, alpha);
    return s;
}


var doTanh = cwise({
    args: ['array'],
    body: function tanhCwise(xi) {
        xi = (Math.exp(2*xi) - 1) / (Math.exp(2*xi) + 1);
    }
});

function tanh(x){
    var s = (x instanceof NdArray)? x.clone(): createArray(x);
    doTanh(s.selection);
    return s;
}

function dot(a,b){
    var xa = (a instanceof NdArray)? a: createArray(a);
    var xb = (b instanceof NdArray)? b: createArray(b);
    var xaShape = xa.shape(),
        xbShape = xb.shape();
    var shape, c, rxa, rxb, type = getType(xa.dtype());

    if (xaShape.length === 2 && xbShape.length === 2){
        shape = [xaShape[0], xbShape[1]];
        c = new NdArray(new type(size(shape)), shape);
        gemm(c.selection, xa.selection, xb.selection);
        return c;
    }
    else if (xaShape.length === 1 && xbShape.length === 2){
        shape = [1, xbShape[1]];
        rxa = xa.reshape([1, xaShape[0]]);
        c = new NdArray(new type(size(shape)), shape);
        gemm(c.selection, rxa.selection, xb.selection);
        return c.reshape([xbShape[1]]);
    }
    else if (xaShape.length === 1 && xbShape.length === 1 && xaShape[0] === xbShape[0]){
        shape = [1, 1];
        rxa = xa.reshape([1, xaShape[0]]);
        rxb = xb.reshape([xbShape[0], 1]);
        c = new NdArray(new type(size(shape)), shape);
        gemm(c.selection, rxa.selection, rxb.selection);
        return c.reshape([1]);
    }
    else {
        throw new errors.NotImplementedError();
        //throw new errors.ValueError('shapes ('+xaShape[0]+',) and ('+xbShape[0]+',) not aligned: '+xaShape[0]+ '(dim 0) != '+xbShape[0]+' (dim 0)');
    }
}

function mul(a,b){
    var x = (a instanceof NdArray)? a: createArray(a);
    return x.mul(b);
}

function concatenate(arrays, dtype){
//    if (_.some(arrays, function(a){return  _.isNumber(a); })){
//        throw new errors.ValueError('zero-dimensional arrays cannot be concatenated');
//    }

    var c = _
        .chain(arrays)
        .map(function(a){ return (a instanceof NdArray)? a.tolist(): _.isNumber(a)? [a] : a  ; })
        .reduce(function(m, data){
            if (m === null){ return data; }

            var mShape = dim(m);
            var dShape = dim(data);
            if (mShape.length !== dShape.length){
                throw new errors.ValueError('all the input arrays must have same number of dimensions');
            }

            if (mShape.length === 1 && dShape.length === 1){
                return m.concat(data);
            }
            if ((mShape.length === 2 && dShape.length === 2 && mShape[0] === dShape[0]) ||
                (mShape.length === 1 && dShape.length === 2 && mShape[0] === dShape[0]) ||
                (mShape.length === 2 && dShape.length === 1 && mShape[0] === dShape[0])){
                return _.map(_.zip(m, data), function (d) { return [].concat.apply([],d); });
            }
            if ((mShape.length === 3 && dShape.length === 3 && mShape[0] === dShape[0] && mShape[1] === dShape[1]) ||
                (mShape.length === 2 && dShape.length === 3 && mShape[0] === dShape[0] && mShape[1] === dShape[1]) ||
                (mShape.length === 3 && dShape.length === 2 && mShape[0] === dShape[0] && mShape[1] === dShape[1])){
                return _.map(_.zip(m, data), function (d) {
                    return _.map(_.zip.apply(null, d), function (dd){
                        return [].concat.apply([],dd);
                    });
                });
            }
            throw new errors.ValueError('cannot concatenate  "'+mShape+'" with "'+dShape+'"');
        }, null)
        .value();
    return createArray(c, dtype);
}

function transpose(x, axes){
    var xArray = (x instanceof NdArray)? x: createArray(x);
    return xArray.transpose(axes);
}

function add(a,b){
    return a.add(b);
}

function neg(x){
    var xArray = (x instanceof NdArray)? x: createArray(x);
    return xArray.neg();
}

module.exports = {
    dtypes: DTYPES,
    NdArray: NdArray,
    ndarray: ndarray,
    array: createArray,
    arange: arange,
    zeros: zeros,
    ones: ones,
    random: random,
    softmax: softmax,
    sigmoid: sigmoid,
    leakyRelu: leakyRelu,
    tanh: tanh,
    clip: clip,
    exp: exp,
    sum: sum,
    mean: mean,
    std: std,
    dot: dot,
    add: add,
    neg: neg,
    mul: mul,
    size: size,
    concatenate: concatenate,
    transpose: transpose,
    errors: errors,
    broadcast: broadcast,
    locate: locateIndex,
    //cwise: cwise,
    fft: ndFFT,
    ops: ops,
    pool: ndPool
};

_.forEach(DTYPES, function(v,k){
    module.exports[k] = function(arr){ return createArray(arr, k); };
});