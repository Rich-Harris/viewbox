import animate from 'prototype/animate';
import getClientCoords from 'prototype/getClientCoords';
import getSvgCoords from 'prototype/getSvgCoords';
import getZoom from 'prototype/getZoom';
import pan from 'prototype/pan';
import set from 'prototype/set';
import toJSON from 'prototype/toJSON';
import toString from 'prototype/toString';
import zoom from 'prototype/zoom';

import mouseDrag from 'interaction/mouseDrag';
import touch from 'interaction/touch';
import applyInertia from 'interaction/applyInertia';

import clean from 'utils/clean';
import easing from 'utils/easing';
import getViewBoxFromSvg from 'utils/getViewBoxFromSvg';

var ViewBox, empty = {};

ViewBox = function ( svg, options ) {

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

	initialViewBox = getViewBoxFromSvg( this.svg );

	if ( 'x' in options ) initialViewBox.x = options.x;
	if ( 'y' in options ) initialViewBox.y = options.y;
	if ( 'width' in options ) initialViewBox.width = options.width;
	if ( 'height' in options ) initialViewBox.height = options.height;

	clean( this );

	this.set( initialViewBox );

	// set up interactions
	this.inertia = !!options.inertia;
	this._applyInertia = function () {
		applyInertia( self );
	};

	// mouse interactions
	if ( options.mouseDrag ) {
		mouseDrag( this );
	}

	// touch interactions
	if ( 'ontouchstart' in this.svg ) {
		if ( options.singleFingerDrag || options.twoFingerDrag || options.pinchZoom ) {
			touch( this, options );
		}
	}
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

export default ViewBox;
