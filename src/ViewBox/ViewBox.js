define([
	'ViewBox/prototype/animate',
	'ViewBox/prototype/getClientCoords',
	'ViewBox/prototype/getSvgCoords',
	'ViewBox/prototype/getZoom',
	'ViewBox/prototype/pan',
	'ViewBox/prototype/set',
	'ViewBox/prototype/toJSON',
	'ViewBox/prototype/toString',
	'ViewBox/prototype/zoom',
	'utils/easing',
	'utils/getViewBoxFromSvg'
], function (
	animate,
	getClientCoords,
	getSvgCoords,
	getZoom,
	pan,
	set,
	toJSON,
	toString,
	zoom,
	easing,
	getViewBoxFromSvg
) {

	'use strict';

	var ViewBox, empty = {};

	var ViewBox = function ( svg, options ) {

		var self = this, initialViewBox;

		if ( !( svg instanceof SVGSVGElement ) ) {
			throw new Error( 'First argument must be an svg element' );
		}

		options = options || empty;

		this.svg = svg;
		this.constraints = options.constraints || {};

		// register as dirty whenever user resizes or scrolls (manually invoke using
		// the viewBox.dirty() method)
		this.dirty = function () {
			self._dirty = true;
		};

		window.addEventListener( 'resize', this.dirty );
		window.addEventListener( 'scroll', this.dirty );

		this.dirty();


		initialViewBox = getViewBoxFromSvg( this.svg );

		if ( 'x' in options ) initialViewBox.x = options.x;
		if ( 'y' in options ) initialViewBox.y = options.y;
		if ( 'width' in options ) initialViewBox.width = options.width;
		if ( 'height' in options ) initialViewBox.height = options.height;

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

});
