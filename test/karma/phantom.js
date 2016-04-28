'use strict';
// PhantomJS doesn't support bind yet
if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) { // eslint-disable-line
    if (typeof this !== 'function') {
      // au plus proche de la fonction interne
      // ECMAScript 5 IsCallable
      throw new TypeError('Function.prototype.bind - ce qui est à lier ne peut être appelé');
    }

    var aArgs = Array.prototype.slice.call(arguments, 1);
    var fToBind = this;
    var FNOP = function () {};
    var fBound = function () {
      return fToBind.apply(this instanceof FNOP
        ? this
        : oThis,
        aArgs.concat(Array.prototype.slice.call(arguments)));
    };
    if (this.prototype) {
      // Les fonctions natives (Function.prototype) n'ont
      // pas de prototype
      FNOP.prototype = this.prototype;
    }
    fBound.prototype = new FNOP();
    return fBound;
  };
}
/* jshint ignore:start */
var Float64Array = Array; // eslint-disable-line
/* jshint ignore:end */
