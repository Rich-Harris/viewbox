define([
	'utils/clean',
	'utils/extend',
	'utils/constrain',
	'utils/maximise'
], function (
	clean,
	extend,
	constrain,
	maximise
) {

	'use strict';

	return function ViewBox$set ( x, y, width, height, constraints ) {
		var constrained;

		if ( this._dirty ) clean( this );

		if ( typeof x === 'object' ) {
			constraints = y;

			this.x = x.x;
			this.y = x.y;
			this.width = x.width;
			this.height = x.height;
		} else {
			this.x = x;
			this.y = y;
			this.width = width;
			this.height = height;
		}

		extend( this.constraints, constraints );

		constrained = constrain( this.x, this.y, this.width, this.height, this._elWidth, this._elHeight, this.constraints );

		this.x = constrained.x;
		this.y = constrained.y;
		this.width = constrained.width;
		this.height = constrained.height;

		this.svg.setAttribute( 'viewBox', this.toString() );
		this._dirty = true;
	};

});
