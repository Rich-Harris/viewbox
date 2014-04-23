// ViewBox 0.1.1
// Copyright (2014) Rich Harris
// Released under the MIT License

// https://github.com/Rich-Harris/viewbox

;
( function( global ) {

	'use strict';


	var ViewBox = function( animate, getClientCoords, getSvgCoords, getZoom, pan, set, toJSON, toString, zoom, easing, getViewBoxFromSvg ) {

		var ViewBox, empty = {};
		ViewBox = function( svg, options ) {
			var self = this,
				initialViewBox;
			if ( !( svg instanceof SVGSVGElement ) ) {
				throw new Error( 'First argument must be an svg element' );
			}
			options = options || empty;
			this.svg = svg;
			this.constraints = options.constraints || {};
			// register as dirty whenever user resizes or scrolls (manually invoke using
			// the viewBox.dirty() method)
			this.dirty = function() {
				self._dirty = true;
			};
			window.addEventListener( 'resize', this.dirty );
			window.addEventListener( 'scroll', this.dirty );
			this.dirty();
			initialViewBox = getViewBoxFromSvg( this.svg );
			if ( 'x' in options )
				initialViewBox.x = options.x;
			if ( 'y' in options )
				initialViewBox.y = options.y;
			if ( 'width' in options )
				initialViewBox.width = options.width;
			if ( 'height' in options )
				initialViewBox.height = options.height;
			this.set( initialViewBox );
		};
		ViewBox.prototype = {
			animate: animate,
			getClientCoords: getClientCoords,
			getSvgCoords: getSvgCoords,
			getZoom: getZoom,
			pan: pan,
			set: set,
			toJSON: toJSON,
			toString: toString,
			zoom: zoom
		};
		ViewBox.easing = easing;
		return ViewBox;
	}( ViewBox$animate, ViewBox$getClientCoords, ViewBox$getSvgCoords, ViewBox$getZoom, ViewBox$pan, ViewBox$set, ViewBox$toJSON, ViewBox$toString, ViewBox$zoom, easing, getViewBoxFromSvg );

	define( "viewbox", function() {} );




	// export as CommonJS...
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = ViewBox;
	}

	// ...or as AMD module
	else if ( typeof define !== 'undefined' && define.amd ) {
		define( function() {
			return ViewBox;
		} );
	}

	// ...or as browser global
	else {
		global.ViewBox = ViewBox;
	}

}( typeof window !== 'undefined' ? window : this ) );
