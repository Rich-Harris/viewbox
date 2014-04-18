define( function () {

	'use strict';

	return function ViewBox$getZoom () {
		return this.svg.getScreenCTM().a;
	};

});
