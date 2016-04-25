'use strict';
var nj = require('../src'),
    numeric = require('numeric');

var experiments =[
    {shape: [1000], n: 200, dtype: 'float64'},
    {shape: [100,100], n:200, dtype: 'float64'},
    {shape: [1000,100], n:200, dtype: 'float64'}
];
var start;

start = +new Date();
experiments.forEach(function (exp) {
    var a = numeric.rep(exp.shape, 0);
    for (var i=0; i<exp.n; i++){
        numeric.add(a,a);
        numeric.div(a,a);
        numeric.dot(numeric.transpose(a), a);
    }
});
console.log('numericjs took %dms', +new Date() - start);

start = +new Date();
experiments.forEach(function (exp) {
    var a = nj.zeros(exp.shape, exp.dtype);
    for (var i=0; i<exp.n; i++){
        nj.add(a,a);
        nj.divide(a,a);
        nj.dot(a.T, a);
    }
});
console.log('numjs took %dms', +new Date() - start);
