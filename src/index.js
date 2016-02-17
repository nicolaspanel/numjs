'use strict';

var ndarray = require('ndarray');
var cwise = require('cwise');
var ops = require('ndarray-ops');
var gemm = require('ndarray-gemm');
var ndFFT = require('ndarray-fft');

var CONF = require('./config');
var DTYPES = require('./dtypes');
var NdArray = require('./ndarray');
var _ = require('./utils');
var errors = require('./errors');


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



function haveSameShape(shape1, shape2){
    if (_.shapeSize(shape1) !== _.shapeSize(shape2)){
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
 * Add arguments, element-wise.
 *
 * @param {(NdArray|Array|number)} a
 * @param {(NdArray|Array|number)} b
 * @returns {NdArray}
 */
function add(a,b){
    return NdArray.new(a).add(b);
}

/**
 * Multiply arguments, element-wise.
 *
 * @param {(Array|NdArray)} a
 * @param {(Array|NdArray|number)} b
 * @returns {NdArray}
 */
function multiply(a,b){
    return NdArray.new(a).multiply(b);
}

/**
 * Divide `a` by `b`, element-wise.
 *
 * @param {(Array|NdArray)} a
 * @param {(Array|NdArray|number)} b
 * @returns {NdArray}
 */
function divide(a,b){
    return NdArray.new(a).divide(b);
}

/**
 * Subtract second argument from the first, element-wise.
 *
 * @param {(NdArray|Array|number)} a
 * @param {(NdArray|Array|number)} b
 * @returns {NdArray}
 */
function subtract(a,b){
    return NdArray.new(a).subtract(b);
}


/**
 * Return true if two arrays have the same shape and elements, false otherwise.
 * @param {(Array|NdArray)} array1
 * @param {(Array|NdArray)} array2
 * @returns {boolean}
 */
function equal(array1, array2){
    return NdArray.new(array1).equal(array2);
}


/**
 * Return a copy of the array collapsed into one dimension using row-major order (C-style)

 * @param {(Array|NdArray)} array
 * @returns {NdArray}
 */
function flatten(array){
    return NdArray.new(array).flatten();
}



/**
 * Gives a new shape to an array without changing its data.
 * @param {(Array|NdArray)} array
 * @param {Array} shape - The new shape should be compatible with the original shape. If an integer, then the result will be a 1-D array of that length
 * @returns {NdArray}
 */
function reshape(array, shape){
    return NdArray.new(array).reshape(shape);
}



/**
 * Calculate the exponential of all elements in the input array, element-wise.
 * @param {(Array|NdArray|number)} x
 * @returns {NdArray}
 */
function exp(x){
    return NdArray.new(x).exp();
}

/**
 * Calculate the positive square-root of all elements in the input array, element-wise.
 * @param {(Array|NdArray|number)} x
 * @returns {NdArray}
 */
function sqrt(x){
    return NdArray.new(x).sqrt();

}



/**
 * Raise first array elements to powers from second array, element-wise.
 *
 * @param {(Array|NdArray|number)} x1
 * @param {(Array|NdArray|number)} x2
 * @returns {NdArray}
 */
function power(x1, x2){
    return NdArray.new(x1).pow(x2);
}


/**
 * Return the sum of input array elements.
 *
 * @param {(Array|NdArray|number)} x
 * @returns {number}
 */
function sum(x){
    return NdArray.new(x).sum();
}

/**
 * Return the arithmetic mean of input array elements.
 *
 * @param {(Array|NdArray|number)} x
 * @returns {number}
 */
function mean(x){
    return NdArray.new(x).mean();
}

/**
 * Returns the standard deviation, a measure of the spread of a distribution, of the input array elements.
 *
 * @param {(Array|NdArray|number)} x
 * @returns {number}
 */
function std(x){
    return NdArray.new(x).std();
}

/**
 * Return the minimum value of the array
 *
 * @param {(Array|NdArray|number)} x
 * @returns {Number}
 */
function min(x){
    return NdArray.new(x).min();
}

/**
 * Return the maximum value of the array
 *
 * @param {(Array|NdArray|number)} x
 * @returns {Number}
 */
function max(x){
    return NdArray.new(x).max();
}


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
    return NdArray.new(x).transpose(axes);
}

/**
 * Return the inverse of the input array, element-wise.
 *
 * @param {(Array|NdArray|number)} x
 * @returns {NdArray}
 */
function negative(x){
    return NdArray.new(x).negative();
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
    else if (arguments.length === 2 && _.isNumber(stop)){
        step = 1;
    }
    else if (arguments.length === 2){
        dtype = stop;
        stop = start;
        start = 0;
        step = 1;
    }
    else if (arguments.length === 3 && !_.isNumber(step)){
        dtype = step;
        step = 1;
    }
    var result = [], i=0;
    while (start < stop){
        result[i++] = start;
        start += step;
    }
    return NdArray.new(result, dtype);
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
    if (_.isNumber(shape) && shape >=0){
        shape = [shape];
    }
    var s = _.shapeSize(shape);
    var type = _.getType(dtype);
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
    if (_.isNumber(shape) && shape >=0){
        shape = [shape];
    }
    var s = _.shapeSize(shape);
    var type = _.getType(dtype);
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
        return NdArray.new(Math.random());
    }
    else if (arguments.length === 1){
        shape = _.isNumber(shape)? [shape | 0] : shape;
    }
    else {
        shape = arguments;
    }
    var s = _.shapeSize(shape);
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
    var e = NdArray.new(x).exp();
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
    x = NdArray.new(x).clone();
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
    var s = (x instanceof NdArray)? x.clone(): NdArray.new(x);
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
    var s = (x instanceof NdArray)? x.clone(): NdArray.new(x);
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
    var s = (x instanceof NdArray)? x.clone(): NdArray.new(x);
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
    var s = (x instanceof NdArray)? x.clone(): NdArray.new(x);
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
    var s = (x instanceof NdArray)? x.clone(): NdArray.new(x);
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
    var s = (x instanceof NdArray)? x.clone(): NdArray.new(x);
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
    var s = (x instanceof NdArray)? x.clone(): NdArray.new(x);
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
    var s = (x instanceof NdArray)? x.clone(): NdArray.new(x);
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
    var s = (x instanceof NdArray)? x.clone(): NdArray.new(x);
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
    var s = (x instanceof NdArray)? x.clone(): NdArray.new(x);
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
    a = NdArray.new(a);
    b = NdArray.new(b);
    var aShape = a.shape,
        bShape = b.shape;
    var shape, c, rxa, rxb, type = _.getType(a.dtype);

    if (aShape.length === 2 && bShape.length === 2 && aShape[1] === bShape[0]){ // matrix/matrix
        shape = [aShape[0], bShape[1]];
        c = new NdArray(new type(_.shapeSize(shape)), shape);
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
        arrays = [].slice.call(arguments);
    }
    var i, a;
    for (i = 0; i < arrays.length; i++){
        a = arrays[i];
        arrays[i] = (a instanceof NdArray)? a.tolist(): _.isNumber(a)? [a] : a  ;
    }

    var m = arrays[0];
    for (i = 1; i < arrays.length; i++){
        a = arrays[i];
        var mShape = _.getShape(m),
            aShape = _.getShape(a);

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
    return NdArray.new(m, arrays[0].dtype);
}



/**
 * Round an array to the to the nearest integer.
 *
 * @param {(Array|NdArray)} x
 * @returns {NdArray}
 */
function round(x){
    return NdArray.new(x).round();
}


/**
 * Convolve 2 N-dimensionnal arrays
 * 
 * @note: Arrays must have the same dimensions and a must be greater than b.
 * @note: The convolution product is only given for points where the signals overlap completely. Values outside the signal boundary have no effect. This behaviour is known as the 'valid' mode.
 * 
 * @param {Array|NdArray} a
 * @param {Array|NdArray} b
 */
function convolve(a, b){
    return NdArray.new(a).convolve(b);
}


/**
 * Convolve 2 N-dimensionnal arrays using Fast Fourier Transform (FFT)
 *
 * @note: Arrays must have the same dimensions and a must be greater than b.
 * @note: The convolution product is only given for points where the signals overlap completely. Values outside the signal boundary have no effect. This behaviour is known as the 'valid' mode.
 *
 * @param {Array|NdArray} a
 * @param {Array|NdArray} b
 */
function fftconvolve(a, b){
    return NdArray.new(a).fftconvolve(b);
}

function fft(x){
    x = (x instanceof NdArray)? x.clone(): NdArray.new(x);
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
    return x;
}

function ifft(x){
    x = (x instanceof NdArray)? x.clone(): NdArray.new(x);
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
    return x;
}

module.exports = {
    config: CONF,
    dtypes: DTYPES,
    NdArray: NdArray,
    ndarray: ndarray,
    array: NdArray.new,
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
    equal: equal,
    max: max,
    min: min,
    concatenate: concatenate,
    transpose: transpose,
    errors: errors,
    broadcast: broadcast,
    round: round,
    convolve: convolve,
    fftconvolve: fftconvolve,
    fft: fft,
    ifft: ifft,
    int8: function (array) { return NdArray.new(array, DTYPES.int8); },
    uint8: function (array) { return NdArray.new(array, DTYPES.uint8); },
    int16: function (array) { return NdArray.new(array, DTYPES.int16); },
    uint16: function (array) { return NdArray.new(array, DTYPES.uint16); },
    int32: function (array) { return NdArray.new(array, DTYPES.int32); },
    uint32: function (array) { return NdArray.new(array, DTYPES.uint32); },
    float32: function (array) { return NdArray.new(array, DTYPES.float32); },
    float64: function (array) { return NdArray.new(array, DTYPES.float64); },
    images: require('./images')
};

