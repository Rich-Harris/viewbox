define( function () {

	'use strict';

	return function ViewBox$toString () {
		return this.x + ' ' + this.y + ' ' + this.width + ' ' + this.height;
	};

});
