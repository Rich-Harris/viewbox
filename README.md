ViewBox.js
==========

You have an SVG element in your webapp. You want to do one or more of the following:

* Pan it
* Zoom it
* Translate from screen coordinates to SVG coordinates and back again

I might be the only person in the world who has ever had this problem, but in case I'm not, **ViewBox.js** is the (or at least my) solution.


Usage
-----

Include `ViewBox.js` on your page (or load it as an AMD module, or whatever). Assuming `svg` is a reference to your SVG element, create a ViewBox instance like so:

```js
viewBox = new ViewBox( svg );
```

If your SVG element has a `viewBox` attribute, **ViewBox.js** will parse it. Alternatively, you can pass in the viewBox parameters:

```js
viewBox = new ViewBox( svg, x, y, width, height );
```

You can then pan the view