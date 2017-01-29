/* ========================================================================
 * SkywalkApps Priority Navigation Utilities: util.js v1.0.0
 *
 * Common JS functions that serve other JS plugins
 *
 * Copyright 2017 Martin Stanek, Twitter: @koucik, Github: @skywalkapps
 * Licensed under MIT (https://github.com/skywalkapps/nav-priority/blob/master/LICENSE)
 * ======================================================================== */

(function(window, document, undefined) { 'use strict';

  var Util = {}

  var throttled = false
  Util.throttle = function(callback, delay) {
    if (!throttled) {
      callback.call();
      throttled = true;

      setTimeout(function () {
        throttled = false;
      }, delay);
    }
  }

  var timeout;
  Util.debounce = function(callback, delay) {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(callback, delay);
  }

  Util.extend = function() {
    for(var i = 1; i < arguments.length; i++) {
      for(var key in arguments[i]) {
        if(arguments[i].hasOwnProperty(key)) {
          arguments[0][key] = arguments[i][key];
        }
      }
    }

    return arguments[0];
  }


  Util.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  }

  // register module globally
  window.Util = Util

}(window, document));
