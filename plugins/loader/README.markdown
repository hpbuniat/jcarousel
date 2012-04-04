jCarousel Loader Plugin
=======================

The jCarousel Loader Plugin provides dynamic item loading support for jCarousel.

Getting started
---------------

To use the jCarousel Loader Plugin, include the source file right after the jCarousel core file:

    <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.6.4/jquery.min.js"></script>
    <script type="text/javascript" src="/path/to/jquery.jcarousel.js"></script>
    <script type="text/javascript" src="/path/to/jquery.jcarousel.loader.js"></script>
    <link rel="stylesheet" type="text/css" href="/path/to/skin.css" />

To setup the plugin, add the following code inside the `<head>` tag of your HTML document:

```html
<script type="text/javascript">
$(function() {
    $('#mycarousel')
        .jcarousel({
            // Core configuration goes here
        })
        .jcarouselLoader({
            // Plugin configuration goes here
        });
});
</script>
```

Configuration
-------------

The plugin accepts the following options:

<table>
    <tr>
        <th>Property</th>
        <th>Type</th>
        <th>Default</th>
        <th>Description</th>
    </tr>
    <tr>
        <td>load</td>
        <td>function</td>
        <td><pre>function(first, last, type, ready) {
}</pre></td>
        <td>A callback that performs the actual loading of the items, ie. via AJAX.</td>
    </tr>
    <tr>
        <td>placeholder</td>
        <td>function</td>
        <td><pre>function(index) {
    return '&lt;li class="jcarousel-loader-placeholder">&lt;/li>';  
}</pre></td>
        <td>A function which must return HTML code for the placeholder items. A placeholder item is added to the list and should later be replaced with the actual item in the <code>load</code> callback.</td>
    </tr>
    <tr>
        <td>size</td>
        <td>number</td>
        <td>null</td>
        <td>Once you know the exact size of the list (ideally on instatiation or after you loaded the first set of items), you should set this option to tell the plugin when to stop requesting new items.</td>
    </tr>
    <tr>
        <td>locked</td>
        <td>boolean</td>
        <td>false</td>
        <td>If set to <code>true</code>, the plugins stop requesting new items.</td>
    </tr>
</table>

The load callback
-----------------

The `load` callback is responsible for loading and adding items to the list. It receives four arguments:

```javascript
function(first, last, type, ready) {
}
```

  1. `first`: The index of the first item that should be loaded.
  2. `last`: The index of the last item that should be loaded.
  3. `type`: The type of loading. This is one of:
      * `init`: The callback is called on initialization
      * `scroll` The callback is called right before a scroll.
      * `reload`: The callback is called on a reload of the carousel
  4. `ready`: A function which should be called after the loading of items is completed.

The callback is called in the context of the plugin, so you can get the carousel instance with:

```javascript
function(first, last, type, ready) {
    var carousel = this.carousel();
}
```

Example
-------

```javascript
$(function() {
    var loadCallback = function(first, last, type, ready) {
        $.getJSON('images.json', function(data) {
            var carousel = this.carousel(),
                items    = carousel.items();

            for (var i = first; i <= last; i++) {
                // Replace the src of the placeholder image with the actual image src
                items.eq(i).find('img').attr('src', data.images[i]);
            };

            // Call the ready() function so the plugins knows that we finished loading
            ready();
        });
    };

    var placeholderCallback = function(index) {
        return '<li><img src="/images/loading.png"></li>';
    };

    $('#mycarousel')
        .jcarousel()
        .jcarouselLoader({
            load: loadCallback,
            placeholder: placeholderCallback
        });
});
```

The example assumes that `images.json` has the following structure:

```javascript
{
    images: [
        "http://example.com/image1.jpg",
        "http://example.com/image2.jpg",
        "http://example.com/image3.jpg",
        "http://example.com/image4.jpg",
        "http://example.com/image5.jpg"
    ]
}
```
