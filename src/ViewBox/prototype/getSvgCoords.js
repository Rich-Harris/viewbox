define([
	'utils/clean'
], function (
	clean
) {

	'use strict';

	return function ViewBox$getSvgCoords ( clientX, clientY ) {
		var ctm, ctm_a;

		if ( this._dirty ) clean( this );

		if ( typeof clientX === 'object' ) {
			clientY = clientX.y;
			clientX = clientX.x;
		}

		ctm = this._ctm;
		ctm_a = ctm.a;

		return {
			x: ( clientX - ctm.e ) / ctm_a,
			y: ( clientY - ctm.f ) / ctm_a
		};
	};

});
