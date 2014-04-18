define( function () {

	'use strict';

	return function ViewBox$pan ( dx, dy, animate ) {
		var zoom, newX, newY, corrected;

		if ( typeof dx === 'object' ) {
			animate = dx.animate;
			dy = dx.dy;
			dx = dx.dx;
		}

		zoom = this.getZoom();

		newX = this.x -( dx / zoom );
		newY = this.y -( dy / zoom );

		corrected = this.correct( newX, newY, this.width, this.height );

		if ( animate ) {
			this.animate( corrected, animate );
		} else {
			extend( this, corrected );
			this.svg.setAttribute( 'viewBox', this.toString() );
		}
	};

});
