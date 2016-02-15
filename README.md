
__Num4JS__ is a npm/bower package for scientific computing with JavaScript. It contains among other things:
 - a powerful N-dimensional array object
 - linear algebra function
 - fast Fourier transform
 - image manipulation capabilities

Besides its obvious scientific uses, __Num4JS__ can also be used as an efficient multi-dimensional container of generic data such as images.

It works both in node.js and in the browser (with or without [browserify](http://browserify.org/))

__Num4JS__ is licensed under the [MIT license](https://github.com/nicolaspanel/num4js/blob/master/LICENSE), enabling reuse with almost no restrictions.

## Installation

### on node.js

```sh
npm install num4js
```

```js
var nj = require('num4js');
...
```

### on the browser
```sh
bower install num4js
```

```html
<script src="bower_packages/num4js/num4js.min.js"></script>
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

__Note__: Default data container is Javascript `Array` object. If needed, you can also use typed array such as `Int8Array`:

```js
> var a = nj.uint8([1,2,3]);
> a
array([ 1, 2, 3], dtype=uint8)
```

__Note__: possible types are int8, uint8, int16, uint16, int32, uint32, float32, float64 and array (the default)

To create arrays with a given shape, you can use `zeros`, ones or `random` functions:

```js
> nj.zeros([2,3]);
array([[ 0, 0, 0],
       [ 0, 0, 0]])
> nj.ones([2,3,4], nj.dtypes.int32)     // dtype can also be specified
array([[[ 1, 1, 1, 1],
        [ 1, 1, 1, 1],
        [ 1, 1, 1, 1]],
       [[ 1, 1, 1, 1],
        [ 1, 1, 1, 1],
        [ 1, 1, 1, 1]]], dtype=int32)

> nj.random([4,3])
array([[ 0.9182 , 0.85176,0.22587],
       [ 0.50088, 0.74376,0.84024],
       [ 0.74045, 0.23345,0.20289],
       [ 0.00612, 0.37732,0.06932]])
```

To create sequences of numbers, __Num4JS__ provides a function called `arange`:

```js
> nj.arange(4);
array([ 0, 1, 2, 3])

> nj.arange( 10, 30, 5 )
array([ 10, 15, 20, 25])

> nj.arange(1, 5, nj.dtypes.uint8);
array([ 1, 2, 3, 4], dtype=uint8)
```

### More info about the array

__Num4JS__’s array class is called `NdArray`. It is also known by the alias `array`. The more important properties of an `NdArray` object are:
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

When you print an array, __Num4JS__ displays it in a similar way to nested lists, but with the following layout:
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

If an array is too large to be printed, __Num4JS__ automatically skips the central part of the array and only prints the corners:

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

### Basic operations

Arithmetic operators such as `*` (`multiply`), `+` (`add`), `-` (`subtract`), `/` (`divide`), `**` (`pow`) apply elemen-twise. A new array is created and filled with the result:

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
```
__Note__: available for `add`, `subtract`, `multiply`, `divide` and `pow` methods.


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
array([[0.3658842062577605, 0.740412384737283, 0.5527098260354251],
       [0.4542409502901137,0.07926959334872663,0.3524212788324803]])
>
> a.sum()
2.544938239501789
>
> a.min()
0.07926959334872663
>
> a.max()
0.740412384737283
>
> a.mean()
0.4241563732502982
>
> a.std()
0.20204677551180758
```

### Universal Functions
__Num4JS__ provides familiar mathematical functions such as `sin`, `cos`, and `exp`. These functions operate element-wise on an array, producing an `NdArray` as output:

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
array([0.3678794411714424, 1, 2.718281828459045])
>
> nj.tanh(a)
array([-0.7615941559557649, 0, 0.761594155955765])
>
> nj.softmax(a)
array([0.09003057317038048,0.24472847105479767, 0.6652409557748219])
>
> nj.sigmoid(a)
array([ 0.2689414213699951, 0.5, 0.7310585786300049])
>
> nj.exp(a)
array([0.3678794411714424, 1, 2.718281828459045])
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


### Convolution

`convolve` function can be used to compute the discrete, linear convolution of two multi-dimensional array:
```js
> x = nj.array([0,0,1,2,1,0,0])
array([ 0, 0, 1, 2, 1, 0, 0])
>
> nj.convolve(x, [-1,0,1])
array([-1,-2, 0, 2, 1])
>
> var a = nj.arange(25).reshape(5,5)
undefined
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

__Note__: `convolve` uses FFT to speed up computation on large arrays.



### More ?
See [documentation](http://nicolaspanel.github.io/num4js/global.html).


## TODO

 - Add image processing features (such as read/save/resize/sobel/etc...)

## Credits
__Num4JS__ is built on top of [ndarray](http://scijs.net/packages/#scijs/ndarray) and uses many [scijs packages](http://scijs.net/packages/)

