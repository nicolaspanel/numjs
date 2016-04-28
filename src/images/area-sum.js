'use strict';

module.exports = function areaSum (h0, w0, H, W, SAT) {
  var x0 = w0 - 1;
  var x1 = w0 + W - 1;
  var y0 = h0 - 1;
  var y1 = h0 + H - 1;
  return (w0 !== 0 && h0 !== 0) ? SAT.selection.get(y0, x0) - SAT.selection.get(y1, x0) - SAT.selection.get(y0, x1) + SAT.selection.get(y1, x1)
    : (w0 === 0 && h0 === 0) ? SAT.selection.get(h0 + H - 1, w0 + W - 1)
      : (w0 === 0) ? -SAT.selection.get(y0, w0 + W - 1) + SAT.selection.get(h0 + H - 1, w0 + W - 1)
        : -SAT.selection.get(y1, x0) + SAT.selection.get(y1, x1);
};
