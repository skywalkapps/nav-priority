/* ========================================================================
 * SkywalkApps Breakpoint Switcher: breakpoint-switcher.js v1.0.0
 *
 * Checks screen width and executes passed functions
 *
 * Copyright 2017 Martin Stanek, Twitter: @koucik, Github: @skywalkapps
 * Licensed under MIT (https://github.com/skywalkapps/nav-priority/blob/master/LICENSE)
 * ======================================================================== */

var BreakpointSwitcher = (function(window, Util, matchMedia, document, undefined) { 'use strict';

  // BREAKPOINT SWITCHER CLASS
  // -----------------

  var BreakpointSwitcher = function (options) {
    this.breakpoints = Util.extend({}, typeof options == 'object' && options);
    this.currentView = null;

    window.addEventListener('resize', Util.throttle(this.switch, 20, this));
    window.addEventListener('load', Util.throttle(this.switch, 20, this));
  }

  /*
   * Factory method that checks input validity and creates navPriority instance
   * @param   {object}             Options
   * @return  {BreakpointSwitcher|null}  BreakpointSwitcher instance or null
   */
  BreakpointSwitcher.create = function(options) {
    if (!matchMedia) {
      throw new Error("matchMedia is required for BreakpointSwitcher");
      return null;
    }

    if (typeof options === 'object') {
      return new BreakpointSwitcher(options);
    }
    else {
      throw new Error("Options object has to be passed to the constructor");
    }

    return null;
  }

  BreakpointSwitcher.prototype.matchView = function(breakpoints) {
    var view = null;
    for (var key in breakpoints) {
      if (matchMedia('(min-width: ' + key + ')').matches) {
        view = breakpoints[key];
      }
    }

    return view;
  }

  BreakpointSwitcher.prototype.switch = function() {
    var view = this.matchView(this.breakpoints);

    if (this.currentView !== view) {
      // Leaving previous view
      if(this.currentView && typeof this.currentView === 'function') {
        this.currentView.call(window, false);
      }

      // Entering current view
      if(typeof view === 'function') {
        view.call(window, true);
      }

      return this.currentView = view;
    }

    return null;
  }

  return BreakpointSwitcher;

}(window, window.Util, window.matchMedia, document));
