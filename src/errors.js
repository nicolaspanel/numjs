'use strict';

module.exports = {
  ValueError: function ValueError () {
    var err = Error.apply(this, arguments);
    err.name = this.constructor.name;
    return err;
  },
  ConfigError: function ConfigError () {
    var err = Error.apply(this, arguments);
    err.name = this.constructor.name;
    return err;
  },
  NotImplementedError: function NotImplementedError () {
    var err = Error.apply(this, arguments);
    err.name = this.constructor.name;
    return err;
  }
};
