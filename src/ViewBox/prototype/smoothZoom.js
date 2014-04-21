define([
	'utils/clean',
	'utils/vanWijk'
], function (
	clean,
	vanWijk
) {

	'use strict';

	return function ViewBox$smoothZoom ( x, y, zoom ) {
		var c0, c1, w0, w1, interpolator;

		if ( this._dirty ) clean( this );

		c0 = { x: this.x + this.width / 2, y: this.y + this.height / 2 };
		c1 = { x: x, y: y };

		w0 = this.width;
		w1 = this._elWidth / zoom;

		interpolator = vanWijk( this, c0, c1, w0, w1, 0.7, 1 );
	};

});
