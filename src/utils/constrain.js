define([
	'utils/clean',
	'utils/maximise',
	'utils/minimise'
], function (
	clean,
	maximise,
	minimise
) {

	'use strict';

	return function constrain ( x, y, width, height, elWidth, elHeight, constraints, secondPass ) {
		var currentZoom, clientBox, maximised, cx, cy, minWidth, minHeight, desiredAspectRatio, constrained, maxZoomFactor, minZoomX, minZoomY, minZoom, minZoomFactor, zoomFactor, recheck, d;

		desiredAspectRatio = width / height;

		maximised = maximise( x, y, width, height, elWidth / elHeight );

		currentZoom = elWidth / maximised.width;

		maxZoomFactor = 1;

		// first, we zoom out if we're past the maxZoom, since that's the weakest
		// constraint (bounds override it)
		if ( constraints.maxZoom !== undefined && currentZoom > constraints.maxZoom ) {
			maxZoomFactor = constraints.maxZoom / currentZoom;
		}

		// Then we zoom back in, if necessary, to stay within bounds
		if ( constraints.left !== undefined && constraints.right !== undefined ) {
			minZoomX = elWidth / ( constraints.right - constraints.left );
		}

		if ( constraints.top !== undefined && constraints.bottom !== undefined ) {
			minZoomY = elHeight / ( constraints.bottom - constraints.top );
		}

		minZoom = Math.max( minZoomX || 0, minZoomY || 0 );
		zoomFactor = Math.max( minZoom / currentZoom, maxZoomFactor );

		if ( zoomFactor !== 1 ) {
			// Apply zoom
			cx = maximised.x + maximised.width / 2;
			cy = maximised.y + maximised.height / 2;

			maximised.width /= zoomFactor;
			maximised.height /= zoomFactor;

			maximised.x = cx - maximised.width / 2;
			maximised.y = cy - maximised.height / 2;
		}


		// Then we ensure that we're in bounds
		if ( constraints.left !== undefined && maximised.x < constraints.left ) {
			maximised.x = constraints.left;
		}

		if ( constraints.right !== undefined && ( maximised.x + maximised.width ) > constraints.right ) {
			maximised.x = constraints.right - maximised.width;
		}

		// ditto with y bounds
		if ( constraints.top !== undefined && maximised.y < constraints.top ) {
			maximised.y = constraints.top;
		}

		if ( constraints.bottom !== undefined && ( maximised.y + maximised.height ) > constraints.bottom ) {
			maximised.y = constraints.bottom - maximised.height;
		}

		return minimise( maximised.x, maximised.y, maximised.width, maximised.height, desiredAspectRatio );
	};

});
