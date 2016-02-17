var nj = require('../src');
var S = 100;
var img = nj.arange(S * S).reshape(S,S);
var start = new Date().valueOf();

var FILTER_H = nj.array([
        [ 1, 2, 1],
        [ 0, 0, 0],
        [-1,-2,-1]]).divide(4, false),
    FILTER_V = FILTER_H.T;

var sobel;
for (var i=0;i<100;i++){
    var H = img.convolve(FILTER_H);
    var V= img.convolve(FILTER_V);
    sobel = nj.add(H.pow(2), V.pow(2)).sqrt(false).divide(Math.sqrt(2), false);
}

console.log('duration: %dms', new Date().valueOf() - start);
console.log('sobel: \n', sobel);
/*
CWISE
S=10000: 40ms

---
CONV full
S=1000: 2552ms 2509ms

---
CONV SEP
 S=1000: 4942ms 5180ms
 */
