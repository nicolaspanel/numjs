'use strict';

var iota = require('iota-array');
var ndarray = require('ndarray');
var cwise = require('cwise');
var ops = require('ndarray-ops');
var errors = require('./errors');
var gemm = require('ndarray-gemm');
var ndFFT = require('ndarray-fft');
var ndPool = require('typedarray-pool');

var CONF = {
    printThreshold: 7,
    nFloatingValues: 5
},  DTYPES = {
    int8: Int8Array,
    int16: Int16Array,
    int32: Int32Array,
    uint8: Uint8Array,
    uint16: Uint16Array,
    uint32: Uint32Array,
    float32: Float32Array,
    float64: Float64Array
};

function formatNumber(v){
    return String(Number((v || 0).toFixed(CONF.nFloatingValues)));
}

function isNumber(value) {
    return typeof value === 'number';
}
function isString(value) {
    return typeof value === 'string';
}
function isFunction(value){
    return typeof value === 'function';
}

function baseFlatten(array, isDeep, result) {
    result = result || [];
    var index = -1,
        length = array.length;

    while (++index < length) {
        var value = array[index];
        if (isNumber(value)) {
            result[result.length] = value;
        } else if (isDeep) {
            // Recursively flatten arrays (susceptible to call stack limits).
            baseFlatten(value, isDeep, result);
        } else {
            result.push(value);
        }
    }

    return result;
}

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
    var s = 1;
    for (var i = 0; i < shape.length; i++){
        s *= shape[i];
    }
    return s;
}

//function locateIndex(index, shape){
//    var max = size(shape);
//    if (index < 0 || index >= max){
//        throw new errors.ValueError('index must be gt 0 and lt "'+max+'"');
//    }
//    return []
//        .concat(shape)
//        .reverse()
//        .map(function(d){
//            var i = index % d;
//            index -= i;
//            index /= d;
//            return i;
//        })
//        .reverse();
//}

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
    return isFunction(dtype)? dtype: (DTYPES[dtype] || Array);
}

function haveSameShape(shape1, shape2){
    if (size(shape1) !== size(shape2)){
        return false;
    }
    var d = shape1.length;
    for (var i= 0; i<d;i++){
        if (shape1[i] !== shape2[i]){
            return false;
        }
    }
    return true;
}

function broadcast(shape1, shape2) {
    if (shape1.length === 0 || shape2.length === 0){
        return;
    }
    var reversed1 = shape1.slice().reverse();
    var reversed2 = shape2.slice().reverse();

    var maxLength = Math.max(shape1.length, shape2.length);
    var outShape = new Array(maxLength);
    for (var i = 0; i<maxLength; i++){
        if (!reversed1[i] || reversed1[i] === 1){
            outShape[i] = reversed2[i];
        }
        else if (!reversed2[i] || reversed2[i] === 1){
            outShape[i] = reversed1[i];
        }
        else if (reversed1[i] === reversed2[i]){
            outShape[i] = reversed1[i];
        }
        else {
            return;
        }
    }

    return outShape.reverse();
}

/**
 * Multidimensional, homogeneous array of fixed-size items
 *
 * The number of dimensions and items in an array is defined by its shape, which is a tuple of N positive
 * integers that specify the sizes of each dimension. The type of items in the array is specified by a separate
 * data-type object (dtype), one of which is associated with each NdArray.
 * @constructor
 */
var NdArray = function NdArray(data, shape, stride, offset){
    if (arguments.length === 1){
        this.selection = data;
    }
    else if (arguments.length === 0){
        throw new errors.ValueError('Required argument \'data\' not found');
    }
    else {
        this.selection = ndarray(data, shape, stride, offset);
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
            var T = getType(dtype);
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

    if (isNumber(x)){
        ops.addseq(arr.selection, x);
        return arr;
    }
    x = createArray(x, this.dtype);
    ops.addeq(arr.selection, x.selection);
    return arr;
};

/**
 * Add arguments, element-wise.
 *
 * @param {(NdArray|Array|number)} a
 * @param {(NdArray|Array|number)} b
 * @returns {NdArray}
 */
function add(a,b){
    return createArray(a).add(b);
}

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

    if (isNumber(x)){
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
    if (isNumber(x)){
        ops.mulseq(arr.selection, x);
        return arr;
    }

    x = createArray(x, this.dtype);
    ops.muleq(arr.selection, x.selection);

    return arr;
};
/**
 * Multiply arguments, element-wise.
 *
 * @param {(Array|NdArray)} a
 * @param {(Array|NdArray|number)} b
 * @returns {NdArray}
 */
function multiply(a,b){
    return createArray(a).multiply(b);
}

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
    if (isNumber(x)){
        ops.divseq(arr.selection, x);
        return arr;
    }

    x = createArray(x, this.dtype);
    ops.diveq(arr.selection, x.selection);

    return arr;
};
/**
 * Divide `a` by `b`, element-wise.
 *
 * @param {(Array|NdArray)} a
 * @param {(Array|NdArray|number)} b
 * @returns {NdArray}
 */
function divide(a,b){
    return createArray(a).divide(b);
}

/**
 * Subtract second argument from the first, element-wise.
 *
 * @param {(NdArray|Array|number)} a
 * @param {(NdArray|Array|number)} b
 * @returns {NdArray}
 */
function subtract(a,b){
    return createArray(a).subtract(b);
}


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
function max(array){
    return createArray(array).max();
}


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
function min(array){
    return createArray(array).min();
}


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
 * Return true if two arrays have the same shape and elements, false otherwise.
 * @param {(Array|NdArray)} array1
 * @param {(Array|NdArray)} array2
 * @returns {boolean}
 */
function equal(array1, array2){
    return createArray(array1).equal(array2);
}



/**
 * Return a copy of the array collapsed into one dimension using row-major order (C-style)
 *
 * @returns {NdArray}
 */
NdArray.prototype.flatten = function () {
    if (this.shape.length === 1){ // already flattened
        return new NdArray(this.selection);
    }
    var T = getType(this.dtype);
    var arr = baseFlatten(this.tolist(), true);
    if (!(arr instanceof T)){
        arr = new T(arr);
    }
    return new NdArray(arr, [this.size]);
};

/**
 * Return a copy of the array collapsed into one dimension using row-major order (C-style)

 * @param {(Array|NdArray)} array
 * @returns {NdArray}
 */
function flatten(array){
    return createArray(array).flatten();
}


/**
 * Gives a new shape to the array without changing its data.
 * @param {Array} shape
 * @returns {NdArray}
 */
NdArray.prototype.reshape = function(shape){
    if (arguments.length === 0) {
        throw new errors.ValueError('function takes at least one argument (0 given)');
    }
    if (arguments.length === 1 && isNumber(shape)){
        shape = [shape];
    }
    if (arguments.length > 1){
        shape = arguments;
    }
    var newSize = size(shape);
    if (this.size !== newSize){
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
 * Gives a new shape to an array without changing its data.
 * @param {(Array|NdArray)} array
 * @param {Array} shape - The new shape should be compatible with the original shape. If an integer, then the result will be a 1-D array of that length
 * @returns {NdArray}
 */
function reshape(array, shape){
    return createArray(array).reshape(shape);
}


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
        if (isString(v)){ return v; }
        if (isNumber(v)){
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
 * Calculate the exponential of all elements in the array, element-wise.
 *
 * @returns {NdArray}
 */
NdArray.prototype.exp = function(){
    var arr = this.clone() ;
    ops.expeq(arr.selection);
    return arr;
};
/**
 * Calculate the exponential of all elements in the input array, element-wise.
 * @param {(Array|NdArray|number)} x
 * @returns {NdArray}
 */
function exp(x){
    return createArray(x).exp();
}
/**
 * Calculate the positive square-root of all elements in the input array, element-wise.
 * @param {(Array|NdArray|number)} x
 * @returns {NdArray}
 */
function sqrt(x){
    var s = (x instanceof NdArray)? x.clone(): createArray(x);
    ops.sqrteq(s.selection);
    return s;
}


/**
 * Raise array elements to powers from given array, element-wise.
 *
 * @param {(NdArray|Array|number)} x
 * @param {boolean} [copy=true] - set to false to modify the array rather than create a new one
 * @returns {NdArray}
 */
NdArray.prototype.pow = function(x, copy){
    if (arguments.length === 1){
        copy = true;
    }
    var arr = copy ? this.clone() : this;
    if (isNumber(x)){
        ops.powseq(arr.selection, x);
        return arr;
    }

    x = createArray(x, this.dtype);
    ops.poweq(arr.selection, x.selection);
    return arr;
};

/**
 * Raise first array elements to powers from second array, element-wise.
 *
 * @param {(Array|NdArray|number)} x1
 * @param {(Array|NdArray|number)} x2
 * @returns {NdArray}
 */
function power(x1, x2){
    return createArray(x1).pow(x2);
}

/**
 * Sum of array elements.
 *
 * @returns {number}
 */
NdArray.prototype.sum = function(){
    return ops.sum(this.selection);
};

/**
 * Return the sum of input array elements.
 *
 * @param {(Array|NdArray|number)} x
 * @returns {number}
 */
function sum(x){
    return createArray(x).sum();
}

/**
 * Return the arithmetic mean of array elements.
 *
 * @returns {number}
 */
NdArray.prototype.mean = function(){
    return ops.sum(this.selection) / size(this.shape);
};

/**
 * Return the arithmetic mean of input array elements.
 *
 * @param {(Array|NdArray|number)} x
 * @returns {number}
 */
function mean(x){
    return createArray(x).mean();
}

/**
 * Returns the standard deviation, a measure of the spread of a distribution, of the array elements.
 *
 * @returns {number}
 */
NdArray.prototype.std = function(){
    var squares = this.clone();
    ops.powseq(squares.selection, 2);
    var mean =  this.mean(),
        variance = Math.abs(ops.sum(squares.selection) / size(this.shape) - mean * mean);
    return variance > 0 ? Math.sqrt(variance): 0;
};

/**
 * Returns the standard deviation, a measure of the spread of a distribution, of the input array elements.
 *
 * @param {(Array|NdArray|number)} x
 * @returns {number}
 */
function std(x){
    return createArray(x).std();
}

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
 * Permute the dimensions of the input array according to the given axes.
 *
 * @param {(Array|NdArray|number)} x
 * @param {(number|...number)} [axes]
 * @returns {NdArray}
 * @example
 *
 arr = nj.arange(6).reshape(1,2,3)
 // array([[[ 0, 1, 2],
 //         [ 3, 4, 5]]])
 arr.T
 // array([[[ 0],
 //         [ 3]],
 //        [[ 1],
 //         [ 4]],
 //        [[ 2],
 //         [ 5]]])

 arr.transpose(1,0,2)
 // array([[[ 0, 1, 2]],
 //        [[ 3, 4, 5]]])

 */

function transpose(x, axes){
    return createArray(x).transpose(axes);
}

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

/**
 * Return the inverse of the input array, element-wise.
 *
 * @param {(Array|NdArray|number)} x
 * @returns {NdArray}
 */
function negative(x){
    return createArray(x).negative();
}

NdArray.prototype.get = function(){
    return this.selection.get.apply(this.selection, arguments);
};

NdArray.prototype.set = function(){
    return this.selection.set.apply(this.selection, arguments);
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

function createArray(arr, dtype){
    if (arr instanceof NdArray){ return arr; }
    var T = getType(dtype);
    if (isNumber(arr)){
        if (T !== Array){
            return new NdArray(new T([arr]), [1]);
        }
        else {
            return new NdArray([arr], [1]);
        }

    }

    var shape = dim(arr);
    if (shape.length > 1){
        arr = baseFlatten(arr, true);
    }
    if (!(arr instanceof T)){
        arr = new T(arr);
    }
    return new NdArray(arr, shape);
}

/**
 * Return evenly spaced values within a given interval.
 *
 * @param {int} [start=0] - Start of interval. The interval includes this value.
 * @param {int} stop - End of interval. The interval does not include this value.
 * @param {int} [step=1] - Spacing between values. The default step size is 1. If step is specified, start must also be given.
 * @param {(String|Object)} [dtype=Array] The type of the output array.
 *
 * @return {NdArray} Array of evenly spaced values.
 */
function arange(start, stop, step, dtype) {
    if (arguments.length === 1){
        stop  = start;
        start = 0;
        step = 1;
    }
    else if (arguments.length === 2 && isNumber(stop)){
        step = 1;
    }
    else if (arguments.length === 2){
        dtype = stop;
        stop = start;
        start = 0;
        step = 1;
    }
    else if (arguments.length === 3 && !isNumber(step)){
        dtype = step;
        step = 1;
    }
    var result = [], i=0;
    while (start < stop){
        result[i++] = start;
        start += step;
    }
    return createArray(result, dtype);
}

/**
 * Return a new array of given shape and type, filled with zeros.
 *
 * @param {(Array|int)} shape - Shape of the new array, e.g., [2, 3] or 2.
 * @param {(String|Object)}  [dtype=Array]  The type of the output array.
 *
 * @return {NdArray} Array of zeros with the given shape and dtype
 */
function zeros(shape, dtype){
    if (isNumber(shape) && shape >=0){
        shape = [shape];
    }
    var s = size(shape);
    var type = getType(dtype);
    var arr =  new NdArray(new type(s), shape);
    ops.assigns(arr.selection, 0);
    return arr;
}

/**
 * Return a new array of given shape and type, filled with ones.
 *
 * @param {(Array|int)} shape - Shape of the new array, e.g., [2, 3] or 2.
 * @param {(String|Object)}  [dtype=Array] - The type of the output array.
 *
 * @return {NdArray} Array of ones with the given shape and dtype
 */
function ones(shape, dtype){
    if (isNumber(shape) && shape >=0){
        shape = [shape];
    }
    var s = size(shape);
    var type = getType(dtype);
    var arr =  new NdArray(new type(s), shape);
    ops.assigns(arr.selection, 1);
    return arr;
}


/**
 * Create an array of the given shape and propagate it with random samples from a uniform distribution over [0, 1].
 * @param {number|Array|...number} shape - The dimensions of the returned array, should all be positive integers
 * @returns {NdArray}
 */
function random(shape){
    if (arguments.length === 0){
        return createArray(Math.random());
    }
    else if (arguments.length === 1){
        shape = isNumber(shape)? [shape | 0] : shape;
    }
    else {
        shape = arguments;
    }
    var s = size(shape);
    var arr =  new NdArray(new Array(s), shape);
    ops.random(arr.selection);
    return arr;
}

/**
 * Return the softmax, or normalized exponential, of the input array, element-wise.
 * @param {(Array|NdArray|number)} x
 * @returns {NdArray}
 */
function softmax(x){
    var e = createArray(x).exp();
    var se = e.sum(); // scalar
    ops.divseq(e.selection, se);
    return e;
}


var doSigmoid = cwise({
    args: ['array', 'scalar'],
    body: function sigmoidCwise(a, t) {
        a = a < -30? 0: a > 30? 1: 1 / (1 + Math.exp(-1 * t * a));
    }
});

/**
 * Return the sigmoid of the input array, element-wise.
 * @param {(Array|NdArray|number)} x
 * @param {number} [t=1] - stifness parameter
 * @returns {NdArray}
 */
function sigmoid(x, t){
    x = createArray(x).clone();
    t = t || 1;
    doSigmoid(x.selection, t);
    return x;
}

var doClip = cwise({
    args: ['array', 'scalar', 'scalar'],
    body: function clipCwise(a, min, max) {
        a = Math.min(Math.max(min, a), max);
    }
});


/**
 * Clip (limit) the values in an array between min and max, element-wise.
 *
 * @param {(Array|NdArray|number)} x
 * @param {number} [min=0]
 * @param {number} [max=1]
 * @returns {NdArray}
 */
function clip(x, min, max){
    if (arguments.length === 1){
        min = 0;
        max = 1;
    }
    else if (arguments.length === 2){
        max = 1;
    }
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


/**
 * Return hyperbolic tangent of the input array, element-wise.
 *
 * @param {(Array|NdArray|number)} x
 * @returns {NdArray}
 */
function tanh(x){
    var s = (x instanceof NdArray)? x.clone(): createArray(x);
    doTanh(s.selection);
    return s;
}

/**
 * Return absolute value of the input array, element-wise.
 *
 * @param {(Array|NdArray|number)} x
 * @returns {NdArray}
 */
function abs(x){
    var s = (x instanceof NdArray)? x.clone(): createArray(x);
    ops.abseq(s.selection);
    return s;
}

/**
 * Return trigonometric cosine of the input array, element-wise.
 *
 * @param {(Array|NdArray|number)} x
 * @returns {NdArray}
 */
function cos(x){
    var s = (x instanceof NdArray)? x.clone(): createArray(x);
    ops.coseq(s.selection);
    return s;
}

/**
 * Return trigonometric inverse cosine of the input array, element-wise.
 *
 * @param {(Array|NdArray|number)} x
 * @returns {NdArray}
 */
function arccos(x){
    var s = (x instanceof NdArray)? x.clone(): createArray(x);
    ops.acoseq(s.selection);
    return s;
}

/**
 * Return trigonometric sine of the input array, element-wise.
 *
 * @param {(Array|NdArray|number)} x
 * @returns {NdArray}
 */
function sin(x){
    var s = (x instanceof NdArray)? x.clone(): createArray(x);
    ops.sineq(s.selection);
    return s;
}

/**
 * Return trigonometric inverse sine of the input array, element-wise.
 *
 * @param {(Array|NdArray|number)} x
 * @returns {NdArray}
 */
function arcsin(x){
    var s = (x instanceof NdArray)? x.clone(): createArray(x);
    ops.asineq(s.selection);
    return s;
}

/**
 * Return trigonometric tangent of the input array, element-wise.
 *
 * @param {(Array|NdArray|number)} x
 * @returns {NdArray}
 */
function tan(x){
    var s = (x instanceof NdArray)? x.clone(): createArray(x);
    ops.taneq(s.selection);
    return s;
}

/**
 * Return trigonometric inverse tangent of the input array, element-wise.
 *
 * @param {(Array|NdArray|number)} x
 * @returns {NdArray}
 */
function arctan(x){
    var s = (x instanceof NdArray)? x.clone(): createArray(x);
    ops.ataneq(s.selection);
    return s;
}

/**
 * Dot product of two arrays.
 *
 * WARNING: supported products are:
 *  - matrix dot matrix
 *  - vector dot vector
 *  - matrix dot vector
 *  - vector dot matrix
 * @param {(Array|NdArray)} a
 * @param {(Array|NdArray)} b
 * @returns {NdArray}
 */
function dot(a,b){
    a = createArray(a);
    b = createArray(b);
    var aShape = a.shape,
        bShape = b.shape;
    var shape, c, rxa, rxb, type = getType(a.dtype);

    if (aShape.length === 2 && bShape.length === 2 && aShape[1] === bShape[0]){ // matrix/matrix
        shape = [aShape[0], bShape[1]];
        c = new NdArray(new type(size(shape)), shape);
        gemm(c.selection, a.selection, b.selection);
        return c;
    }
    else if (aShape.length === 1 && bShape.length === 2 && aShape[0] === bShape[0]){ // vector/matrix
        return dot(a.reshape([aShape[0], 1]).transpose(), b).reshape(bShape[1]);
    }
    else if (aShape.length === 2 && bShape.length === 1 && aShape[1] === bShape[0]){ // matrix/vector
        return dot(a, b.reshape([bShape[0], 1])).reshape(aShape[0]);
    }
    else if (aShape.length === 1 && bShape.length === 1 && aShape[0] === bShape[0]){ // vector/vector
        return dot(a.reshape([aShape[0], 1]).transpose(),  b.reshape([bShape[0], 1])).reshape([1]);
    }
    else {
        throw new errors.ValueError('cannot compute the matrix product of given arrays');
        //throw new errors.ValueError('shapes ('+xaShape[0]+',) and ('+xbShape[0]+',) not aligned: '+xaShape[0]+ '(dim 0) != '+xbShape[0]+' (dim 0)');
    }
}

/**
 * Join given arrays along the last axis.
 *
 * @param {...(Array|NdArray)} arrays
 * @returns {NdArray}
 */
function concatenate(arrays){
    if (arguments.length > 1){
        arrays = arguments;
    }
    var i, a;
    for (i = 0; i < arrays.length; i++){
        a = arrays[i];
        arrays[i] = (a instanceof NdArray)? a.tolist(): isNumber(a)? [a] : a  ;
    }

    var m = arrays[0];
    for (i = 1; i < arrays.length; i++){
        a = arrays[i];
        var mShape = dim(m),
            aShape = dim(a);

        if (mShape.length !== aShape.length){
            throw new errors.ValueError('all the input arrays must have same number of dimensions');
        }
        else if (mShape.length === 1 && aShape.length === 1){
            m = m.concat(a);
        }
        else if ((mShape.length === 2 && aShape.length === 2 && mShape[0] === aShape[0]) ||
            (mShape.length === 1 && aShape.length === 2 && mShape[0] === aShape[0]) ||
            (mShape.length === 2 && aShape.length === 1 && mShape[0] === aShape[0])){
            for (var row = 0; row < mShape[0]; row++){
                m[row] = m[row].concat(a[row]);
            }
        }
        else if ((mShape.length === 3 && aShape.length === 3 && mShape[0] === aShape[0] && mShape[1] === aShape[1]) ||
            (mShape.length === 2 && aShape.length === 3 && mShape[0] === aShape[0] && mShape[1] === aShape[1]) ||
            (mShape.length === 3 && aShape.length === 2 && mShape[0] === aShape[0] && mShape[1] === aShape[1])){

            for (var rowI = 0; rowI < mShape[0]; rowI++){
                var rowV = new Array(mShape[1]);
                for (var colI = 0; colI < mShape[1]; colI++){
                    rowV[colI] = m[rowI][colI].concat(a[rowI][colI]);
                }
                m[rowI] = rowV;
            }
        }
        else {
            throw new errors.ValueError('cannot concatenate  "' + mShape + '" with "' + aShape + '"');
        }
    }
    return createArray(m, arrays[0].dtype);
}


var doConjMuleq = cwise({
    args: ['array', 'array', 'array', 'array'],
    body: function(xi, yi, ui, vi) {
        var a = ui, b = vi, c = xi, d = yi,
            k1 = c * (a + b);
        xi = k1 - b * (c + d);
        yi = k1 + a * (d - c);
    }
});

NdArray.prototype.round = function (copy) {
    if (arguments.length === 0){
        copy = true;
    }
    var arr = copy ? this.clone() : this;
    ops.roundeq(arr.selection);
    return arr;
};

/**
 * Round an array to the to the nearest integer.
 *
 * @param {(Array|NdArray)} x
 * @returns {NdArray}
 */
function round(x){
    return createArray(x).round();
}
/**
 * Returns the discrete, linear convolution of two arrays.
 * 
 * @note: Arrays must have the same dimensions and a must be greater than b.
 * @note: The convolution product is only given for points where the signals overlap completely. Values outside the signal boundary have no effect. This behaviour is known as the 'valid' mode.
 * 
 * @param {Array|NdArray} a
 * @param {Array|NdArray} b
 */
function convolve(a, b){
    a = createArray(a);
    b = createArray(b);

    if (a.ndim !== b.ndim){
        throw new errors.ValueError('arrays must have the same dimensions');
    }

    var as = a.selection,
        bs = b.selection;
    var d = a.ndim,
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

    var T = getType(as.dtype),
        out = new NdArray(new T(size(oshape)), oshape),
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
}

function fft(x){
    x = (x instanceof NdArray)? x.clone(): createArray(x);
    var xShape = x.shape,
        d = xShape.length;
    if (xShape[d - 1] !== 2){
        throw new errors.ValueError('expect last dimension of the array to have 2 values (for both real and imaginary part)');
    }
    var rPicker = new Array(d),
        iPicker = new Array(d);
    rPicker[d-1] = 0;
    iPicker[d-1] = 1;
    ndFFT(1, x.selection.pick.apply(x.selection, rPicker), x.selection.pick.apply(x.selection, iPicker));
    return x
}

function ifft(x){
    x = (x instanceof NdArray)? x.clone(): createArray(x);
    var xShape = x.shape,
        d = xShape.length;
    if (xShape[d - 1] !== 2){
        throw new errors.ValueError('expect last dimension of the array to have 2 values (for both real and imaginary part)');
    }
    var rPicker = new Array(d),
        iPicker = new Array(d);
    rPicker[d-1] = 0;
    iPicker[d-1] = 1;
    ndFFT(-1, x.selection.pick.apply(x.selection, rPicker), x.selection.pick.apply(x.selection, iPicker));
    return x
}

module.exports = {
    config: CONF,
    dtypes: DTYPES,
    NdArray: NdArray,
    ndarray: ndarray,
    array: createArray,
    arange: arange,
    reshape: reshape,
    zeros: zeros,
    ones: ones,
    flatten: flatten,
    random: random,
    softmax: softmax,
    sigmoid: sigmoid,
    leakyRelu: leakyRelu,
    abs: abs,
    arccos: arccos,
    arcsin: arcsin,
    arctan: arctan,
    cos: cos,
    sin: sin,
    tan: tan,
    tanh: tanh,
    clip: clip,
    exp: exp,
    sqrt: sqrt,
    power: power,
    sum: sum,
    mean: mean,
    std: std,
    dot: dot,
    add: add,
    subtract: subtract,
    multiply: multiply,
    divide: divide,
    negative: negative,
    size: size,
    equal: equal,
    max: max,
    min: min,
    concatenate: concatenate,
    transpose: transpose,
    errors: errors,
    broadcast: broadcast,
    round: round,
    convolve: convolve,
    fft: fft,
    ifft: ifft,
    int8: function (array) { return createArray(array, DTYPES.int8); },
    uint8: function (array) { return createArray(array, DTYPES.uint8); },
    int16: function (array) { return createArray(array, DTYPES.int16); },
    uint16: function (array) { return createArray(array, DTYPES.uint16); },
    int32: function (array) { return createArray(array, DTYPES.int32); },
    uint32: function (array) { return createArray(array, DTYPES.uint32); },
    float32: function (array) { return createArray(array, DTYPES.float32); },
    float64: function (array) { return createArray(array, DTYPES.float64); }
};

