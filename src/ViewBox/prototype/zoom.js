define([
	'utils/zoom',
	'utils/extend'
], function (
	zoom,
	extend
) {

	'use strict';

	return function ViewBox$zoom ( clientX, clientY, factor, animate ) {
		var coords, zoomed, corrected, maxWidth, maxHeight;

		if ( typeof clientX === 'object' ) {
			factor = clientX.factor;
			animate = clientX.animate;
			clientY = clientX.y;
			clientX = clientX.x;
		}

		if ( isNaN( clientX ) || isNaN( clientY ) || isNaN( factor ) ) {
			throw new Error( 'Bad arguments: ' + Array.prototype.slice.call( arguments ).join( ', ' ) );
		}

		coords = this.getSvgCoords( clientX, clientY );

		// make sure we don't zoom past the maximum...
		if ( this.maxZoom !== undefined ) {
			factor = Math.min( factor, this.maxZoom / this.getZoom() );
		}

		// ... or the minimum
		if ( this.left !== undefined && this.right !== undefined ) {
			maxWidth = this.right - this.left;
			factor = Math.max( factor, this.width / maxWidth );
		}

		if ( this.top !== undefined && this.bottom !== undefined ) {
			maxHeight = this.bottom - this.top;
			factor = Math.max( factor, this.height / maxHeight );
		}

		zoomed = zoom( this, coords.x, coords.y, factor );

		corrected = this.correct( zoomed );

		if ( animate ) {
			this.animate( corrected, animate );
		} else {
			extend( this, corrected );
			this.svg.setAttribute( 'viewBox', this.toString() );
		}
	};

});
