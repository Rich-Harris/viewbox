define( function () {

	'use strict';

	return function constrain ( x, y, width, height, elWidth, elHeight, constraints, secondPass ) {
		var zoom, clientBox, minWidth, minHeight, constrained, zoomFactor, recheck;

		console.log( arguments );

		// make sure we don't zoom past the maximum zoom
		if ( constraints.maxZoom !== undefined ) {
			clientBox = constraints.getClientBox();

			minWidth = clientBox.width / constraints.maxZoom;
			minHeight = clientBox.height / constraints.maxZoom;
		}

		// ensure we are within x bounds, first by panning, then
		// (if that fails) by zooming in
		if ( constraints.left !== undefined && x < constraints.left ) {
			x = constraints.left;
		}

		if ( constraints.right !== undefined && ( x + width ) > constraints.right ) {
			x = constraints.right - width;

			if ( constraints.left !== undefined && x < constraints.left ) {
				width = constraints.right - constraints.left;
			}
		}

		// ditto with y bounds
		if ( constraints.top !== undefined && y < constraints.top ) {
			y = constraints.top;
		}

		if ( constraints.bottom !== undefined && ( y + height ) > constraints.bottom ) {
			y = constraints.bottom - height;

			if ( constraints.top !== undefined && y < constraints.top ) {
				height = constraints.bottom - constraints.top;
			}
		}

		constrained = {
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
			constrained = zoom( constrained, constrained.x + ( constrained.width / 2 ), constrained.y + ( constrained.height / 2 ), zoomFactor );
		}

		// if we need to do another pass, do so, but only one
		if ( recheck && !secondPass ) {
			constrained = constrain( constrained.x, constrained.y, constrained.width, constrained.height, elWidth, elHeight, constraints, true );
		}

		return constrained;
	};

});
