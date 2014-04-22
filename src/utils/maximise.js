define( function () {

	'use strict';

	return function maximise ( x, y, width, height, elWidth, elHeight ) {
		var cx, cy, elAspectRatio, viewBoxAspectRatio, maximised, width, height;

		cx = x + width / 2;
		cy = y + height / 2;

		elAspectRatio = elWidth / elHeight;
		viewBoxAspectRatio = width / height;

		maximised = {};

		if ( viewBoxAspectRatio < elAspectRatio ) {
			// specified view is narrower than container - we
			// need to increase the width
			maximised.width = height * elAspectRatio;
			maximised.height = height;

			maximised.x = x - ( maximised.width - width ) / 2;
			maximised.y = y;
		} else {
			maximised.width = width;
			maximised.height = width / elAspectRatio;

			maximised.x = x;
			maximised.y = y - ( maximised.height - height ) / 2;
		}

		return maximised;
	};

});
