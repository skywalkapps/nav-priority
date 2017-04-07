---
layout: default
title: Priority+ Navigation
name: NavPriority
description: Mobile navigation is often treated as show / hide only. Usability tests suggest that user experience can be improved by using a priority menu. NavPriority plugin adjust wide navigation to fit the viewport of any device.

---

### Bootstrap Priority Navbar

Responsive menu with many items is very challenging to design and code. Priority+ pattern solves problems with much needed space when you really care about multi device usability. If you want to know more about priority+ patterns, let us recommend you great article [Revisiting the priority pattern](http://bradfrost.com/blog/post/revisiting-the-priority-pattern/) by [Brad Frost](https://twitter.com/brad_frost).

PriorityNav plugin checks available space and rearranges menu accordingly. When there is not enough space, overflowing items are stored in dropdown menu labelled "More". Plugin lets you customize a few options, so it suits your needs.

<div class="sw-example sw-example-resizable" id="navbar-priority-1">
  <div class="sw-resizable">
    <nav class="navbar navbar-inverse">
        <div class="container-fluid">
            <div class="navbar-header">
                <button type="button" class="collapsed navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-9" aria-expanded="false"> <span class="sr-only">Toggle navigation</span> <span class="icon-bar"></span> <span class="icon-bar"></span> <span class="icon-bar"></span> </button> <a href="#" class="navbar-brand">BBC</a> </div>
            <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-9" data-nav="priority-1">
                <ul class="nav navbar-nav">
                    <li class="active"><a href="#">Home</a></li>
                    <li><a href="#">UK</a></li>
                    <li><a href="#">World</a></li>
                    <li><a href="#">Sport</a></li>
                    <li><a href="#">Opinion</a></li>
                    <li><a href="#">Culture</a></li>
                    <li><a href="#">Business</a></li>
                    <li><a href="#">Lifestyle</a></li>
                    <li><a href="#">Fashion</a></li>
                    <li><a href="#">Environment</a></li>
                    <li><a href="#">Tech</a></li>
                    <li><a href="#">Travel</a></li>
                </ul>
            </div>
        </div>
    </nav>
  </div>
</div>

~~~html
<nav class="navbar navbar-inverse">
    <div class="container-fluid">
        <div class="navbar-header">
            <button type="button" class="collapsed navbar-toggle" data-toggle="collapse" data-target="#sw-example-navbar" aria-expanded="false"> <span class="sr-only">Toggle navigation</span> <span class="icon-bar"></span> <span class="icon-bar"></span> <span class="icon-bar"></span> </button> <a href="#" class="navbar-brand">BBC</a> </div>
        <div class="collapse navbar-collapse" id="sw-example-navbar" data-nav="priority">
            <ul class="nav navbar-nav">
                <li class="active"><a href="#">Home</a></li>
                <li><a href="#">UK</a></li>
                <li><a href="#">World</a></li>
                <li><a href="#">Sport</a></li>
                <li><a href="#">Opinion</a></li>
                <li><a href="#">Culture</a></li>
                <li><a href="#">Business</a></li>
                <li><a href="#">Lifestyle</a></li>
                <li><a href="#">Fashion</a></li>
                <li><a href="#">Environment</a></li>
                <li><a href="#">Tech</a></li>
                <li><a href="#">Travel</a></li>
            </ul>
        </div>
    </div>
</nav>
~~~

NavPriority does have just one requirement, it has to be simple `<ul>` list wrapped in a resizable container. The plugin is initialized by calling `window.navPriority('[data-nav="priority-1"]')` with DOM selector as first argument and optional parameters as second argment.

~~~html
window.navPriority('[data-nav="priority-1"]')
~~~

### Custom Priority Navbar

NavPriority plugin is not dependant on any framework, however, if you want to used it with your own styles, make sure the navigation container is resizable.

<div class="sw-example sw-example-resizable" id="navbar-priority-2">
  <div class="sw-resizable">
    <nav class="sw-example-menu" data-nav="priority-2">
      <ul>
          <li class="active"><a href="#">Home</a></li>
          <li><a href="#">UK</a></li>
          <li><a href="#">World</a></li>
          <li><a href="#">Sport</a></li>
          <li><a href="#">Opinion</a></li>
          <li><a href="#">Culture</a></li>
          <li><a href="#">Business</a></li>
          <li><a href="#">Lifestyle</a></li>
          <li><a href="#">Fashion</a></li>
          <li><a href="#">Environment</a></li>
          <li><a href="#">Tech</a></li>
          <li><a href="#">Travel</a></li>
      </ul>
    </nav>
  </div>
</div>

~~~html
<nav class="sw-example-menu" data-nav="priority-2">
  <ul>
      <li class="active"><a href="#">Home</a></li>
      <li><a href="#">UK</a></li>
      <li><a href="#">World</a></li>
      <li><a href="#">Sport</a></li>
      <li><a href="#">Opinion</a></li>
      <li><a href="#">Culture</a></li>
      <li><a href="#">Business</a></li>
      <li><a href="#">Lifestyle</a></li>
      <li><a href="#">Fashion</a></li>
      <li><a href="#">Environment</a></li>
      <li><a href="#">Tech</a></li>
      <li><a href="#">Travel</a></li>
  </ul>
</nav>
~~~

### Plugin Options

This table gives you a quick overview of NavPriority options.

<div class="table-responsive sw-table">
  <table class="table table-bordered">
    <thead>
     <tr>
       <th style="width: 200px">Name</th>
       <th style="width: 200px">Default</th>
       <th>Usage</th>
     </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>dropdownLabel</strong></td>
        <td><code>'More <i class="caret"></i>'</code></td>
        <td>Change label of the menu to your context.</td>
      </tr>

      <tr>
        <td><strong>dropdownMenuClass</strong></td>
        <td><code>'dropdown-menu dropdown-menu-right'</code></td>
        <td>Classes for custom styling of the dropdown menu.</td>
      </tr>

      <tr>
        <td><strong>dropdownMenuTemplate</strong></td>
        <td><i class="text-muted">see the source</i></td>
        <td>You can change code of the dropdown menu, but it is not recommended.</td>
      </tr>

      <tr>
        <td><strong>containerWidthOffset</strong></td>
        <td><code>70</code></td>
        <td>Offset is substracted from container width.</td>
      </tr>
    </tbody>
  </table>
</div>

