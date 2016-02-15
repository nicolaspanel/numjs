
__Num4JS__ is a npm/bower package for scientific computing with JavaScript. It contains among other things:
 - a powerful N-dimensional array object
 - linear algebra function
 - fast Fourier transform
 - image manipulation capabilities


It works both in node.js and in the browser (with or without [browserify](http://browserify.org/))


## Getting started

### on node.js

```sh
npm install num4js
```


### on the browser
```sh
bower install num4js
```

```html
<script src="bower_packages/num4js/num4js.min.js"></script>
```

## Basics

```js
> var nj = require('num4js') // for nodejs only

// array manipulations
> var a = nj.arange(15).reshape(3, 5)
> a
array([[  0,  1,  2,  3,  4],
       [  5,  6,  7,  8,  9],
       [ 10, 11, 12, 13, 14]])

> a.shape
[ 3, 5]
> a.ndim
2
> a.dtype
'array'
> a instanceof nj.NdArray
true
> a.tolist() instanceof Array
true
> a.get(1,1)
6
> a.set(0,0,1)
> a
array([[  1,  1,  2,  3,  4],
       [  5,  6,  7,  8,  9],
       [ 10, 11, 12, 13, 14]])


// array types
> var b = nj.array([0,1,2], nj.dtypes.uint8)
> b
array([ 0, 1, 2], dtype=uint8)
// NOTES: possible types are int8, uint8, int16, uint16, int32, uint32, float32, float64 and array (default)


// Operations
> var zeros = nj.zeros([3,4])
> zeros
array([[ 0, 0, 0, 0],
       [ 0, 0, 0, 0],
       [ 0, 0, 0, 0]])
> var ones = nj.ones([3,4])
> ones
array([[ 1, 1, 1, 1],
       [ 1, 1, 1, 1],
       [ 1, 1, 1, 1]])
> nj.equal(zeros.add(1), ones)
true
> nj.equal(ones.multiply(-1), ones.negative())
true
> nj.dot(a.T, a)
array([[ 3, 3, 3, 3],
       [ 3, 3, 3, 3],
       [ 3, 3, 3, 3],
       [ 3, 3, 3, 3]])

> var c = nj.arange(16).reshape(4,4)
> c
array([[  0,  1,  2,  3],
       [  4,  5,  6,  7],
       [  8,  9, 10, 11],
       [ 12, 13, 14, 15]])


// Slicing and selections
> var selection = c.lo(1,1).hi(2,2)
> selection
array([[  5,  6],
       [  9, 10]])

> selection.add(1) // create a new array
array([[  6,  7],
       [ 10, 11]])
> selection
array([[  5,  6],
       [  9, 10]])

> selection.add(1, false) // do NOT create a new Array, modify selecition's data instead
> selection
array([[  6,  7],
       [ 10, 11]])
> selection.transpose()

> c  // since the selection shares its data with c, c has changed too
array([[  0,  1,  2,  3],
       [  4,  6,  7,  7],
       [  8, 10, 11, 11],
       [ 12, 13, 14, 15]])

> c.pick(1)
array([  4,  6,  7,  7])

> c.pick(null, 1)
array([  1,  6,  10, 13])
```

## Doc
See [documentation](http://nicolaspanel.github.io/num4js/global.html)


## TODO
 - Support broadcasting for additions and multiplications

## Credits
__Num4JS__ is built on top of [ndarray](http://scijs.net/packages/#scijs/ndarray) and uses many [scijs packages](http://scijs.net/packages/)

