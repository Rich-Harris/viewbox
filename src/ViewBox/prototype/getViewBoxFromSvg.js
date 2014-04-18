define([
	'utils/parseViewBox'
], function (
	parseViewBox
) {

	'use strict';

	return function ViewBox$getViewBoxFromSvg () {
		var viewBoxAttr, width, height, boundingClientRect;

		viewBoxAttr = this.svg.getAttribute( 'viewBox' );
		if ( viewBoxAttr ) {
			this.set( parseViewBox( viewBoxAttr ) );
		}

		else {
			width = this.svg.getAttribute( 'width' );
			height = this.svg.getAttribute( 'height' );

			if ( !width && !height ) {
				boundingClientRect = this.svg.getBoundingClientRect;
				width = boundingClientRect.width;
				height = boundingClientRect.height;
			}

			this.set({
				x: 0,
				y: 0,
				width: width || 100,
				height: height || 100
			});
		}
	};

});
