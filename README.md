[![Build Status](https://travis-ci.org/nicolaspanel/numjs.png)](https://travis-ci.org/nicolaspanel/numjs) [![npm version](https://badge.fury.io/js/numjs.svg)](https://badge.fury.io/js/numjs) [![Bower version](https://badge.fury.io/bo/numjs.svg)](https://badge.fury.io/bo/numjs) [![Built with Grunt](https://cdn.gruntjs.com/builtwith.svg)](http://gruntjs.com/)

__NumJs__ is a npm/bower package for scientific computing with JavaScript. It contains among other things:
 - a powerful N-dimensional array object
 - linear algebra function
 - fast Fourier transform
 - tools for basic image processing

Besides its obvious scientific uses, __NumJs__ can also be used as an efficient multi-dimensional container of generic data.

It works both in node.js and in the browser (with or without [browserify](http://browserify.org/))

__NumJs__ is licensed under the [MIT license](https://github.com/nicolaspanel/numjs/blob/master/LICENSE), enabling reuse with almost no restrictions.

__[See this jsfiddle](https://jsfiddle.net/nicolaspanel/047gwg0q/)__ for a concrete example of how to use the library to manipulate images in the browser.

## Installation

### on node.js

```sh
npm install numjs
```

```js
var nj = require('numjs');
...
```

### on the browser
```sh
bower install numjs
```

```html
<script src="bower_packages/numjs/dist/numjs.min.js"></script>
<!-- or include it directly from a CDN -->
<script src="https://cdn.jsdelivr.net/gh/nicolaspanel/numjs@0.15.1/dist/numjs.min.js"></script>
```

## Basics

### Array Creation

```js
> var a = nj.array([2,3,4]);
> a
array([ 2, 3, 4])
> var b = nj.array([[1,2,3], [4,5,6]]);
> b
array([[ 1, 2, 3],
       [ 4, 5, 6]])
```

__Note__: Default data container is Javascript `Array` object. If needed, you can also use typed array such as `Uint8Array`:

```js
> var a = nj.uint8([1,2,3]);
> a
array([ 1, 2, 3], dtype=uint8)
```

__Note__: possible types are int8, uint8, int16, uint16, int32, uint32, float32, float64 and array (the default)

To create arrays with a given shape, you can use `zeros`, `ones` or `random` functions:

```js
> nj.zeros([2,3]);
array([[ 0, 0, 0],
       [ 0, 0, 0]])
> nj.ones([2,3,4], 'int32')     // dtype can also be specified
array([[[ 1, 1, 1, 1],
        [ 1, 1, 1, 1],
        [ 1, 1, 1, 1]],
       [[ 1, 1, 1, 1],
        [ 1, 1, 1, 1],
        [ 1, 1, 1, 1]]], dtype=int32)

> nj.random([4,3])
array([[ 0.9182 , 0.85176, 0.22587],
       [ 0.50088, 0.74376, 0.84024],
       [ 0.74045, 0.23345, 0.20289],
       [ 0.00612, 0.37732, 0.06932]])
```

To create sequences of numbers, __NumJs__ provides a function called `arange`:

```js
> nj.arange(4);
array([ 0, 1, 2, 3])

> nj.arange( 10, 30, 5 )
array([ 10, 15, 20, 25])

> nj.arange(1, 5, 'uint8');
array([ 1, 2, 3, 4], dtype=uint8)
```

### More info about the array

__NumJs__’s array class is called `NdArray`. It is also known by the alias `array`. The more important properties of an `NdArray` object are:
 - `NdArray#ndim`: the number of axes (dimensions) of the array.
 - `NdArray#shape`: the dimensions of the array. This is a list of integers indicating the size of the array in each dimension. For a matrix with n rows and m columns, shape will be [n,m]. The length of the shape is therefore the number of dimensions, ndim.
 - `NdArray#size`: the total number of elements of the array. This is equal to the product of the elements of shape.
 - `NdArray#dtype`: a string describing the type of the elements in the array. `int32`, `int16`, and `float64` are some examples. Default dtype is `array`.

An `NdArray` can always be converted to a native JavaScript `Array` using `NdArray#tolist()` method.


Example:
```js
> a = nj.arange(15).reshape(3, 5);
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

```

### Printing arrays

When you print an array, __NumJs__ displays it in a similar way to nested lists, but with the following layout:
 - the last axis is printed from left to right,
 - the second-to-last is printed from top to bottom,
 - the rest are also printed from top to bottom, with each slice separated from the next by an empty line.

One-dimensional arrays are then printed as rows, bidimensionals as matrices and tridimensionals as lists of matrices.

```js
> var a = nj.arange(6);                 // 1d array
> console.log(a);
array([ 0, 1, 2, 3, 4, 5])
>
> var b = nj.arange(12).reshape(4,3);   // 2d array
> console.log(b);
array([[  0,  1,  2],
       [  3,  4,  5],
       [  6,  7,  8],
       [  9, 10, 11]])
>
> var c = nj.arange(24).reshape(2,3,4); // 3d array
> console.log(c);
array([[[  0,  1,  2,  3],
        [  4,  5,  6,  7],
        [  8,  9, 10, 11]],
       [[ 12, 13, 14, 15],
        [ 16, 17, 18, 19],
        [ 20, 21, 22, 23]]])

```

If an array is too large to be printed, __NumJs__ automatically skips the central part of the array and only prints the corners:

```js
> console.log(nj.arange(10000).reshape(100,100))
array([[    0,    1, ...,   98,   99],
       [  100,  101, ...,  198,  199],
        ...
       [ 9800, 9801, ..., 9898, 9899],
       [ 9900, 9901, ..., 9998, 9999]])
```

To customize this behaviour, you can change the printing options using `nj.config.printThreshold` (default is `7`):
```js
> nj.config.printThreshold = 9;
> console.log(nj.arange(10000).reshape(100,100))
array([[    0,    1,    2,    3, ...,   96,   97,   98,   99],
       [  100,  101,  102,  103, ...,  196,  197,  198,  199],
       [  200,  201,  202,  203, ...,  296,  297,  298,  299],
       [  300,  301,  302,  303, ...,  396,  397,  398,  399],
        ...
       [ 9600, 9601, 9602, 9603, ..., 9696, 9697, 9698, 9699],
       [ 9700, 9701, 9702, 9703, ..., 9796, 9797, 9798, 9799],
       [ 9800, 9801, 9802, 9803, ..., 9896, 9897, 9898, 9899],
       [ 9900, 9901, 9902, 9903, ..., 9996, 9997, 9998, 9999]])

```

### Indexing

Single element indexing  uses `get` and `set` methods. It is 0-based, and accepts negative indices for indexing from the end of the array:
```js
> var a = nj.array([0,1,2]);
> a.get(1)
1
>
> a.get(-1)
2
>
> var b = nj.arange(3*3).reshape(3,3);
> b
array([[  0,  1,  2],
       [  3,  4,  5],
       [  6,  7,  8])
>
> b.get(1, 1);
4
>
> b.get(-1, -1);
8
> b.set(0,0,1);
> b
array([[ 1, 1, 2],
       [ 3, 4, 5],
       [ 6, 7, 8]])
```


### Slicing and Striding

It is possible to slice and stride arrays to extract arrays of the same number of dimensions, but of different sizes than the original. The slicing and striding works exactly the same way it does in NumPy:

```js
> var a = nj.arange(5);
> a
array([  0,  1,  2,  3,  4])
>
> a.slice(1) // skip the first item, same as a[1:]
array([ 1, 2, 3, 4])
>
> a.slice(-3) // takes the last 3 items, same as a[-3:]
array([ 2, 3, 4])
>
> a.slice([4]) // takes the first 4 items, same as a[:4]
array([ 0, 1, 2, 3])
>
> a.slice([-2]) // skip the last 2 items, same as a[:-2]
array([ 0, 1, 2])
>
> a.slice([1,4]) // same as a[1:4]
array([ 1, 2, 3])
>
> a.slice([1,4,-1]) // same as a[1:4:-1]
array([ 3, 2, 1])
>
> a.slice([null,null,-1]) // same as a[::-1]
array([ 4, 3, 2, 1, 0])
>
> var b = nj.arange(5*5).reshape(5,5);
> b
array([[  0,  1,  2,  3,  4],
       [  5,  6,  7,  8,  9],
       [ 10, 11, 12, 13, 14],
       [ 15, 16, 17, 18, 19],
       [ 20, 21, 22, 23, 24]])
>
> b.slice(1,2) //  skip the first row and the 2 first  columns, same as b[1:,2:]
array([[  7,  8,  9],
       [ 12, 13, 14],
       [ 17, 18, 19],
       [ 22, 23, 24]])
>
> b.slice(null, [null, null, -1]) // reverse rows, same as b[:, ::-1]
array([[  4,  3,  2,  1,  0],
       [  9,  8,  7,  6,  5],
       [ 14, 13, 12, 11, 10],
       [ 19, 18, 17, 16, 15],
       [ 24, 23, 22, 21, 20]])
```

Note that slices do not copy the internal array data, it produces a new views of the original data.

### Basic operations

Arithmetic operators such as `*` (`multiply`), `+` (`add`), `-` (`subtract`), `/` (`divide`), `**` (`pow`), `=` (`assign`) apply elemen-twise. A new array is created and filled with the result:

```js
> zeros = nj.zeros([3,4]);
array([[ 0, 0, 0, 0],
       [ 0, 0, 0, 0],
       [ 0, 0, 0, 0]])
>
> ones = nj.ones([3,4]);
array([[ 1, 1, 1, 1],
       [ 1, 1, 1, 1],
       [ 1, 1, 1, 1]])
>
> ones.add(ones)
array([[ 2, 2, 2, 2],
       [ 2, 2, 2, 2],
       [ 2, 2, 2, 2]])
>
> ones.subtract(ones)
array([[ 0, 0, 0, 0],
       [ 0, 0, 0, 0],
       [ 0, 0, 0, 0]])
>
> zeros.pow(zeros)
array([[ 1, 1, 1, 1],
       [ 1, 1, 1, 1],
       [ 1, 1, 1, 1]])
>
```

To modify an existing array rather than create a new one you can set the `copy` parameter to `false`:

```js
> ones = nj.ones([3,4]);
array([[ 1, 1, 1, 1],
       [ 1, 1, 1, 1],
       [ 1, 1, 1, 1]])
>
> ones.add(ones, false)
array([[ 2, 2, 2, 2],
       [ 2, 2, 2, 2],
       [ 2, 2, 2, 2]])
>
> ones
array([[ 2, 2, 2, 2],
       [ 2, 2, 2, 2],
       [ 2, 2, 2, 2]])
>
> zeros = nj.zeros([3,4])
> zeros.slice([1,-1],[1,-1]).assign(1, false);
> zeros
array([[ 0, 0, 0, 0],
       [ 0, 1, 1, 0],
       [ 0, 0, 0, 0]])
```
__Note__: available for `add`, `subtract`, `multiply`, `divide`, `assign` and `pow` methods.


The matrix product can be performed using the `dot` function:

```js
> a = nj.arange(12).reshape(3,4);
array([[  0,  1,  2,  3],
       [  4,  5,  6,  7],
       [  8,  9, 10, 11]])
>
> nj.dot(a.T, a)
array([[  80,  92, 104, 116],
       [  92, 107, 122, 137],
       [ 104, 122, 140, 158],
       [ 116, 137, 158, 179]])
>
> nj.dot(a, a.T)
array([[  14,  38,  62],
       [  38, 126, 214],
       [  62, 214, 366]])
```

Many unary operations, such as computing the sum of all the elements in the array, are implemented as methods of the `NdArray` class:

```js
> a = nj.random([2,3])
array([[0.62755, 0.8278,0.21384],
       [ 0.7029,0.27584,0.46472]])
> a.sum()
3.1126488673035055
>
> a.min()
0.2138431086204946
>
> a.max()
0.8278025290928781
>
> a.mean()
0.5187748112172509
>
> a.std()
0.22216977543691244
```

### Universal Functions
__NumJs__ provides familiar mathematical functions such as `sin`, `cos`, and `exp`. These functions operate element-wise on an array, producing an `NdArray` as output:

```js
> a = nj.array([-1, 0, 1])
array([-1, 0, 1])
>
> nj.negative(a)
array([ 1, 0,-1])
>
> nj.abs(a)
array([ 1, 0, 1])
>
> nj.exp(a)
array([ 0.36788,       1, 2.71828])
>
> nj.tanh(a)
array([-0.76159,       0, 0.76159])
>
> nj.softmax(a)
array([ 0.09003, 0.24473, 0.66524])
>
> nj.sigmoid(a)
array([ 0.26894,     0.5, 0.73106])
>
> nj.exp(a)
array([ 0.36788,       1, 2.71828])
>
> nj.log(nj.exp(a))
array([-1, 0, 1])
>
> nj.sqrt(nj.abs(a))
array([ 1, 0, 1])
>
> nj.sin(nj.arcsin(a))
array([-1, 0, 1])
>
> nj.cos(nj.arccos(a))
array([-1, 0, 1])
>
> nj.tan(nj.arctan(a))
array([-1, 0, 1])
```

### Shape Manipulation
An array has a shape given by the number of elements along each axis:

```js
> a = nj.array([[  0,  1,  2,  3], [  4,  5,  6,  7], [  8,  9, 10, 11]]);
array([[  0,  1,  2,  3],
       [  4,  5,  6,  7],
       [  8,  9, 10, 11]])

> a.shape
[ 3, 4 ]
```

The shape of an array can be changed with various commands:
```js
> a.flatten();
array([  0,  1,  2, ...,  9, 10, 11])
>
> a.T                   // equivalent to a.transpose(1,0)
array([[  0,  4,  8],
       [  1,  5,  9],
       [  2,  6, 10],
       [  3,  7, 11]])
>
> a.reshape(4,3)
array([[  0,  1,  2],
       [  3,  4,  5],
       [  6,  7,  8],
       [  9, 10, 11]])
>
```

Since `a` is matrix we may want its diagonal:
```js
> nj.diag(a)
array([  0,  5, 10])
>
```

### Identity matrix
The identity array is a square array with ones on the main diagonal:

```js
> nj.identity(3)
array([[ 1, 0, 0],
       [ 0, 1, 0],
       [ 0, 0, 1]])
```

### Concatenate different arrays

Several arrays can be stacked together using `concatenate` function:

```js
> a = nj.arange(12).reshape(3,4)
array([[  0,  1,  2,  3],
       [  4,  5,  6,  7],
       [  8,  9, 10, 11]])
>
> b = nj.arange(3)
array([ 0, 1, 2])
>
> nj.concatenate(a,b.reshape(3,1))
array([[  0,  1,  2,  3,  0],
       [  4,  5,  6,  7,  1],
       [  8,  9, 10, 11,  2]])
```

__Notes__:
 - the arrays must have the same shape, except in the last dimension
 - arrays are concatenated along the last axis

It is still possible to concatenate along other dimensions using transpositions:

```js
> a = nj.arange(12).reshape(3,4)
array([[  0,  1,  2,  3],
       [  4,  5,  6,  7],
       [  8,  9, 10, 11]])
>
> b = nj.arange(4)
array([ 0, 1, 2, 3])
>
> nj.concatenate(a.T,b.reshape(4,1)).T
array([[  0,  1,  2,  3],
       [  4,  5,  6,  7],
       [  8,  9, 10, 11],
       [  0,  1,  2,  3]])
```


### Stack multiple arrays

```js
> a = nj.array([1, 2, 3])
> b = nj.array([2, 3, 4])

> np.stack([a, b])
array([[1, 2, 3],
       [2, 3, 4]])
> np.stack([a, b], -1)
array([[1, 2],
       [2, 3],
       [3, 4]])
```

__Notes__:
 - the arrays must have the same shape
 - take an optional axis argument which can be negative

### Deep Copy
The `clone` method makes a complete copy of the array and its data.

```js
> a = nj.arange(12).reshape(3,4)
array([[  0,  1,  2,  3],
       [  4,  5,  6,  7],
       [  8,  9, 10, 11]])
>
> b = a.clone()
array([[  0,  1,  2,  3],
       [  4,  5,  6,  7],
       [  8,  9, 10, 11]])
>
> a === b
false
>
> a.set(0,0,1)
> a
array([[  1,  1,  2,  3],
       [  4,  5,  6,  7],
       [  8,  9, 10, 11]])
> b
array([[  0,  1,  2,  3],
       [  4,  5,  6,  7],
       [  8,  9, 10, 11]])
```

### Fast Fourier Transform (FFT)
`fft` and `ifft` functions can be used to compute the N-dimensional discrete Fourier Transform and its inverse.

Example:
```js
> RI = nj.concatenate(nj.ones([10,1]), nj.zeros([10,1]))
array([[ 1, 0],
       [ 1, 0],
       [ 1, 0],
        ...
       [ 1, 0],
       [ 1, 0],
       [ 1, 0]])
>
> fft = nj.fft(RI)
array([[ 10,  0],
       [  0,  0],
       [  0,  0],
        ...
       [  0,  0],
       [  0,  0],
       [  0,  0]])
>
> nj.ifft(fft)
array([[ 1, 0],
       [ 1, 0],
       [ 1, 0],
        ...
       [ 1, 0],
       [ 1, 0],
       [ 1, 0]])
```
__Note__: both `fft` and `ifft` expect last dimension of the array to contain 2 values: the real and the imaginary value


### Convolution

`convolve` function compute the discrete, linear convolution of two multi-dimensional arrays.

__Note__: The convolution product is only given for points where the signals overlap completely. Values outside the signal boundary have no effect. This behaviour is also known as the 'valid' mode.


Example:
```js
> x = nj.array([0,0,1,2,1,0,0])
array([ 0, 0, 1, 2, 1, 0, 0])
>
> nj.convolve(x, [-1,0,1])
array([-1,-2, 0, 2, 1])
>
> var a = nj.arange(25).reshape(5,5)
> a
array([[  0,  1,  2,  3,  4],
       [  5,  6,  7,  8,  9],
       [ 10, 11, 12, 13, 14],
       [ 15, 16, 17, 18, 19],
       [ 20, 21, 22, 23, 24]])
> nj.convolve(a, [[ 1, 2, 1], [ 0, 0, 0], [-1,-2,-1]])
array([[ 40, 40, 40],
       [ 40, 40, 40],
       [ 40, 40, 40]])
> nj.convolve(nj.convolve(a, [[1, 2, 1]]), [[1],[0],[-1]])
array([[ 40, 40, 40],
       [ 40, 40, 40],
       [ 40, 40, 40]])
```

__Note__: `convolve` uses Fast Fourier Transform (FFT) to speed up computation on large arrays.


### Other utils
`rot90`
```js
> m = nj.array([[1,2],[3,4]], 'int')
> m
array([[1, 2],
       [3, 4]])
> nj.rot90(m)
array([[2, 4],
       [1, 3]])
> nj.rot90(m, 2)
array([[4, 3],
       [2, 1]])
> m = nj.arange(8).reshape([2,2,2])
> nj.rot90(m, 1, [1,2])
array([[[1, 3],
        [0, 2]],
      [[5, 7],
       [4, 6]]])
```

`mod` (since v0.16.0)
```js
> nj.mod(nj.arange(7), 5)
> m
array([0, 1, 2, 3, 4, 0, 1])
```


## Images manipulation
__NumJs__’s comes with powerful functions for image processing. Theses function are located in `nj.images` module.

The different color bands/channels are stored using the `NdArray` object such that a grey-image is `[H,W]`, an RGB-image is `[H,W,3]` and an RGBA-image is `[H,W,4]`.

Use `nj.images.read`, `nj.images.write` and `nj.images.resize` functions to (respectively) read, write or resize images.

Example:
```js
> nj.config.printThreshold = 28;
>
> var img = nj.images.data.digit;  // WARN: this is a property, not a function. See also `nj.images.data.moon`, `nj.images.data.lenna` and `nj.images.data.node`
>
> img
array([[   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0],
       [   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0],
       [   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0],
       [   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0],
       [   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0],
       [   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   3,  18,  18,  18, 126, 136, 175,  26, 166, 255, 247, 127,   0,   0,   0,   0],
       [   0,   0,   0,   0,   0,   0,   0,   0,  30,  36,  94, 154, 170, 253, 253, 253, 253, 253, 225, 172, 253, 242, 195,  64,   0,   0,   0,   0],
       [   0,   0,   0,   0,   0,   0,   0,  49, 238, 253, 253, 253, 253, 253, 253, 253, 253, 251,  93,  82,  82,  56,  39,   0,   0,   0,   0,   0],
       [   0,   0,   0,   0,   0,   0,   0,  18, 219, 253, 253, 253, 253, 253, 198, 182, 247, 241,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0],
       [   0,   0,   0,   0,   0,   0,   0,   0,  80, 156, 107, 253, 253, 205,  11,   0,  43, 154,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0],
       [   0,   0,   0,   0,   0,   0,   0,   0,   0,  14,   1, 154, 253,  90,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0],
       [   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 139, 253, 190,   2,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0],
       [   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,  11, 190, 253,  70,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0],
       [   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,  35, 241, 225, 160, 108,   1,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0],
       [   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,  81, 240, 253, 253, 119,  25,   0,   0,   0,   0,   0,   0,   0,   0,   0],
       [   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,  45, 186, 253, 253, 150,  27,   0,   0,   0,   0,   0,   0,   0,   0],
       [   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,  16,  93, 252, 253, 187,   0,   0,   0,   0,   0,   0,   0,   0],
       [   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 249, 253, 249,  64,   0,   0,   0,   0,   0,   0,   0],
       [   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,  46, 130, 183, 253, 253, 207,   2,   0,   0,   0,   0,   0,   0,   0],
       [   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,  39, 148, 229, 253, 253, 253, 250, 182,   0,   0,   0,   0,   0,   0,   0,   0],
       [   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,  24, 114, 221, 253, 253, 253, 253, 201,  78,   0,   0,   0,   0,   0,   0,   0,   0,   0],
       [   0,   0,   0,   0,   0,   0,   0,   0,  23,  66, 213, 253, 253, 253, 253, 198,  81,   2,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0],
       [   0,   0,   0,   0,   0,   0,  18, 171, 219, 253, 253, 253, 253, 195,  80,   9,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0],
       [   0,   0,   0,   0,  55, 172, 226, 253, 253, 253, 253, 244, 133,  11,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0],
       [   0,   0,   0,   0, 136, 253, 253, 253, 212, 135, 132,  16,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0],
       [   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0],
       [   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0],
       [   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0]], dtype=uint8)
> var resized = nj.images.resize(img, 14, 12)
>
> resized.shape
[ 14, 12 ]
>
> resized
array([[   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0],
       [   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0],
       [   0,   0,   0,   0,   0,   6,   9,  66,  51, 106,  94,   0],
       [   0,   0,  13, 140, 189, 233, 253, 253, 143, 159,  75,   0],
       [   0,   0,   5, 178, 217, 241,  98, 172,   0,   0,   0,   0],
       [   0,   0,   0,   4,  74, 197,   1,   0,   0,   0,   0,   0],
       [   0,   0,   0,   0,   3, 180, 114,  28,   0,   0,   0,   0],
       [   0,   0,   0,   0,   0,  21, 182, 220,  51,   0,   0,   0],
       [   0,   0,   0,   0,   0,   0,   4, 149, 236,  16,   0,   0],
       [   0,   0,   0,   0,   0,  47, 165, 236, 224,   1,   0,   0],
       [   0,   0,   0,  23, 152, 245, 240, 135,  20,   0,   0,   0],
       [   0,  57, 167, 245, 251, 148,  23,   0,   0,   0,   0,   0],
       [   0,  98, 127,  87,  37,   0,   0,   0,   0,   0,   0,   0],
       [   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0]], dtype=uint8)
```

See also [this jsfiddle](https://jsfiddle.net/nicolaspanel/047gwg0q/) for more details on what is possible from the browser.


## More ?
See documentation on [numjs globals](http://nicolaspanel.github.io/numjs/global.html) and
[NdArray methods](http://nicolaspanel.github.io/numjs/NdArray.html).



## Credits
__NumJs__ is built on top of [ndarray](http://scijs.net/packages/#scijs/ndarray) and uses many [scijs packages](http://scijs.net/packages/)
