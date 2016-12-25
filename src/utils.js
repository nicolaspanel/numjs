'use strict';
var DTYPES = require('./dtypes');
var _ = require('lodash');

function isNumber (value) {
  return typeof value === 'number';
}
function isString (value) {
  return typeof value === 'string';
}
function isFunction (value) {
  return typeof value === 'function';
}

function baseFlatten (array, isDeep, result) {
  result = result || [];
  var index = -1;
  var length = array.length;

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

function shapeSize (shape) {
  var s = 1;
  for (var i = 0; i < shape.length; i++) {
    s *= shape[i];
  }
  return s;
}

function getType (dtype) {
  return isFunction(dtype) ? dtype : (DTYPES[dtype] || Array);
}

function _dim (x) {
  var ret = [];
  while (typeof x === 'object') { ret.push(x.length); x = x[0]; }
  return ret;
}

function getShape (array) {
  var y, z;
  if (typeof array === 'object') {
    y = array[0];
    if (typeof y === 'object') {
      z = y[0];
      if (typeof z === 'object') {
        return _dim(array);
      }
      return [array.length, y.length];
    }
    return [array.length];
  }
  return [];
}

// function haveSameShape (shape1, shape2) {
//   if (shapeSize(shape1) !== shapeSize(shape2) || shape1.length !== shape2.length) {
//     return false;
//   }
//   var d = shape1.length;
//   for (var i = 0; i < d; i++) {
//     if (shape1[i] !== shape2[i]) {
//       return false;
//     }
//   }
//   return true;
// }

module.exports = {
  isNumber: isNumber,
  isString: isString,
  isFunction: isFunction,
  flatten: baseFlatten,
  shapeSize: shapeSize,
  getType: getType,
  getShape: getShape,
  defaults: _.defaults
};
