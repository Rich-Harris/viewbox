define([
	'utils/clean'
], function (
	clean
) {

	'use strict';

	return function ViewBox$getZoom () {
		if ( this._dirty ) clean( this );
		return this._elWidth / this.width;
	};

});
