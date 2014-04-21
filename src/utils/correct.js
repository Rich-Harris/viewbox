define( function () {

	'use strict';

	return function correctViewBox ( viewBox, x, y, width, height ) {
		var zoom, clientBox, minWidth, minHeight, corrected, zoomFactor, recheck;

		// TEMP
		if ( typeof x === 'object' ) {
			width = x.width;
			height = x.height;
			y = x.y;
			x = x.x;
		}

		// make sure we don't zoom past the maximum zoom
		if ( viewBox.maxZoom !== undefined ) {
			clientBox = viewBox.getClientBox();

			minWidth = clientBox.width / viewBox.maxZoom;
			minHeight = clientBox.height / viewBox.maxZoom;
		}

		// ensure we are within x bounds, first by panning, then
		// (if that fails) by zooming in
		if ( viewBox.left !== undefined && x < viewBox.left ) {
			x = viewBox.left;
		}

		if ( viewBox.right !== undefined && ( x + width ) > viewBox.right ) {
			x = viewBox.right - width;

			if ( viewBox.left !== undefined && x < viewBox.left ) {
				width = viewBox.right - viewBox.left;
			}
		}

		// ditto with y bounds
		if ( viewBox.top !== undefined && y < viewBox.top ) {
			y = viewBox.top;
		}

		if ( viewBox.bottom !== undefined && ( y + height ) > viewBox.bottom ) {
			y = viewBox.bottom - height;

			if ( viewBox.top !== undefined && y < viewBox.top ) {
				height = viewBox.bottom - viewBox.top;
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
			corrected = correctViewBox( viewBox, corrected.x, corrected.y, corrected.width, corrected.height, true );
		}

		return corrected;
	};

});
