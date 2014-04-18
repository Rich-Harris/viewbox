define([
	'ViewBox/prototype/animate',
	'ViewBox/prototype/aspectRatio',
	'ViewBox/prototype/clean',
	'ViewBox/prototype/correct',
	'ViewBox/prototype/getClientCoords',
	'ViewBox/prototype/getSvgCoords',
	'ViewBox/prototype/getViewBoxFromSvg',
	'ViewBox/prototype/getZoom',
	'ViewBox/prototype/pan',
	'ViewBox/prototype/set',
	'ViewBox/prototype/toString',
	'ViewBox/prototype/zoom',
	'utils/easing'
], function (
	animate,
	aspectRatio,
	clean,
	correct,
	getClientCoords,
	getSvgCoords,
	getViewBoxFromSvg,
	getZoom,
	pan,
	set,
	toString,
	zoom,
	easing
) {

	'use strict';

	var ViewBox = function ( svg, x, y, width, height, options ) {

		var self = this;

		if ( !( svg instanceof SVGSVGElement ) ) {
			throw new Error( 'First argument must be an svg element' );
		}

		this.svg = svg;


		// register as dirty whenever user resizes or scrolls (manually invoke using
		// the viewBox.dirty() method)
		this.dirty = function () {
			self._dirty = true;
		};

		window.addEventListener( 'resize', this.dirty );
		window.addEventListener( 'scroll', this.dirty );

		this.dirty();


		if ( arguments.length === 1 ) {
			this.getViewBoxFromSvg();
		}

		else if ( arguments.length === 2 && typeof x === 'object' ) {
			this.getViewBoxFromSvg();
			this.set( x );
		}

		else {
			this.set({
				x: x,
				y: y,
				width: width,
				height: height
			});

			if ( options ) {
				this.set( options );
			}
		}
	};

	ViewBox.prototype = {
		animate: animate,
		aspectRatio: aspectRatio,
		clean: clean,
		correct: correct,
		getClientCoords: getClientCoords,
		getSvgCoords: getSvgCoords,
		getViewBoxFromSvg: getViewBoxFromSvg,
		getZoom: getZoom,
		pan: pan,
		set: set,
		toString: toString,
		zoom: zoom
	};

	ViewBox.easing = easing;

	return ViewBox;

});
