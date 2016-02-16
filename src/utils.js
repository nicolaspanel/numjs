'use strict';
var DTYPES = require('./dtypes');

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

function shapeSize(shape){
    var s = 1;
    for (var i = 0; i < shape.length; i++){
        s *= shape[i];
    }
    return s;
}

function getType(dtype){
    return isFunction(dtype)? dtype: (DTYPES[dtype] || Array);
}

function _dim(x) {
    var ret = [];
    while(typeof x === 'object') { ret.push(x.length); x = x[0]; }
    return ret;
}

function getShape(array) {
    var y,z;
    if(typeof array === 'object') {
        y = array[0];
        if(typeof y === 'object') {
            z = y[0];
            if(typeof z === 'object') {
                return _dim(array);
            }
            return [array.length,y.length];
        }
        return [array.length];
    }
    return [];
}

module.exports = {
    isNumber:isNumber,
    isString: isString,
    isFunction: isFunction,
    flatten: baseFlatten,
    shapeSize: shapeSize,
    getType: getType,
    getShape: getShape
};