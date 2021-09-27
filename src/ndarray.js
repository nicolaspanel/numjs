'use strict';

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
var NdArray = function NdArray () {
  if (arguments.length === 1) {
    this.selection = arguments[0];
  } else if (arguments.length === 0) {
    throw new errors.ValueError("Required argument 'data' not found");
  } else {
    this.selection = ndarray.apply(null, arguments);
  }
  /**
  * @property {Number} NdArray#size - Number of elements in the array.
  */
  Object.defineProperty(this, 'size', {
    get: function () {
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
  Object.defineProperty(this, 'shape', {
    get: function () {
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
  Object.defineProperty(this, 'ndim', {
    get: function () {
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
  Object.defineProperty(this, 'dtype', {
    get: function () {
      return this.selection.dtype;
    }.bind(this),
    set: function (dtype) {
      var T = _.getType(dtype);
      if (T !== _.getType(this.dtype)) {
        this.selection = ndarray(new T(this.selection.data), this.selection.shape, this.selection.stride, this.selection.offset);
      }
    }.bind(this)
  });
  /**
  * Permute the dimensions of the array.
  *
  * @property {String}
  * @name NdArray#T
  * @readonly
  */
  Object.defineProperty(this, 'T', {
    get: function () {
      return this.transpose();
    }.bind(this)
  });
};

NdArray.prototype.get = function () {
  var n = arguments.length;
  for (var i = 0; i < n; i++) {
    if (arguments[i] < 0) {
      arguments[i] += this.shape[i];
    }
  }
  return this.selection.get.apply(this.selection, arguments);
};

NdArray.prototype.set = function () {
  return this.selection.set.apply(this.selection, arguments);
};

NdArray.prototype.slice = function () {
  var d = this.ndim;
  var hi = new Array(d);
  var lo = new Array(d);
  var step = new Array(d);
  var tShape = this.shape;

  for (var i = 0; i < d; i++) {
    var arg = arguments[i];
    if (typeof arg === 'undefined') { break; }
    if (arg === null) { continue; }
    if (_.isNumber(arg)) {
      lo[i] = (arg < 0) ? arg + tShape[i] : arg;
      hi[i] = null;
      step[i] = 1;
    } else if (arg.length === 4 && arg[1] === null && arg[2] === null) {
      // pattern: a[start::step]
      var s = (arg[0] < 0) ? arg[0] + tShape[i] : arg[0];
      lo[i] = s;
      hi[i] = null;
      step[i] = arg[3] || 1;
    } else {
      // pattern start:end:step
      var start = (arg[0] < 0) ? arg[0] + tShape[i] : arg[0];
      var end = (arg[1] < 0) ? arg[1] + tShape[i] : arg[1];
      lo[i] = end ? start : 0;
      hi[i] = end ? end - start : start;
      step[i] = arg[2] || 1;
    }
  }

  var slo = this.selection.lo.apply(this.selection, lo);
  var shi = slo.hi.apply(slo, hi);
  var sstep = shi.step.apply(shi, step);
  return new NdArray(sstep);
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
NdArray.prototype.pick = function (axis) {
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
  if (this.ndim === 1) { // already flattened
    return new NdArray(this.selection);
  }
  var T = _.getType(this.dtype);
  var arr = _.flatten(this.tolist(), true);
  if (!(arr instanceof T)) {
    arr = new T(arr);
  }
  return new NdArray(arr, [this.size]);
};

/**
* Gives a new shape to the array without changing its data.
* @param {Array|number} The new shape should be compatible with the original shape. If an integer, then the result will be a 1-D array of that length. One shape dimension can be -1. In this case, the value is inferred from the length of the array and remaining dimensions.
* @returns {NdArray} a new view object if possible, a copy otherwise,
*/
NdArray.prototype.reshape = function (shape) {
  if (arguments.length === 0) {
    throw new errors.ValueError('function takes at least one argument (0 given)');
  }
  if (arguments.length === 1 && _.isNumber(shape) && shape === -1) {
    shape = [_.shapeSize(this.shape)];
  }
  if (arguments.length === 1 && _.isNumber(shape)) {
    shape = [shape];
  }
  if (arguments.length > 1) {
    shape = [].slice.call(arguments);
  }
  if (shape.filter(function (s) { return s === -1; }).length > 1) {
    throw new errors.ValueError('can only specify one unknown dimension');
  }
  var currentShapeSize = _.shapeSize(shape);
  shape = shape.map(function (s) { return s === -1 ? -1 * this.size / currentShapeSize : s; }.bind(this));
  if (this.size !== _.shapeSize(shape)) {
    throw new errors.ValueError('total size of new array must be unchanged');
  }
  var selfShape = this.selection.shape;
  var selfOffset = this.selection.offset;
  var selfStride = this.selection.stride;
  var selfDim = selfShape.length;
  var d = shape.length;
  var stride;
  var offset;
  var i;
  var sz;
  if (selfDim === d) {
    var sameShapes = true;
    for (i = 0; i < d; ++i) {
      if (selfShape[i] !== shape[i]) {
        sameShapes = false;
        break;
      }
    }
    if (sameShapes) {
      return new NdArray(this.selection.data, selfShape, selfStride, selfOffset);
    }
  } else if (selfDim === 1) {
    // 1d view
    stride = new Array(d);
    for (i = d - 1, sz = 1; i >= 0; --i) {
      stride[i] = sz;
      sz *= shape[i];
    }
    offset = selfOffset;
    for (i = 0; i < d; ++i) {
      if (stride[i] < 0) {
        offset -= (shape[i] - 1) * stride[i];
      }
    }
    return new NdArray(this.selection.data, shape, stride, offset);
  }

  var minDim = Math.min(selfDim, d);
  var areCompatible = true;
  for (i = 0; i < minDim; i++) {
    if (selfShape[i] !== shape[i]) {
      areCompatible = false;
      break;
    }
  }
  if (areCompatible) {
    stride = new Array(d);
    for (i = 0; i < d; i++) {
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
* @returns {NfdArray}
*/
NdArray.prototype.transpose = function (axes) {
  if (arguments.length === 0) {
    var d = this.ndim;
    axes = new Array(d);
    for (var i = 0; i < d; i++) {
      axes[i] = d - i - 1;
    }
  } else if (arguments.length > 1) {
    axes = arguments;
  }
  return new NdArray(this.selection.transpose.apply(this.selection, axes));
};

/**
* Dot product of two arrays.
*
* @param {(Array|NdArray)} x
* @returns {NdArray}
*/
NdArray.prototype.dot = function (x) {
  x = (x instanceof NdArray) ? x : createArray(x, this.dtype);
  var tShape = this.shape;
  var xShape = x.shape;

  if (tShape.length === 2 && xShape.length === 2 && tShape[1] === xShape[0]) { // matrix/matrix
    var T = _.getType(this.dtype);
    var c = new NdArray(new T(tShape[0] * xShape[1]), [tShape[0], xShape[1]]);
    gemm(c.selection, this.selection, x.selection);
    return c;
  } else if (tShape.length === 1 && xShape.length === 2 && tShape[0] === xShape[0]) { // vector/matrix
    return this.reshape([tShape[0], 1]).T.dot(x).reshape(xShape[1]);
  } else if (tShape.length === 2 && xShape.length === 1 && tShape[1] === xShape[0]) { // matrix/vector
    return this.dot(x.reshape([xShape[0], 1])).reshape(tShape[0]);
  } else if (tShape.length === 1 && xShape.length === 1 && tShape[0] === xShape[0]) { // vector/vector
    return this.reshape([tShape[0], 1]).T.dot(x.reshape([xShape[0], 1])).reshape([1]);
  } else {
    throw new errors.ValueError('cannot compute the matrix product of given arrays');
  }
};

/**
* Assign `x` to the array, element-wise.
*
* @param {(NdArray|Array|number)} x
* @param {boolean} [copy=true]
* @returns {NdArray}
*/
NdArray.prototype.assign = function (x, copy) {
  if (arguments.length === 1) {
    copy = true;
  }
  var arr = copy ? this.clone() : this;

  if (_.isNumber(x)) {
    ops.assigns(arr.selection, x);
    return arr;
  }
  x = createArray(x, this.dtype);
  ops.assign(arr.selection, x.selection);
  return arr;
};

/**
* Add `x` to the array, element-wise.
*
* @param {(NdArray|Array|number)} x
* @param {boolean} [copy=true]
* @returns {NdArray}
*/
NdArray.prototype.add = function (x, copy) {
  if (arguments.length === 1) {
    copy = true;
  }
  var arr = copy ? this.clone() : this;

  if (_.isNumber(x)) {
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
NdArray.prototype.subtract = function (x, copy) {
  if (arguments.length === 1) {
    copy = true;
  }
  var arr = copy ? this.clone() : this;

  if (_.isNumber(x)) {
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
NdArray.prototype.multiply = function (x, copy) {
  if (arguments.length === 1) {
    copy = true;
  }
  var arr = copy ? this.clone() : this;
  if (_.isNumber(x)) {
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
NdArray.prototype.divide = function (x, copy) {
  if (arguments.length === 1) {
    copy = true;
  }
  var arr = copy ? this.clone() : this;
  if (_.isNumber(x)) {
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
NdArray.prototype.pow = function (x, copy) {
  if (arguments.length === 1) { copy = true; }
  var arr = copy ? this.clone() : this;
  if (_.isNumber(x)) {
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
NdArray.prototype.exp = function (copy) {
  if (arguments.length === 0) { copy = true; }
  var arr = copy ? this.clone() : this;
  ops.expeq(arr.selection);
  return arr;
};

/**
* Calculate the natural logarithm of all elements in the array, element-wise.
*
* @param {boolean} [copy=true] - set to false to modify the array rather than create a new one
* @returns {NdArray}
*/
NdArray.prototype.log = function (copy) {
  if (arguments.length === 0) { copy = true; }
  var arr = copy ? this.clone() : this;
  ops.logeq(arr.selection);
  return arr;
};

/**
* Calculate the positive square-root of all elements in the array, element-wise.
*
* @param {boolean} [copy=true] - set to false to modify the array rather than create a new one
* @returns {NdArray}
*/
NdArray.prototype.sqrt = function (copy) {
  if (arguments.length === 0) { copy = true; }
  var arr = copy ? this.clone() : this;
  ops.sqrteq(arr.selection);
  return arr;
};

/**
* Return the maximum value of the array
*
* @returns {Number}
*/
NdArray.prototype.max = function () {
  if (this.selection.size === 0) {
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
  if (this.selection.size === 0) {
    return null;
  }
  return ops.inf(this.selection);
};

/**
* Sum of array elements.
*
* @returns {number}
*/
NdArray.prototype.sum = function () {
  return ops.sum(this.selection);
};

/**
* Returns the standard deviation, a measure of the spread of a distribution, of the array elements.
*
* @param {object} {ddof:0}
* @returns {number}
*/
NdArray.prototype.std = function (options) {
  options = _.defaults(options, { 'ddof': 0 });
  var squares = this.clone();
  ops.powseq(squares.selection, 2);
  var mean = this.mean();
  var shapeSize = _.shapeSize(this.shape);
  var variance = ops.sum(squares.selection) / (shapeSize - options.ddof) - mean * mean * shapeSize / (shapeSize - options.ddof);

  return variance > 0 ? Math.sqrt(Math.abs(variance)) : 0;
};

/**
* Return the arithmetic mean of array elements.
*
* @returns {number}
*/
NdArray.prototype.mean = function () {
  return ops.sum(this.selection) / _.shapeSize(this.shape);
};

/**
* Return element-wise remainder of division.
*
* @param {(NdArray|Array|number)} x
* @param {boolean} [copy=true]
* @returns {NdArray}
*/
NdArray.prototype.mod = function (x, copy) {
  if (arguments.length === 1) {
    copy = true;
  }
  var arr = copy ? this.clone() : this;
  if (_.isNumber(x)) {
    ops.modseq(arr.selection, x);
    return arr;
  }

  x = createArray(x, this.dtype);
  ops.modeq(arr.selection, x.selection);

  return arr;
};

/**
* Converts {NdArray} to a native JavaScript {Array}
*
* @returns {Array}
*/
NdArray.prototype.tolist = function () {
  return unpackArray(this.selection);
};

NdArray.prototype.valueOf = function () {
  return this.tolist();
};
/**
* Stringify the array to make it readable by a human.
*
* @returns {string}
*/
NdArray.prototype.toString = function () {
  var nChars = formatNumber(this.max()).length;

  var reg1 = /\]\,(\s*)\[/g;
  var spacer1 = '],\n$1      [';
  var reg3 = /\]\,(\s+)...\,(\s+)\[/g;
  var spacer3 = '],\n$2       ...\n$2      [';
  var reg2 = /\[\s+\[/g;
  var spacer2 = '[[';

  function formatArray (k, v) {
    if (_.isString(v)) { return v; }
    if (_.isNumber(v)) {
      var s = formatNumber(v);
      return new Array(Math.max(0, nChars - s.length + 2)).join(' ') + s;
    }
    k = k || 0;
    var arr;
    var th = CONF.printThreshold;
    var hth = th / 2 | 0;
    if (v.length > th) {
      arr = [].concat(v.slice(0, hth), [' ...'], v.slice(v.length - hth));
    } else {
      arr = v;
    }
    return new Array(k + 1).join(' ') + '[' + arr.map(function (i, ii) {
      return formatArray(ii === 0 && k === 0 ? 1 : k + 1, i);
    }).join(',') + ']';
  }

  var base = JSON
    .stringify(this.tolist(), formatArray)
    .replace(reg1, spacer1)
    .replace(reg2, spacer2)
    .replace(reg2, spacer2)
    .replace(reg3, spacer3)
    .slice(2, -1);
  switch (this.dtype) {
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
  if (typeof s.data.slice === 'undefined') {
    return new NdArray(ndarray([].slice.apply(s.data), s.shape, s.stride, s.offset)); // for legacy browsers
  }
  return new NdArray(ndarray(s.data.slice(), s.shape, s.stride, s.offset));
};

/**
* Return true if two arrays have the same shape and elements, false otherwise.
* @param {(Array|NdArray)} array
* @returns {boolean}
*/
NdArray.prototype.equal = function (array) {
  array = createArray(array);
  if (this.size !== array.size || this.ndim !== array.ndim) {
    return false;
  }
  var d = this.ndim;
  for (var i = 0; i < d; i++) {
    if (this.shape[i] !== array.shape[i]) {
      return false;
    }
  }

  return ops.equals(this.selection, array.selection);
};

/**
* Round array to the to the nearest integer.
*
* @param {boolean} [copy=true]
* @returns {NdArray}
*/
NdArray.prototype.round = function (copy) {
  if (arguments.length === 0) {
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
NdArray.prototype.negative = function () {
  var c = this.clone();
  ops.neg(c.selection, this.selection);
  return c;
};

NdArray.prototype.diag = function () {
  var d = this.ndim;
  if (d === 1) {
    // input is a vector => return a diagonal matrix
    var T = _.getType(this.dtype);
    var shape = [this.shape[0], this.shape[0]];
    var arr = new NdArray(new T(_.shapeSize(shape)), shape);
    if (arr.dtype === 'array') {
      ops.assigns(arr.selection, 0);
    }
    for (var i = 0; i < this.shape[0]; i++) arr.set(i, i, this.get(i));
    return arr;
  }
  var mshape = this.shape;
  var mstride = this.selection.stride;
  var nshape = (1 << 30);
  var nstride = 0;
  for (var i = 0; i < d; ++i) {
    nshape = Math.min(nshape, mshape[i]) | 0;
    nstride += mstride[i];
  }
  return new NdArray(this.selection.data, [nshape], [nstride], this.selection.offset);
};

NdArray.prototype.iteraxis = function (axis, cb) {
  var shape = this.shape;
  if (axis === -1) {
    axis = shape.length - 1;
  }
  if (axis < 0 || axis > shape.length - 1) {
    throw new errors.ValueError('invalid axis');
  }
  for (var i = 0; i < shape[axis]; i++) {
    var loc = new Array(axis + 1);
    for (var ii = 0; ii < axis + 1; ii++) {
      loc[ii] = (ii === axis) ? i : null;
    }
    var subArr = this.selection.pick.apply(this.selection, loc);
    var xi = createArray(unpackArray(subArr), this.dtype);
    cb(xi, i);
  }
};

var doConjMuleq = cwise({
  args: ['array', 'array', 'array', 'array'],
  body: function (xi, yi, ui, vi) {
    var a = ui;
    var b = vi;
    var c = xi;
    var d = yi;
    var k1 = c * (a + b);
    xi = k1 - b * (c + d);
    yi = k1 + a * (d - c);
  }
});

var doConvolve3x3 = cwise({
  args: [
    'array', // c
    'array', // xe
    'scalar', // fa
    'scalar', // fb
    'scalar', // fc
    'scalar', // fd
    'scalar', // fe
    'scalar', // ff
    'scalar', // fg
    'scalar', // fh
    'scalar', // fi
    {offset: [-1, -1], array: 1}, // xa
    {offset: [-1, 0], array: 1}, // xb
    {offset: [-1, 1], array: 1}, // xc
    {offset: [0, -1], array: 1}, // xd
    // {offset:[ 9,  0], array:1}, // useless since available already
    {offset: [0, 1], array: 1}, // xf
    {offset: [1, -1], array: 1}, // xg
    {offset: [1, 0], array: 1}, // xh
    {offset: [1, 1], array: 1} // xi
  ],
  body: function (c, xe, fa, fb, fc, fd, fe, ff, fg, fh, fi, xa, xb, xc, xd, xf, xg, xh, xi) {
    c = xa * fi + xb * fh + xc * fg + xd * ff + xe * fe + xf * fd + xg * fc + xh * fb + xi * fa;
  }
});

var doConvolve5x5 = cwise({
  args: [
    'index',
    'array', // c
    'array', // xm
    'scalar', // fa
    'scalar', // fb
    'scalar', // fc
    'scalar', // fd
    'scalar', // fe
    'scalar', // ff
    'scalar', // fg
    'scalar', // fh
    'scalar', // fi
    'scalar', // fj
    'scalar', // fk
    'scalar', // fl
    'scalar', // fm
    'scalar', // fn
    'scalar', // fo
    'scalar', // fp
    'scalar', // fq
    'scalar', // fr
    'scalar', // fs
    'scalar', // ft
    'scalar', // fu
    'scalar', // fv
    'scalar', // fw
    'scalar', // fx
    'scalar', // fy
    {offset: [-2, -2], array: 1}, // xa
    {offset: [-2, -1], array: 1}, // xb
    {offset: [-2, 0], array: 1}, // xc
    {offset: [-2, 1], array: 1}, // xd
    {offset: [-2, 2], array: 1}, // xe
    {offset: [-1, -2], array: 1}, // xf
    {offset: [-1, -1], array: 1}, // xg
    {offset: [-1, 0], array: 1}, // xh
    {offset: [-1, 1], array: 1}, // xi
    {offset: [-1, 2], array: 1}, // xj
    {offset: [0, -2], array: 1}, // xk
    {offset: [0, -1], array: 1}, // xl
    // {offset:[ 0,  0], array:1},
    {offset: [0, 1], array: 1}, // xn
    {offset: [0, 2], array: 1}, // xo
    {offset: [1, -2], array: 1}, // xp
    {offset: [1, -1], array: 1}, // xq
    {offset: [1, 0], array: 1}, // xr
    {offset: [1, 1], array: 1}, // xs
    {offset: [1, 2], array: 1}, // xt
    {offset: [2, -2], array: 1}, // xu
    {offset: [2, -1], array: 1}, // xv
    {offset: [2, 0], array: 1}, // xw
    {offset: [2, 1], array: 1}, // xx
    {offset: [2, 2], array: 1} // xy
  ],
  body: function (index, c, xm,
    fa, fb, fc, fd, fe, ff, fg, fh, fi, fj, fk, fl, fm, fn, fo, fp, fq, fr, fs, ft, fu, fv, fw, fx, fy,
    xa, xb, xc, xd, xe, xf, xg, xh, xi, xj, xk, xl, xn, xo, xp, xq, xr, xs, xt, xu, xv, xw, xx, xy) {
    c = (index[0] < 2 || index[1] < 2) ? 0 : xa * fy + xb * fx + xc * fw + xd * fv + xe * fu + xf * ft + xg * fs + xh * fr + xi * fq + xj * fp + xk * fo + xl * fn + xm * fm + xn * fl + xo * fk + xp * fj + xq * fi + xr * fh + xs * fg + xt * ff + xu * fe + xv * fd + xw * fc + xx * fb + xy * fa;
  }
});

/**
* Returns the discrete, linear convolution of the array using the given filter.
*
* @note: Arrays must have the same dimensions and `filter` must be smaller than the array.
* @note: The convolution product is only given for points where the signals overlap completely. Values outside the signal boundary have no effect. This behaviour is known as the 'valid' mode.
* @note: Use optimized code for 3x3, 3x3x1, 5x5, 5x5x1 filters, FFT otherwise.
*
* @param {Array|NdArray} filter
*/
NdArray.prototype.convolve = function (filter) {
  filter = NdArray.new(filter);
  var ndim = this.ndim;
  if (ndim !== filter.ndim) {
    throw new errors.ValueError('arrays must have the same dimensions');
  }
  var outShape = new Array(ndim);
  var step = new Array(ndim);
  var ts = this.selection;
  var tShape = this.shape;
  var fs = filter.selection;
  var fShape = filter.shape;

  for (var i = 0; i < ndim; i++) {
    var l = tShape[i] - fShape[i] + 1;
    if (l < 0) {
      throw new errors.ValueError('filter cannot be greater than the array');
    }
    outShape[i] = l;
    step[i] = -1;
  }

  if (ndim === 2 && fShape[0] === 3 && fShape[1] === 3) {
    var out3x3 = new NdArray(new Float32Array(_.shapeSize(tShape)), tShape);
    doConvolve3x3(
      out3x3.selection, // c
      ts, // x
      fs.get(0, 0), // fa
      fs.get(0, 1), // fb
      fs.get(0, 2), // fc
      fs.get(1, 0), // fd
      fs.get(1, 1), // fe
      fs.get(1, 2), // ff
      fs.get(2, 0), // fg
      fs.get(2, 1), // fh
      fs.get(2, 2) // fi
    );
    return out3x3.lo(1, 1).hi(outShape[0], outShape[1]);
  } else if (ndim === 3 && fShape[2] === 1 && tShape[2] === 1 && fShape[0] === 3 && fShape[1] === 3) {
    var out3x3x1 = new NdArray(new Float32Array(_.shapeSize(tShape)), tShape);
    doConvolve3x3(
      out3x3x1.selection.pick(null, null, 0), // c
      ts.pick(null, null, 0), // x
      fs.get(0, 0, 0), // fa
      fs.get(0, 1, 0), // fb
      fs.get(0, 2, 0), // fc
      fs.get(1, 0, 0), // fd
      fs.get(1, 1, 0), // fe
      fs.get(1, 2, 0), // ff
      fs.get(2, 0, 0), // fg
      fs.get(2, 1, 0), // fh
      fs.get(2, 2, 0) // fi
    );
    return out3x3x1.lo(1, 1).hi(outShape[0], outShape[1]);
  } else if (ndim === 2 && fShape[0] === 5 && fShape[1] === 5) {
    var out5x5 = new NdArray(new Float32Array(_.shapeSize(tShape)), tShape);
    doConvolve5x5(
      out5x5.selection, // c
      ts, // x
      fs.get(0, 0), // fa
      fs.get(0, 1), // fb
      fs.get(0, 2), // fc
      fs.get(0, 3), // fd
      fs.get(0, 4), // fe
      fs.get(1, 0), // ff
      fs.get(1, 1), // fg
      fs.get(1, 2), // fh
      fs.get(1, 3), // fi
      fs.get(1, 4), // fj
      fs.get(2, 0), // fk
      fs.get(2, 1), // fl
      fs.get(2, 2), // fm
      fs.get(2, 3), // fn
      fs.get(2, 4), // fo
      fs.get(3, 0), // fp
      fs.get(3, 1), // fq
      fs.get(3, 2), // fr
      fs.get(3, 3), // fs
      fs.get(3, 4), // ft
      fs.get(4, 0), // fu
      fs.get(4, 1), // fv
      fs.get(4, 2), // fw
      fs.get(4, 3), // fx
      fs.get(4, 4) // fy
    );
    return out5x5.lo(2, 2).hi(outShape[0], outShape[1]);
  } else if (ndim === 3 && fShape[2] === 1 && tShape[2] === 1 && fShape[0] === 5 && fShape[1] === 5) {
    var out5x5x1 = new NdArray(new Float32Array(_.shapeSize(tShape)), tShape);
    doConvolve5x5(
      out5x5x1.selection, // c
      ts, // x
      fs.get(0, 0, 0), // fa
      fs.get(0, 1, 0), // fb
      fs.get(0, 2, 0), // fc
      fs.get(0, 3, 0), // fd
      fs.get(0, 4, 0), // fe
      fs.get(1, 0, 0), // ff
      fs.get(1, 1, 0), // fg
      fs.get(1, 2, 0), // fh
      fs.get(1, 3, 0), // fi
      fs.get(1, 4, 0), // fj
      fs.get(2, 0, 0), // fk
      fs.get(2, 1, 0), // fl
      fs.get(2, 2, 0), // fm
      fs.get(2, 3, 0), // fn
      fs.get(2, 4, 0), // fo
      fs.get(3, 0, 0), // fp
      fs.get(3, 1, 0), // fq
      fs.get(3, 2, 0), // fr
      fs.get(3, 3, 0), // fs
      fs.get(3, 4, 0), // ft
      fs.get(4, 0, 0), // fu
      fs.get(4, 1, 0), // fv
      fs.get(4, 2, 0), // fw
      fs.get(4, 3, 0), // fx
      fs.get(4, 4, 0) // fy
    );
    return out5x5x1.lo(2, 2).hi(outShape[0], outShape[1]);
  } else {
    return this.fftconvolve(filter);
  }
};

NdArray.prototype.fftconvolve = function (filter) {
  filter = NdArray.new(filter);

  if (this.ndim !== filter.ndim) {
    throw new errors.ValueError('arrays must have the same dimensions');
  }

  var as = this.selection;
  var bs = filter.selection;
  var d = this.ndim;
  var nsize = 1;
  var nstride = new Array(d);
  var nshape = new Array(d);
  var oshape = new Array(d);
  var i;
  for (i = d - 1; i >= 0; --i) {
    nshape[i] = as.shape[i];
    nstride[i] = nsize;
    nsize *= nshape[i];
    oshape[i] = as.shape[i] - bs.shape[i] + 1;
  }

  var T = _.getType(as.dtype);
  var out = new NdArray(new T(_.shapeSize(oshape)), oshape);
  var outs = out.selection;

  var xT = ndPool.mallocDouble(nsize);
  var x = ndarray(xT, nshape, nstride, 0);
  ops.assigns(x, 0);
  ops.assign(x.hi.apply(x, as.shape), as);

  var yT = ndPool.mallocDouble(nsize);
  var y = ndarray(yT, nshape, nstride, 0);
  ops.assigns(y, 0);

  // FFT x/y
  ndFFT(1, x, y);

  var uT = ndPool.mallocDouble(nsize);
  var u = ndarray(uT, nshape, nstride, 0);
  ops.assigns(u, 0);
  ops.assign(u.hi.apply(u, bs.shape), bs);

  var vT = ndPool.mallocDouble(nsize);
  var v = ndarray(vT, nshape, nstride, 0);
  ops.assigns(v, 0);

  ndFFT(1, u, v);

  doConjMuleq(x, y, u, v);

  ndFFT(-1, x, y);

  var outShape = new Array(d);
  var outOffset = new Array(d);
  var needZeroFill = false;
  for (i = 0; i < d; ++i) {
    if (outs.shape[i] > nshape[i]) {
      needZeroFill = true;
    }
    outOffset[i] = bs.shape[i] - 1;
    outShape[i] = Math.min(outs.shape[i], nshape[i] - outOffset[i]);
  }

  var croppedX;
  if (needZeroFill) {
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

function createArray (arr, dtype) {
  if (arr instanceof NdArray) { return arr; }
  var T = _.getType(dtype);
  if (_.isNumber(arr)) {
    if (T !== Array) {
      return new NdArray(new T([arr]), [1]);
    } else {
      return new NdArray([arr], [1]);
    }
  }
  var shape = _.getShape(arr);
  if (shape.length > 1) {
    arr = _.flatten(arr, true);
  }
  if (!(arr instanceof T)) {
    arr = new T(arr);
  }
  return new NdArray(arr, shape);
}
NdArray.new = createArray;

module.exports = NdArray;

/*     utils    */
function initNativeArray (shape, i) {
  i = i || 0;
  var c = shape[i] | 0;
  if (c <= 0) { return []; }
  var result = new Array(c);
  var j;
  if (i === shape.length - 1) {
    for (j = 0; j < c; ++j) {
      result[j] = 0;
    }
  } else {
    for (j = 0; j < c; ++j) {
      result[j] = initNativeArray(shape, i + 1);
    }
  }
  return result;
}

var doUnpack = cwise({
  args: ['array', 'scalar', 'index'],
  body: function unpackCwise (arr, a, idx) {
    var v = a;
    var i;
    for (i = 0; i < idx.length - 1; ++i) {
      v = v[idx[i]];
    }
    v[idx[idx.length - 1]] = arr;
  }
});

function unpackArray (arr) {
  var result = initNativeArray(arr.shape, 0);
  doUnpack(arr, result);
  return result;
}

function formatNumber (v) {
  return String(Number((v || 0).toFixed(CONF.nFloatingValues)));
}
