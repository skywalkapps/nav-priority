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

  Util.throttle = function(fn, threshhold, scope) {
    threshhold || (threshhold = 250);
    var last,
        deferTimer;
    return function () {
      var context = scope || this;

      var now = +new Date,
          args = arguments;
      if (last && now < last + threshhold) {
        // hold on to it
        clearTimeout(deferTimer);
        deferTimer = setTimeout(function () {
          last = now;
          fn.apply(context, args);
        }, threshhold);
      } else {
        last = now;
        fn.apply(context, args);
      }
    };
  }

  Util.debounce = function(fn, delay) {
    var timeout = null;
    return function () {
      var context = this, args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    };
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

  /*
   * Checks if element has defined className
   */
  Util.hasClass = function (item, className) {
    return (item.className.indexOf(className) > -1)
  };


  Util.isSmallScreen = function() {
    return window.innerWidth <= this.options.navBreakpoint;
  }

  /*
   * Handle navigation on window resize (throttled and debounced to increase performance)
   */
  Util.handleResize = function() {
    // Throttle - limit execution of the function by delay interval
    Util.throttle(this.reflowNavigation.bind(this), delay)

    // Debounce - execute only once after delay expired, ensures it is executed at least once
    Util.debounce(this.reflowNavigation.bind(this), delay)

    // Condition for small screen, smaller than config.mdbreakpoint or hamburger option enabled
    var condition = this.isSmallScreen();
    var change = false;

    // Check switch beetween views (mobile XOR desktop)
    if(( this.smallScreen || condition ) && !( this.smallScreen && condition )){
      this.smallScreen = condition;
      change = true;
    }

    // Stop if change has not occured
    if(!change){
      return false;
    }
  }


  // register module globally
  window.Util = Util

}(window, document));
