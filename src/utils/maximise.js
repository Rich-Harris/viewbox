define( function () {

	'use strict';

	var maximised = {};

	return function maximise ( x, y, width, height, containerAspectRatio ) {
		if ( ( width / height ) < containerAspectRatio ) {
			// preserve height
			maximised.width = height * containerAspectRatio;
			maximised.height = height;

			maximised.x = x - ( maximised.width - width ) / 2;
			maximised.y = y;
		} else {
			// preserve width
			maximised.width = width;
			maximised.height = width / containerAspectRatio;

			maximised.x = x;
			maximised.y = y - ( maximised.height - height ) / 2;
		}

		return maximised;
	};

});
