/* eslint-env jasmine */
'use strict';

describe('add', function () {
  var v;
  var m;
  beforeEach(function () {
    v = nj.arange(3);
    m = nj.arange(3 * 2).reshape([3, 2]);
  });
  it('can add a scalar to a vector and create a new copy', function () {
    var newV = nj.add(v, 1);
    expect(newV).not.to.equal(v); // should have create a copy
    expect(newV.tolist())
      .to.eql([1, 2, 3]);
  });
  it('can add a scalar to a vector without crating a copy', function () {
    var newV = v.add(1, false);
    expect(newV).to.equal(v); // should NOT have create a copy
    expect(v.tolist())
      .to.eql([1, 2, 3]);
  });

  it('can sum 2 vector', function () {
    var newV = v.add(v);
    expect(newV).not.to.equal(v); // should have create a copy
    expect(newV.tolist())
      .to.eql([0, 2, 4]);
  });

  it('can add a scalar to a matrix', function () {
    var newMatrix = m.add(1);
    expect(newMatrix).not.to.equal(m); // should have create a copy
    expect(newMatrix.tolist())
      .to.eql([[1, 2], [3, 4], [5, 6]]);
  });

  it('can sum 2 matrx', function () {
    var newV = m.add(m);
    expect(newV).not.to.equal(m); // should have create a copy
    expect(newV.tolist())
      .to.eql([[0, 2], [4, 6], [8, 10]]);
  });
});
