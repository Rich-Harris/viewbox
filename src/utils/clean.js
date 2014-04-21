define( function () {

	'use strict';

	return function cleanViewBox ( viewBox ) {
		viewBox._elWidth = viewBox.svg.offsetWidth;
		viewBox._elHeight = viewBox.svg.offsetHeight;
		viewBox._ctm = viewBox.svg.getScreenCTM();
		viewBox._dirty = false;
	}

});
