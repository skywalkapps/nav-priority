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
