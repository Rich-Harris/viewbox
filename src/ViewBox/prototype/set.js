define([
	'utils/extend',
	'utils/correct'
], function (
	extend,
	correct
) {

	'use strict';

	return function ViewBox$set ( x, y, width, height, options ) {
		var corrected;

		if ( typeof x === 'object' ) {
			extend( this, x );
		} else {
			this.x = x;
			this.y = y;
			this.width = width;
			this.height = height;

			extend( this, options );
		}

		corrected = correct( this, this.x, this.y, this.width, this.height );
		extend( this, corrected );

		this.svg.setAttribute( 'viewBox', this.toString() );
		this._dirty = true;
	};

});
