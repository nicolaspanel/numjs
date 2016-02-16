var nj = require('../src');
var S = 1000;
var img = nj.arange(S * S).reshape(S,S);
var start = new Date().valueOf();

nj.images.sobel(img);

console.log('duration: %dms', new Date().valueOf() - start);

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
