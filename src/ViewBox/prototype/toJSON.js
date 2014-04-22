define( function () {

	'use strict';

	return function ViewBox$toJSON () {
		return {
			x: this.x,
			y: this.y,
			width: this.width,
			height: this.height,
			constraints: this.constraints
		};
	};

});
