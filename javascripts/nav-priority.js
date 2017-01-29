/* ========================================================================
 * SkywalkApps Priority Navigation: nav-priority.js v1.0.0
 *
 * Priority+ responsive navigation plugin
 *
 * Copyright 2017 Martin Stanek, Twitter: @koucik, Github: @skywalkapps
 * Licensed under MIT (https://github.com/skywalkapps/nav-priority/blob/master/LICENSE)
 * ======================================================================== */

(function(window, Util, document, undefined) { 'use strict';

  var delay = 20 // Throttle and debounce delay
  var overflowItems = []
  var instances = []

  // NAV PRIORITY CLASS
  // -----------------

  var NavPriority = function (element, options) {
    this.options = options
    this.element = (typeof element == 'string') ? document.querySelector(element) : element

    // If the element is not DOM element, do not continue
    if (!Util.isElement(this.element)) throw new Error("this.element has to be DOM Element")

    this.navList = this.element.querySelectorAll('ul')[0] // Query first unordered list, our global navigation
    this.overflowList = this.createOverflowList()
    this.overflowDropdown = this.element.parentNode.querySelector('[data-nav-more]')

    // We need style to calculate paddings of the container element
    this.elementStyle = window.getComputedStyle(this.element)

    // Calculate navigation breakpoints
    this.breakpoints = this.getBreakpoints()

    // Initialize nav priority default state
    this.reflowNavigation()
    this.setupEventListeners()
  }

  // Default configuration
  NavPriority.DEFAULTS = {
    // Dropdown menu properties
    dropdownLabel: 'More <i class="caret"></i>',
    dropdownMenuClass: 'dropdown-menu dropdown-menu-right',
    dropdownMenuTemplate: '<li class="navbar-nav-more dropdown" aria-hidden="true">' +
        '<a id="{{dropdownMenuId}}" href="#" class="navbar-toggle-more" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false" data-nav-more>' +
          '{{dropdownLabel}}' +
        '</a>' +
        '<ul class="{{dropdownMenuClass}}" aria-labelledby="{{dropdownMenuId}}"></ul>' +
      '</li>',
    containerWidthOffset: 70,
  }

  /*
   * Function calculates breakpoint for each navigation item
   * @return  {array}  Array of breakpoints
   */
  NavPriority.prototype.getBreakpoints = function() {
    var breakpoints = []
    var navListItems = this.navList.children
    var itemsLength = navListItems.length
    var dropdownMenuWidth = navListItems[itemsLength - 1].getBoundingClientRect().width

    var itemBreakpoint = dropdownMenuWidth;

    for (var i = 0; i <= itemsLength - 3; i++) {
      itemBreakpoint += navListItems[i].getBoundingClientRect().width
      breakpoints.push(itemBreakpoint)
    }

    // Last breakpoint is the larger width of dropdown menu and last list item
    var lastItemWidth = navListItems[itemsLength - 2].getBoundingClientRect().width
    itemBreakpoint += Math.abs(dropdownMenuWidth - lastItemWidth)
    breakpoints.push(itemBreakpoint)

    return breakpoints
  }

  /*
   * Setup Event listeners
   */
  NavPriority.prototype.setupEventListeners = function() {

    // Do the priority menu stuff, bind context to the function
    window.addEventListener('resize', this.handleResize.bind(this))
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
   * Creates dropdown menu to hold overflowing items
   * @return   {DOMobject}   Overflow list
   */
  NavPriority.prototype.createOverflowList = function (){
    var overflowList = this.element.parentNode.querySelector('.navbar-nav-more ul')

    if (!overflowList) {
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

      overflowList = this.navList.querySelector('.navbar-nav-more > ul')
    }

    return overflowList
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
    overflowItems.unshift(breakpoint)

    // REMOVE: last breakpoint, which coresponds with link width
    this.breakpoints.pop()

    return overflowItems
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
    overflowItems.shift()

    // Note: AppendChild is buggy with nested submenu
    this.navList.insertBefore(item, this.navList.lastChild)

    return overflowItems
  }

  /*
   * Toggles visibility of dropdown menu
   * @param   {boolean}     condition - Condition when overflow menu is visible
   * @return  {DOMObject}   Overflow dropdown menu element
   */
  NavPriority.prototype.toggleOverflowDropdown = function (condition) {
    return this.overflowDropdown.parentNode.setAttribute('aria-hidden', condition);
  }

  /* Check priority and overflow */
  NavPriority.prototype.reflowNavigation = function () {

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
      if (overflowItems[0] < containerWidth) {
        this.removeFromOverflow(this.overflowList.children[0], overflowItems[0])
      }
    }

    // Check the menu more visibility
    this.toggleOverflowDropdown(this.overflowList.children.length == 0)
  }

  /*
   * Priority navigation plugin method
   */
  NavPriority.prototype.destroy = function() {
    // Destroy navPriority data
    this.element.removeAttribute('data-nav')

    // Remove event listeners
    window.removeEventListener('resize', this.handleResize)

    // Add all items back to menu
    var overflowListChildren = this.overflowList.children
    if (overflowListChildren.length) {
      this.removeFromOverflow(overflowListChildren)
    }

    // Remove dropdown
    var dropdown = this.overflowDropdown.parentNode
    dropdown.parentNode.removeChild(dropdown)

    return this.element
  }

  /*
   * Priority navigation plugin method
   */
  window.navPriority = function (selector, option){
    var elements = document.querySelectorAll(selector)

    for (var i = 0; i < elements.length; i++) {
      var self = elements[i]
      var options = Util.extend({}, NavPriority.DEFAULTS, typeof option == 'object' && option)
      var data = self.getAttribute('data-priority-nav')

          // menuElement = self.querySelector('.nav > ul')

      // Do not initialize menu if the <ul> list is missign
      // if (!menuElement) return false

      // Initialize priority nav if not already initialized
      if (!data) {
        var navPriority = new NavPriority(self, options)
        instances.push(navPriority)
        data = self.setAttribute('data-priority-nav', true)
      }
    }

    return instances
  }

  /*
   * Initialize via data-api
   */
  var elements = document.querySelectorAll('[data-nav="priority"]')

  if (elements.length) {
    window.navPriority('[data-nav="priority"]')
  }

}(window, window.Util, document));
