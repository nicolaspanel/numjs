/* eslint-env jasmine */
'use strict';

describe('empty', function () {
  it('can generate a vectors', function () {
    expect(nj.empty(0).tolist()).to.eql([]);
    expect(nj.empty(2).tolist()).to.eql([undefined, undefined]);
    expect(nj.empty([2]).tolist()).to.eql([undefined, undefined]);
  });

  it('can generate matrix', function () {
    expect(nj.empty([2, 2]).tolist())
      .to.eql([[undefined, undefined], [undefined, undefined]]);
  });

  it('should accept a dtype', function () {
    expect(nj.empty(0, 'uint8').dtype).to.equal('uint8');
  });
});
