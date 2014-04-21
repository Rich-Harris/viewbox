define([
	'utils/correct'
], function (
	correct
) {

	'use strict';

	return function ViewBox$correct ( x, y, width, height, secondPass ) {
		return correctViewBox( this, x, y, width, height );
		/*var zoom, clientBox, minWidth, minHeight, corrected, zoomFactor, recheck;

		// TEMP
		if ( typeof x === 'object' ) {
			width = x.width;
			height = x.height;
			y = x.y;
			x = x.x;
		}

		// make sure we don't zoom past the maximum zoom
		if ( this.maxZoom !== undefined ) {
			clientBox = this.getClientBox();

			minWidth = clientBox.width / this.maxZoom;
			minHeight = clientBox.height / this.maxZoom;
		}

		// ensure we are within x bounds, first by panning, then
		// (if that fails) by zooming in
		if ( this.left !== undefined && x < this.left ) {
			x = this.left;
		}

		if ( this.right !== undefined && ( x + width ) > this.right ) {
			x = this.right - width;

			if ( this.left !== undefined && x < this.left ) {
				width = this.right - this.left;
			}
		}

		// ditto with y bounds
		if ( this.top !== undefined && y < this.top ) {
			y = this.top;
		}

		if ( this.bottom !== undefined && ( y + height ) > this.bottom ) {
			y = this.bottom - height;

			if ( this.top !== undefined && y < this.top ) {
				height = this.bottom - this.top;
			}
		}

		corrected = {
			x: x,
			y: y,
			width: width,
			height: height
		};

		// do we need to zoom out?
		zoomFactor = 1;

		if ( minWidth !== undefined && width < minWidth ) {
			zoomFactor = Math.min( zoomFactor, width / minWidth );
			recheck = true;
		}

		if ( minHeight !== undefined && height < minHeight ) {
			zoomFactor = Math.min( zoomFactor, height / minHeight );
			recheck = true;
		}

		if ( zoomFactor < 1 ) {
			corrected = zoom( corrected, corrected.x + ( corrected.width / 2 ), corrected.y + ( corrected.height / 2 ), zoomFactor );
		}

		// if we need to do another pass, do so, but only one
		if ( recheck && !secondPass ) {
			corrected = this.correct( corrected.x, corrected.y, corrected.width, corrected.height, true );
		}

		return corrected;*/
	};

});
