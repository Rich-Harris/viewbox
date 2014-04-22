define([
	'utils/clean',
	'utils/extend',
	'utils/constrain',
	'utils/maximise',
	'utils/set'
], function (
	clean,
	extend,
	constrain,
	maximise,
	set
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

		set( this, constrained );
	};

});
