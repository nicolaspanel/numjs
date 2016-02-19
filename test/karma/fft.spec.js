'use strict';


describe('fft', function () {
    it('should work on vectors', function () {
        var C = nj.random([10, 2]),
            fft = nj.fft(C),
            ifft = nj.ifft(fft);

        expect(ifft.multiply(10000).round().tolist())
            .to.eql(C.multiply(10000).round().tolist());

    });
});