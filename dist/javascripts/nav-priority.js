/* ========================================================================
 * SkywalkApps Priority Navigation Index: app.js
 * ======================================================================== */


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


/*! matchMedia() polyfill - Test a CSS media type/query in JS. Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas. Dual MIT/BSD license */

window.matchMedia = window.matchMedia || (function(doc, undefined){

  var docElem  = doc.documentElement,
      refNode  = docElem.firstElementChild || docElem.firstChild,
      // fakeBody required for <FF4 when executed in <head>
      fakeBody = doc.createElement('body'),
      div      = doc.createElement('div');

  div.id = 'mq-test-1';
  div.style.cssText = "position:absolute;top:-100em";
  fakeBody.style.background = "none";
  fakeBody.appendChild(div);

  var mqRun = function ( mq ) {
    div.innerHTML = '&shy;<style media="' + mq + '"> #mq-test-1 { width: 42px; }</style>';
    docElem.insertBefore( fakeBody, refNode );
    bool = div.offsetWidth === 42;
    docElem.removeChild( fakeBody );

    return { matches: bool, media: mq };
  },

  getEmValue = function () {
    var ret,
        body = docElem.body,
        fakeUsed = false;

    div.style.cssText = "position:absolute;font-size:1em;width:1em";

    if( !body ) {
      body = fakeUsed = doc.createElement( "body" );
      body.style.background = "none";
    }

    body.appendChild( div );

    docElem.insertBefore( body, docElem.firstChild );

    if( fakeUsed ) {
      docElem.removeChild( body );
    } else {
      body.removeChild( div );
    }

    //also update eminpx before returning
    ret = eminpx = parseFloat( div.offsetWidth );

    return ret;
  },

  //cached container for 1em value, populated the first time it's needed
  eminpx,

  // verify that we have support for a simple media query
  mqSupport = mqRun( '(min-width: 0px)' ).matches;

  return function ( mq ) {
    if( mqSupport ) {
      return mqRun( mq );
    } else {
      var min = mq.match( /\(min\-width:[\s]*([\s]*[0-9\.]+)(px|em)[\s]*\)/ ) && parseFloat( RegExp.$1 ) + ( RegExp.$2 || "" ),
          max = mq.match( /\(max\-width:[\s]*([\s]*[0-9\.]+)(px|em)[\s]*\)/ ) && parseFloat( RegExp.$1 ) + ( RegExp.$2 || "" ),
          minnull = min === null,
          maxnull = max === null,
          currWidth = doc.body.offsetWidth,
          em = 'em';

      if( !!min ) { min = parseFloat( min ) * ( min.indexOf( em ) > -1 ? ( eminpx || getEmValue() ) : 1 ); }
      if( !!max ) { max = parseFloat( max ) * ( max.indexOf( em ) > -1 ? ( eminpx || getEmValue() ) : 1 ); }

      bool = ( !minnull || !maxnull ) && ( minnull || currWidth >= min ) && ( maxnull || currWidth <= max );

      return { matches: bool, media: mq };
    }
  };

}( document ));


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


/* ========================================================================
 * SkywalkApps Priority Navigation: nav-priority.js v1.2.0
 *
 * Priority+ responsive navigation plugin
 *
 * Copyright 2017 Martin Stanek, Twitter: @koucik, Github: @skywalkapps
 * Licensed under MIT (https://github.com/skywalkapps/nav-priority/blob/master/LICENSE)
 *
 * Changelog:
 *   v1.0.0: initial implementation
 *   v1.0.1: moved resizeListener to element scope
 *   v1.1.0: added threshold, and activation breakpoint
 *   v1.2.0:
 *    - fixed bug in overflow menu, innerHTML broke event listeners of other plugins
 *    - fixed last breakpoint calculation
 * ======================================================================== */

(function(window, Util, document, undefined) { 'use strict';

  // PRIVATE PROPERTIES
  // ----------------

  var delay = 10
  var instances = []


  // NAV PRIORITY CLASS
  // -----------------

  var NavPriority = function (element, options) {
    this.options = options
    this.element = (typeof element == 'string') ? document.querySelector(element) : element
    this.resizeListener = null

    this.container = this.options.containerSelector ? this.element.querySelectorAll(this.options.containerSelector)[0] : this.element
    this.navList = this.element.querySelectorAll('ul')[0] // Query first unordered list, our global navigation
    this.overflowMenu = this.createOverflowMenu()
    this.overflowList = this.overflowMenu.querySelectorAll('ul')[0]
    this.overflowDropdown = this.element.parentNode.querySelector('[data-nav-priority-toggle]')
    this.overflowBreakpoints = []

    // We need style to calculate paddings of the container element
    this.elementStyle = window.getComputedStyle(this.element)

    // Calculate navigation breakpoints
    this.breakpoints = this.getBreakpoints()

    // Initialize nav priority default state
    this.setupEventListeners()
    this.reflowNavigation()
  }

  // Default configuration
  NavPriority.DEFAULTS = {
    // Dropdown menu properties
    dropdownLabel: 'More <i class="caret"></i>',
    dropdownMenuClass: 'dropdown-menu dropdown-menu-right',
    dropdownMenuTemplate: '<li data-nav-priority-menu class="navbar-nav-more dropdown" aria-hidden="true">' +
        '<a id="{{dropdownMenuId}}" href="#" class="navbar-toggle-more" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false" data-nav-priority-toggle>' +
          '{{dropdownLabel}}' +
        '</a>' +
        '<ul class="{{dropdownMenuClass}}" aria-labelledby="{{dropdownMenuId}}"></ul>' +
      '</li>',
    containerSelector: 'ul',
    containerWidthOffset: 10,
    threshold: 4
  }

  /*
   * Factory that checks input validity and creates navPriority instance
   * @param  {DOMElement}         Root element
   * @param  {object}             Options
   * @return  {NavPriority|null}  NavPriority instance or null
   */
  NavPriority.create = function(element, options) {
    var listItems = element.querySelectorAll('li')
    var isValid = true

    if (!Util.isElement(element)) {
      isValid = false
      throw new Error("element has to be DOM Element")
    }
    else if (listItems.length === 0 || listItems.length <= options.threshold) {
      isValid = false
    }

    // If the element is not DOM element or is not valid for priority menu, do not continue
    if (isValid) {
      return new NavPriority(element, options);
    }
    else {
      return null
    }
  }

  /*
   * Creates dropdown menu to hold overflowing items
   * @return   {DOMobject}   Overflow menu
   */
  NavPriority.prototype.createOverflowMenu = function (){
    var overflowMenu = this.navList.querySelector('[data-nav-priority-menu]')

    if (!overflowMenu) {
      var menuId = 'nav-link-more-' + instances.length
      var menuHtml = this.options.dropdownMenuTemplate
      var listItems = this.navList.children
      var listItemsLength = this.navList.children.length
      var lastItem = listItems[listItemsLength - 1]
      var tmp = [];
      var menuDOM;

      menuHtml = menuHtml.replace('{{dropdownLabel}}', this.options.dropdownLabel)
        .replace('{{dropdownMenuClass}}', this.options.dropdownMenuClass)
        .replace(new RegExp('{{dropdownMenuId}}', 'g'), menuId)

      // Create DOM structure for the menu
      menuDOM = document.createElement('div');
      menuDOM.innerHTML = menuHtml;

      // Mark last item of the menu
      lastItem.setAttribute('class', lastItem.className + " is-last")

      // Append menu as last child of <ul> list
      // NOTE: we could have used innerHTML, but it breaks event listeners and we want to play nicely :)
      this.navList.appendChild(menuDOM.firstChild)

      // Select first <ul> element in case the template is changed by the user
      overflowMenu = this.navList.querySelector('[data-nav-priority-menu]')
    }

    // When overFlow menu was not created, throw error
    if (!overflowMenu) throw new Error("overflowMenu does not exist, check your custom dropdownMenuTemplate parameter")

    return overflowMenu
  }


  /*
   * Function calculates breakpoint for each navigation item
   * @return  {array}  Array of breakpoints
   */
  NavPriority.prototype.getBreakpoints = function() {
    // Object to store breakpoints
    var breakpoints = []
    var navListItems = this.navList.children
    var itemsLength = navListItems.length
    var dropdownMenuWidth = Math.ceil(this.overflowDropdown.getBoundingClientRect().width)

    // First breakpoint is the width if the dropdown "More"
    var itemBreakpoint = dropdownMenuWidth;
// console.log("Dropdown: " + itemBreakpoint);
    // For each menu item add its width, ignore excluded
    for (var i = 0; i < itemsLength; i++) {
      var item = navListItems[i]

      if (Util.hasClass(item, 'navbar-nav-more')) {
        continue
      }

      itemBreakpoint += Math.ceil(item.getBoundingClientRect().width)
// console.log("Item" + i + ": " + Math.ceil(item.getBoundingClientRect().width));
      breakpoints.push(itemBreakpoint)
    }

    // Compensate for dropdown menu width
    breakpoints[breakpoints.length - 1] -= dropdownMenuWidth;


    return breakpoints
  }


  /*
   * Setup Event listeners
   */
  NavPriority.prototype.setupEventListeners = function() {
    // Do the priority menu stuff, bind context to the function
    // Listener has to be referenced by a variable so it can be also removed
    this.resizeListener = Util.throttle(this.reflowNavigation, delay, this)
    window.addEventListener('resize', this.resizeListener)
  }

  /*
   * Move item to overflow menu
   * @param   {DOMObject}   item - Menu item
   * @param   {number}      breakpoint
   * @return  {array}       Items that overflow outside navigation
   */
  NavPriority.prototype.addToOverflow = function (item, breakpoint) {
    this.overflowList.insertBefore(item, this.overflowList.firstChild)

    // ADD: link to overflow menu items
    this.overflowBreakpoints.unshift(breakpoint)

    // REMOVE: last breakpoint, which coresponds with link width
    this.breakpoints.pop()

    return this.overflowBreakpoints
  }


  /*
   * Remove item from the overflow menu
   * @param   {DOMObject}   item - Menu item
   * @param   {number}      breakpoint
   * @return  {array}       Items that overflow outside navigation
   */
  NavPriority.prototype.removeFromOverflow = function (item, breakpoint) {
    // ADD: breakpoint back to the array
    this.breakpoints.push(breakpoint)

    // REMOVE: first item from overflow menu
    this.overflowBreakpoints.shift()

    // Note: AppendChild is buggy with nested submenu
    this.navList.insertBefore(item, this.overflowDropdown.parentNode)

    return this.overflowBreakpoints
  }

  /*
   * Toggles visibility of dropdown menu
   * @param   {boolean}     condition - Condition when overflow menu is visible
   * @return  {DOMObject}   Overflow dropdown menu element
   */
  NavPriority.prototype.toggleOverflowDropdown = function (condition) {
    return this.overflowMenu.setAttribute('aria-hidden', condition);
  }

  /* Check priority and overflow */
  NavPriority.prototype.reflowNavigation = function () {
    // Cancel execution if handler has been already removed
    if (!this.resizeListener) return false

    // Get current width of the container
    // var containerWidth = Math.ceil(this.element.getBoundingClientRect().width - parseFloat(this.elementStyle.paddingLeft) - parseFloat(this.elementStyle.paddingRight) - this.options.containerWidthOffset)
    var containerWidth = Math.ceil(this.container.getBoundingClientRect().width - this.options.containerWidthOffset)

    // Iterate over current menu items
    var navListItems = this.navList.children
    var menuIndex = navListItems.length

    while (menuIndex--) {
      if (Util.hasClass(navListItems[menuIndex], 'navbar-nav-more')) {
        continue
      }
      var itemBreakpoint = this.breakpoints[menuIndex]

// console.log({
//   c: containerWidth,
//   index: menuIndex,
//   b: this.breakpoints[menuIndex],
//   item: navListItems[menuIndex]
// })

      // Add items, which overflow to menu "more"
      if (itemBreakpoint >= containerWidth) {
        this.addToOverflow(navListItems[menuIndex], itemBreakpoint)
      }

    };

    // Check current overflow menu items
    var overflowIndex = this.overflowList.children.length

    // Remove items, which can be added back to the menu
    while (overflowIndex--) {
      if (this.overflowBreakpoints[0] < containerWidth) {
        this.removeFromOverflow(this.overflowList.children[0], this.overflowBreakpoints[0])
      }
    }

    // Check the menu more visibility
    this.toggleOverflowDropdown(this.overflowList.children.length == 0)
  }

  /*
   * Destroys priority navigation elements and listeners
   */
  NavPriority.prototype.destroy = function() {
    // Destroy navPriority data
    this.element.removeAttribute('data-nav-priority')

    // Remove event listener
    window.removeEventListener('resize', this.resizeListener)
    this.resizeListener = null // prevent delayed execution of the function (debounced, throttled)

    // Add all items back to menu
    var overflowIndex = this.overflowList.children.length

    // Remove items, which can be added back to the menu
    if (overflowIndex) {
      // Remove items, which can be added back to the menu
      while (this.overflowList.children.length) {
        this.removeFromOverflow(this.overflowList.children[0], this.overflowBreakpoints[0])
      }
    }

    // Remove dropdown
    // var dropdown = this.overflowDropdown.parentNode
    // dropdown.parentNode.removeChild(dropdown)

    this.toggleOverflowDropdown(this.overflowList.children.length == 0)

    return this.element
  }

  /*
   * Priority navigation plugin method
   */
  window.navPriority = function (selector, option){
    var elements = document.querySelectorAll(selector)

    // Destroy instances
    if (typeof option == 'string' && option == 'destroy') {
      for (var i = 0; i < instances.length; i++) {
        var data = instances[i]
        data.destroy.call(data)
      }
      instances = []
    }

    if (typeof option != 'string') {
      for (var i = 0; i < elements.length; i++) {
        var self = elements[i]
        var options = Util.extend({}, NavPriority.DEFAULTS, typeof option == 'object' && option)
        var data = self.getAttribute('data-nav-priority')

        // Initialize priority nav if not already initialized
        if (!data) {
          // var navPriority = new NavPriority(self, options)
          var navPriority = NavPriority.create(self, options)
          instances.push(navPriority)
          data = self.setAttribute('data-nav-priority', true)
        }
      }
    }

    return instances
  }

  return NavPriority;

}(window, window.Util, document));
