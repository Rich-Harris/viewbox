define( function () {

	'use strict';

	return function ViewBox$clean () {
		if ( this._dirty ) {
			// cache screen CTM
			this.screenCTM = this.svg.getScreenCTM();
			this._dirty = false;
		}
	};

});
