define( function () {

	'use strict';

	return function parseViewBox ( str ) {
		var split = str.split( ' ' );

		return {
			x: +split[0],
			y: +split[1],
			width: +split[2],
			height: +split[3]
		};
	};

});
