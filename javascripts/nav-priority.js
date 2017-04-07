/* ========================================================================
 * SkywalkApps Priority Navigation: nav-priority.js v1.0.0
 *
 * Priority+ responsive navigation plugin
 *
 * Copyright 2017 Martin Stanek, Twitter: @koucik, Github: @skywalkapps
 * Licensed under MIT (https://github.com/skywalkapps/nav-priority/blob/master/LICENSE)
 *
 * Changelog:
 * v1.0.0: initial implementation
 * v1.0.1: moved resizeListener to element scope
 * ======================================================================== */

(function(window, Util, document, undefined) { 'use strict';
  // Throttle and debounce delay
  var delay = 10
  var instances = []

  // NAV PRIORITY CLASS
  // -----------------

  var NavPriority = function (element, options) {
    this.options = options
    this.element = (typeof element == 'string') ? document.querySelector(element) : element
    this.resizeListener = null

    // If the element is not DOM element, do not continue
    if (!Util.isElement(this.element)) throw new Error("this.element has to be DOM Element")

    this.navList = this.element.querySelectorAll('ul')[0] // Query first unordered list, our global navigation
    this.overflowMenu = this.createOverflowMenu()
    this.overflowList = this.overflowMenu.querySelectorAll('ul')[0]
    this.overflowDropdown = this.overflowMenu.querySelector('[data-nav-priority-toggle]')

    // We need style to calculate paddings of the container element
    this.elementStyle = window.getComputedStyle(this.element)

    // Calculate navigation breakpoints
    this.breakpoints = this.getBreakpoints()

    this.overflowBreakpoints = []

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
    containerWidthOffset: 10,
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

      menuHtml = menuHtml.replace('{{dropdownLabel}}', this.options.dropdownLabel)
        .replace('{{dropdownMenuClass}}', this.options.dropdownMenuClass)
        .replace(new RegExp('{{dropdownMenuId}}', 'g'), menuId)

      // Mark last item of the menu
      var lastItem = this.navList.children[this.navList.children.length - 1]
      lastItem.setAttribute('class', lastItem.className + " is-last")

      // Append menu as last child of <ul> list
      this.navList.innerHTML += menuHtml

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
    var dropdownMenuWidth = Math.ceil(navListItems[itemsLength - 1].getBoundingClientRect().width)

    // First breakpoint is the width if the dropdown "More"
    var itemBreakpoint = dropdownMenuWidth;

    // For each menu item add its width, ignore excluded
    for (var i = 0; i < itemsLength - 2; i++) {
      var item = navListItems[i]

      itemBreakpoint += Math.ceil(item.getBoundingClientRect().width)
      breakpoints.push(itemBreakpoint)
    }

    // Last breakpoint is the larger width of dropdown menu and last list item
    itemBreakpoint += Math.ceil(Math.abs(dropdownMenuWidth - navListItems[itemsLength - 2].getBoundingClientRect().width))
    breakpoints.push(itemBreakpoint)

    return breakpoints
  }


  /*
   * Setup Event listeners
   */
  NavPriority.prototype.setupEventListeners = function() {

    // Do the priority menu stuff, bind context to the function
    // Listener has to be referenced by a variable so it can be also removed
    this.resizeListener = this.handleResize.bind(this)
    window.addEventListener('resize', this.resizeListener)
  }


  /*
   * Handle navigation on window resize (throttled and debounced to increase performance)
   */
  NavPriority.prototype.handleResize = function() {
    // Throttle - limit execution of the function by delay interval
    Util.throttle(this.reflowNavigation.bind(this), delay)

    // Debounce - execute only once after delay expired, ensures it is executed at least once
    Util.debounce(this.reflowNavigation.bind(this), delay)
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
    this.navList.insertBefore(item, this.navList.lastChild)

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
    if (!this.resizeListener) {
      return false
    }

    // Get current width of the container
    var containerWidth = Math.ceil(this.element.getBoundingClientRect().width - parseFloat(this.elementStyle.paddingLeft) - parseFloat(this.elementStyle.paddingRight) - this.options.containerWidthOffset)

    // Iterate over current menu items
    var navListItems = this.navList.children
    var menuIndex = navListItems.length - 1

    while (menuIndex--) {
      var itemBreakpoint = this.breakpoints[menuIndex]

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
          var navPriority = new NavPriority(self, options)
          instances.push(navPriority)
          data = self.setAttribute('data-nav-priority', true)
        }
      }
    }

    return instances
  }

}(window, window.Util, document));
