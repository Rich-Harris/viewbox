define( function () {

	'use strict';

	return function ViewBox$getSvgCoords ( clientX, clientY ) {
		var ctm;

		if ( this._dirty ) {
			this.clean();
		}

		if ( typeof clientX === 'object' ) {
			clientY = clientX.y;
			clientX = clientX.x;
		}

		ctm = this.screenCTM;

		return {
			x: ( clientX - ctm.e ) / ctm.a,
			y: ( clientY - ctm.f ) / ctm.a
		};
	};

});
