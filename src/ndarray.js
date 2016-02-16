'use strict';

var iota = require('iota-array');
var ndarray = require('ndarray');
var cwise = require('cwise');
var ops = require('ndarray-ops');
var gemm = require('ndarray-gemm');
var ndFFT = require('ndarray-fft');
var ndPool = require('typedarray-pool');

var CONF = require('./config');
var errors = require('./errors');
var _ = require('./utils');



/**
 * Multidimensional, homogeneous array of fixed-size items
 *
 * The number of dimensions and items in an array is defined by its shape, which is a tuple of N positive
 * integers that specify the sizes of each dimension. The type of items in the array is specified by a separate
 * data-type object (dtype), one of which is associated with each NdArray.
 * @constructor
 */
var NdArray = function NdArray(){
    if (arguments.length === 1){
        this.selection = arguments[0];
    }
    else if (arguments.length === 0){
        throw new errors.ValueError('Required argument \'data\' not found');
    }
    else {
        this.selection = ndarray.apply(null, arguments);
    }
    /**
     * @property {Number} NdArray#size - Number of elements in the array.
     */
    Object.defineProperty(this, 'size',{
        get: function() {
            return this.selection.size;
        }.bind(this)
    });
    /**
     * The shape of the array
     *
     * @property {Array}
     * @name NdArray#shape
     * @readonly
     */
    Object.defineProperty(this, 'shape',{
        get: function() {
            return this.selection.shape;
        }.bind(this)
    });
    /**
     * Number of array dimensions.
     *
     * @property {Number}
     * @name NdArray#ndim
     * @readonly
     */
    Object.defineProperty(this, 'ndim',{
        get: function() {
            return this.selection.shape.length;
        }.bind(this)
    });
    /**
     * Data-type of the array’s elements.
     *
     * @property {String}
     * @name NdArray#dtype
     * @see {dtypes} for more information
     */
    Object.defineProperty(this, 'dtype',{
        get: function() {
            return this.selection.dtype;
        }.bind(this),
        set: function (dtype) {
            var T = _.getType(dtype);
            this.selection = ndarray(new T(this.selection.data), this.selection.shape, this.selection.stride, this.selection.offset);
        }.bind(this)
    });
    /**
     * Permute the dimensions of the array.
     *
     * @property {String}
     * @name NdArray#T
     * @readonly
     */
    Object.defineProperty(this, 'T',{
        get: function() {
            return this.transpose();
        }.bind(this)
    });
};

NdArray.prototype.get = function(){
    return this.selection.get.apply(this.selection, arguments);
};

NdArray.prototype.set = function(){
    return this.selection.set.apply(this.selection, arguments);
};

/**
 * Return a subarray by fixing a particular axis
 *
 * @param {...(number|null)} axis
 * @returns {NdArray}
 *
 * @example
 arr = nj.arange(4*4).reshape(4,4)
 // array([[  0,  1,  2,  3],
 //        [  4,  5,  6,  7],
 //        [  8,  9, 10, 11],
 //        [ 12, 13, 14, 15]])

 arr.pick(1)
 // array([ 4, 5, 6, 7])

 arr.pick(null, 1)
 // array([  1,  5,  9, 13])
 */
NdArray.prototype.pick = function(axis){
    return new NdArray(this.selection.pick.apply(this.selection, arguments));
};

/**
 * Return a shifted view of the array. Think of it as taking the upper left corner of the image and dragging it inward
 *
 * @returns {NdArray}
 *
 * @example
 arr = nj.arange(4*4).reshape(4,4)
 // array([[  0,  1,  2,  3],
 //        [  4,  5,  6,  7],
 //        [  8,  9, 10, 11],
 //        [ 12, 13, 14, 15]])
 arr.lo(1,1)
 // array([[  5,  6,  7],
 //        [  9, 10, 11],
 //        [ 13, 14, 15]])
 */
NdArray.prototype.lo = function () {
    return new NdArray(this.selection.lo.apply(this.selection, arguments));
};

/**
 * Return a sliced view of the array.
 *
 * @returns {NdArray}
 *
 * @example

 arr = nj.arange(4*4).reshape(4,4)
 // array([[  0,  1,  2,  3],
 //        [  4,  5,  6,  7],
 //        [  8,  9, 10, 11],
 //        [ 12, 13, 14, 15]])

 arr.hi(3,3)
 // array([[  0,  1,  2],
 //        [  4,  5,  6],
 //        [  8,  9, 10]])


 arr.lo(1,1).hi(2,2)
 // array([[ 5,  6],
 //        [ 9, 10]])

 */
NdArray.prototype.hi = function () {
    return new NdArray(this.selection.hi.apply(this.selection, arguments));
};

NdArray.prototype.step = function () {
    return new NdArray(this.selection.step.apply(this.selection, arguments));
};


/**
 * Return a copy of the array collapsed into one dimension using row-major order (C-style)
 *
 * @returns {NdArray}
 */
NdArray.prototype.flatten = function () {
    if (this.shape.length === 1){ // already flattened
        return new NdArray(this.selection);
    }
    var T = _.getType(this.dtype);
    var arr = _.flatten(this.tolist(), true);
    if (!(arr instanceof T)){
        arr = new T(arr);
    }
    return new NdArray(arr, [this.size]);
};

/**
 * Gives a new shape to the array without changing its data.
 * @param {Array} shape
 * @returns {NdArray}
 */
NdArray.prototype.reshape = function(shape){
    if (arguments.length === 0) {
        throw new errors.ValueError('function takes at least one argument (0 given)');
    }
    if (arguments.length === 1 && _.isNumber(shape)){
        shape = [shape];
    }
    if (arguments.length > 1){
        shape = arguments;
    }
    if (this.size !== _.shapeSize(shape)){
        throw new errors.ValueError('total size of new array must be unchanged');
    }

    var selfShape = this.selection.shape,
        selfOffset = this.selection.offset,
        selfStride = this.selection.stride,
        selfDim = selfShape.length;

    var d = shape.length, stride, offset, i, sz;
    if (selfDim === d){
        var sameShapes = true;
        for (i=0; i<d; ++i) {
            if (selfShape[i] !== shape[i]){
                sameShapes = false;
                break;
            }
        }
        if (sameShapes){
            return new NdArray(this.selection.data, selfShape, selfStride, selfOffset);
        }
    }
    else if (selfDim === 1){
        // 1d view
        stride = new Array(d);
        for(i=d-1, sz=1; i>=0; --i) {
            stride[i] = sz;
            sz *= shape[i];
        }
        offset = selfOffset;
        for(i=0; i<d; ++i) {
            if(stride[i] < 0) {
                offset -= (shape[i]-1)*stride[i];
            }
        }
        return new NdArray(this.selection.data, shape, stride, offset);
    }

    var minDim = Math.min(selfDim, d);
    var areCompatible = true;
    for(i=0; i<minDim; i++) {
        if (selfShape[i] !== shape[i]){
            areCompatible = false;
            break;
        }
    }
    if (areCompatible){
        stride = new Array(d);
        for (i=0;i<d;i++){
            stride[i] = selfStride[i] || 1;
        }
        offset = selfOffset;
        return new NdArray(this.selection.data, shape, stride, offset);
    }
    return this.flatten().reshape(shape);
};

/**
 * Permute the dimensions of the array.
 *
 * @param {...number} [axes]
 * @returns {NdArray}
 */
NdArray.prototype.transpose = function (axes){
    if (arguments.length === 0) {
        axes = iota(this.shape.length).reverse();
    }
    else if (arguments.length > 1){
        axes = arguments;
    }
    return new NdArray(this.selection.transpose.apply(this.selection, axes));
};

/**
 * Add `x` to the array, element-wise.
 *
 * @param {(NdArray|Array|number)} x
 * @param {boolean} [copy=true]
 * @returns {NdArray}
 */
NdArray.prototype.add = function(x, copy){
    if (arguments.length === 1){
        copy = true;
    }
    var arr = copy ? this.clone() : this;

    if (_.isNumber(x)){
        ops.addseq(arr.selection, x);
        return arr;
    }
    x = createArray(x, this.dtype);
    ops.addeq(arr.selection, x.selection);
    return arr;
};

/**
 * Subtract `x` to the array, element-wise.
 *
 * @param {(NdArray|Array|number)} x
 * @param {boolean} [copy=true]
 * @returns {NdArray}
 */
NdArray.prototype.subtract = function(x, copy){
    if (arguments.length === 1){
        copy = true;
    }
    var arr = copy ? this.clone() : this;

    if (_.isNumber(x)){
        ops.subseq(arr.selection, x);
        return arr;
    }
    x = createArray(x, this.dtype);
    ops.subeq(arr.selection, x.selection);
    return arr;
};

/**
 * Multiply array by `x`, element-wise.
 *
 * @param {(NdArray|Array|number)} x
 * @param {boolean} [copy=true]
 * @returns {NdArray}
 */
NdArray.prototype.multiply = function(x, copy){
    if (arguments.length === 1){
        copy = true;
    }
    var arr = copy ? this.clone() : this;
    if (_.isNumber(x)){
        ops.mulseq(arr.selection, x);
        return arr;
    }

    x = createArray(x, this.dtype);
    ops.muleq(arr.selection, x.selection);

    return arr;
};

/**
 * Divide array by `x`, element-wise.
 *
 * @param {(NdArray|Array|number)} x
 * @param {boolean} [copy=true]
 * @returns {NdArray}
 */
NdArray.prototype.divide = function(x, copy){
    if (arguments.length === 1){
        copy = true;
    }
    var arr = copy ? this.clone() : this;
    if (_.isNumber(x)){
        ops.divseq(arr.selection, x);
        return arr;
    }

    x = createArray(x, this.dtype);
    ops.diveq(arr.selection, x.selection);

    return arr;
};

/**
 * Raise array elements to powers from given array, element-wise.
 *
 * @param {(NdArray|Array|number)} x
 * @param {boolean} [copy=true] - set to false to modify the array rather than create a new one
 * @returns {NdArray}
 */
NdArray.prototype.pow = function(x, copy){
    if (arguments.length === 1){ copy = true; }
    var arr = copy ? this.clone() : this;
    if (_.isNumber(x)){
        ops.powseq(arr.selection, x);
        return arr;
    }

    x = createArray(x, this.dtype);
    ops.poweq(arr.selection, x.selection);
    return arr;
};

/**
 * Calculate the exponential of all elements in the array, element-wise.
 *
 * @param {boolean} [copy=true] - set to false to modify the array rather than create a new one
 * @returns {NdArray}
 */
NdArray.prototype.exp = function(copy){
    if (arguments.length === 0){ copy = true; }
    var arr = copy ? this.clone(): this ;
    ops.expeq(arr.selection);
    return arr;
};

/**
 * Calculate the positive square-root of all elements in the array, element-wise.
 *
 * @param {boolean} [copy=true] - set to false to modify the array rather than create a new one
 * @returns {NdArray}
 */
NdArray.prototype.sqrt = function(copy){
    if (arguments.length === 0){ copy = true; }
    var arr = copy ? this.clone(): this;
    ops.sqrteq(arr.selection);
    return arr;
};


/**
 * Return the maximum value of the array
 *
 * @returns {Number}
 */
NdArray.prototype.max = function () {
    if (this.selection.size === 0){
        return null;
    }
    return ops.sup(this.selection);
};

/**
 * Return the minimum value of the array
 *
 * @returns {Number}
 */
NdArray.prototype.min = function () {
    if (this.selection.size === 0){
        return null;
    }
    return ops.inf(this.selection);
};

/**
 * Sum of array elements.
 *
 * @returns {number}
 */
NdArray.prototype.sum = function(){
    return ops.sum(this.selection);
};

/**
 * Returns the standard deviation, a measure of the spread of a distribution, of the array elements.
 *
 * @returns {number}
 */
NdArray.prototype.std = function(){
    var squares = this.clone();
    ops.powseq(squares.selection, 2);
    var mean =  this.mean(),
        variance = Math.abs(ops.sum(squares.selection) / _.shapeSize(this.shape) - mean * mean);
    return variance > 0 ? Math.sqrt(variance): 0;
};

/**
 * Return the arithmetic mean of array elements.
 *
 * @returns {number}
 */
NdArray.prototype.mean = function(){
    return ops.sum(this.selection) / _.shapeSize(this.shape);
};


/**
 * Converts {NdArray} to a native JavaScript {Array}
 *
 * @returns {Array}
 */
NdArray.prototype.tolist = function(){
    return unpackArray(this.selection);
};

NdArray.prototype.valueOf = function(){
    return this.tolist();
};
/**
 * Stringify the array to make it readable by a human.
 *
 * @returns {string}
 */
NdArray.prototype.toString = function(){
    var nChars = formatNumber(this.max()).length;

    var reg1 = /\]\,(\s*)\[/g,
        spacer1  = '],\n$1      [',
        reg3 = /\]\,(\s+)...\,(\s+)\[/g,
        spacer3  = '],\n$2       ...\n$2      [',
        reg2 = /\[\s+\[/g,
        spacer2  = '[[';

    function formatArray(k, v){
        if (_.isString(v)){ return v; }
        if (_.isNumber(v)){
            var s = formatNumber(v);
            return new Array(Math.max(0, nChars - s.length +2)).join(' ') + s;
        }
        k = k || 0;
        var arr, th = CONF.printThreshold, hth = th / 2 | 0;
        if (v.length>th){
            arr = [].concat(v.slice(0, hth ), [' ...'], v.slice(v.length - hth));
        }
        else {
            arr = v;
        }
        return new Array(k+1).join(' ')+'[' + arr.map(function(i, ii){ return formatArray(ii === 0 && k === 0? 1: k+1, i); }).join(',') + ']';
    }


    var base = JSON
        .stringify(this.tolist(), formatArray)
        .replace(reg1, spacer1)
        .replace(reg2, spacer2)
        .replace(reg2, spacer2)
        .replace(reg3, spacer3)
        .slice(2,-1);
    switch (this.dtype){
        case 'array':
            return 'array([' + base + ')';
        default:
            return 'array([' + base + ', dtype=' + this.dtype + ')';
    }
};

/**
 * Stringify the array to make it readable in the console, by a human.
 *
 * @returns {string}
 */
NdArray.prototype.inspect = NdArray.prototype.toString;

/**
 * Stringify object to JSON
 * @returns {*}
 */
NdArray.prototype.toJSON = function () {
    return JSON.stringify(this.tolist());
};

/**
 * Create a full copy of the array
 *
 * @returns {NdArray}
 */
NdArray.prototype.clone = function () {
    var s = this.selection;
    return new NdArray(ndarray(s.data.slice(), s.shape, s.stride, s.offset));
};


/**
 * Return true if two arrays have the same shape and elements, false otherwise.
 * @param {(Array|NdArray)} array
 * @returns {boolean}
 */
NdArray.prototype.equal = function(array){
    array = createArray(array);
    if (this.size !== array.size || this.ndim !== array.ndim){
        return false;
    }
    var d = this.ndim;
    for (var i=0;i<d; i++){
        if (this.shape[i] !== array.shape[i]){
            return false;
        }
    }

    return ops.all(ops.eqeq(this.selection, array.selection));
};



/**
 * Round array to the to the nearest integer.
 *
 * @param {boolean} [copy=true]
 * @returns {NdArray}
 */
NdArray.prototype.round = function (copy) {
    if (arguments.length === 0){
        copy = true;
    }
    var arr = copy ? this.clone() : this;
    ops.roundeq(arr.selection);
    return arr;
};

/**
 * Return the inverse of the array, element-wise.
 *
 * @returns {NdArray}
 */
NdArray.prototype.negative = function(){
    var c = this.clone();
    ops.neg(c.selection, this.selection);
    return c;
};


NdArray.prototype.iteraxis = function(axis, cb){
    var shape = this.shape;
    if (axis === -1){
        axis = shape.length - 1;
    }
    if (axis < 0 || axis > shape.length -1){
        throw new errors.ValueError('invalid axis');
    }
    for (var i=0; i<shape[axis];i++){
        var loc = new Array(axis + 1);
        for (var ii=0; ii<axis+1;ii++){
            loc[ii] = (ii === axis) ? i: null;
        }
        var subArr = this.selection.pick.apply(this.selection, loc);
        var xi = createArray(unpackArray(subArr), this.dtype);
        cb(xi, i);
    }
};

var doConjMuleq = cwise({
    args: ['array', 'array', 'array', 'array'],
    body: function(xi, yi, ui, vi) {
        var a = ui, b = vi, c = xi, d = yi,
            k1 = c * (a + b);
        xi = k1 - b * (c + d);
        yi = k1 + a * (d - c);
    }
});

/**
 * Returns the discrete, linear convolution of the array using the given filter.
 *
 * @note: Arrays must have the same dimensions and `filter` must be smaller than the array.
 * @note: The convolution product is only given for points where the signals overlap completely. Values outside the signal boundary have no effect. This behaviour is known as the 'valid' mode.
 *
 * @param {Array|NdArray} filter
 */
NdArray.prototype.convolve = function(filter){
    filter = NdArray.new(filter);

    if (this.ndim !== filter.ndim){
        throw new errors.ValueError('arrays must have the same dimensions');
    }

    var as = this.selection,
        bs = filter.selection;
    var d = this.ndim,
        nsize = 1,
        nstride = new Array(d),
        nshape = new Array(d),
        oshape = new Array(d),
        i;
    for(i=d-1; i>=0; --i) {
        nshape[i] = as.shape[i];
        nstride[i] = nsize;
        nsize *= nshape[i];
        oshape[i] = as.shape[i] - bs.shape[i] + 1;
    }

    var T = _.getType(as.dtype),
        out = new NdArray(new T(_.shapeSize(oshape)), oshape),
        outs = out.selection;

    var xT = ndPool.mallocDouble(nsize),
        x = ndarray(xT, nshape, nstride, 0);
    ops.assigns(x, 0);
    ops.assign(x.hi.apply(x, as.shape), as);

    var yT = ndPool.mallocDouble(nsize),
        y = ndarray(yT, nshape, nstride, 0);
    ops.assigns(y, 0);

    //FFT x/y
    ndFFT(1, x, y);

    var uT = ndPool.mallocDouble(nsize),
        u = ndarray(uT, nshape, nstride, 0);
    ops.assigns(u, 0);
    ops.assign(u.hi.apply(u, bs.shape), bs);

    var vT = ndPool.mallocDouble(nsize),
        v = ndarray(vT, nshape, nstride, 0);
    ops.assigns(v, 0);


    ndFFT(1, u, v);

    doConjMuleq(x, y, u, v);

    ndFFT(-1, x, y);

    var outShape = new Array(d),
        outOffset = new Array(d),
        needZeroFill = false;
    for(i=0; i<d; ++i) {
        if(outs.shape[i] > nshape[i]) {
            needZeroFill = true;
        }
        outOffset[i] = + bs.shape[i] - 1;
        outShape[i] = Math.min(outs.shape[i], nshape[i]-outOffset[i]);
    }

    var croppedX;
    if(needZeroFill) {
        ops.assign(outs, 0.0);
    }
    croppedX = x.lo.apply(x, outOffset);
    croppedX = croppedX.hi.apply(croppedX, outShape);
    ops.assign(outs.hi.apply(outs, outShape), croppedX);

    ndPool.freeDouble(xT);
    ndPool.freeDouble(yT);
    ndPool.freeDouble(uT);
    ndPool.freeDouble(vT);
    return out;
};

function createArray(arr, dtype){
    if (arr instanceof NdArray){ return arr; }
    var T = _.getType(dtype);
    if (_.isNumber(arr)){
        if (T !== Array){
            return new NdArray(new T([arr]), [1]);
        }
        else {
            return new NdArray([arr], [1]);
        }

    }
    var shape = _.getShape(arr);
    if (shape.length > 1){
        arr = _.flatten(arr, true);
    }
    if (!(arr instanceof T)){
        arr = new T(arr);
    }
    return new NdArray(arr, shape);
}
NdArray.new = createArray;

module.exports = NdArray;


/*     utils    */

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

function formatNumber(v){
    return String(Number((v || 0).toFixed(CONF.nFloatingValues)));
}

