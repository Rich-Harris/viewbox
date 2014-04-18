define( function () {

	'use strict';

	return function ViewBox$getClientCoords ( svgX, svgY ) {
		if ( this._dirty ) {
			this.clean();
		}

		if ( typeof svgX === 'object' ) {
			svgY = svgX.y;
			svgX = svgX.x;
		}

		return {
			x: ( svgX * this.screenCTM.a ) + this.screenCTM.e,
			y: ( svgY * this.screenCTM.a ) + this.screenCTM.f
		};
	};

});
