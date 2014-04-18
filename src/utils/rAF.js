define( function () {

	'use strict';

	// https://gist.github.com/paulirish/1579671
	(function( vendors, lastTime, window ) {

		var x;

		for ( x = 0; x < vendors.length && !window.requestAnimationFrame; ++x ) {
			window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
			window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
		}

		if ( !window.requestAnimationFrame ) {
			window.requestAnimationFrame = function(callback) {
				var currTime, timeToCall, id;

				currTime = Date.now();
				timeToCall = Math.max( 0, 16 - (currTime - lastTime ) );
				id = window.setTimeout( function() { callback(currTime + timeToCall); }, timeToCall );

				lastTime = currTime + timeToCall;
				return id;
			};
		}

		if ( !window.cancelAnimationFrame ) {
			window.cancelAnimationFrame = function( id ) {
				window.clearTimeout( id );
			};
		}
	}( ['ms', 'moz', 'webkit', 'o'], 0, window ));

	return window.requestAnimationFrame;

});
