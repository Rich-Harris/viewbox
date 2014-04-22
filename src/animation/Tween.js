define([
	'utils/rAF'
], function (
	rAF
) {

	'use strict';

	var Tween = function ( viewBox, target, options ) {
		var animation = this, fx, fy, fw, fh, dx, dy, dw, dh, startTime, duration, running, easing, loop;

		fx = viewBox.x;
		fy = viewBox.y;
		fw = viewBox.width;
		fh = viewBox.height;

		dx = target.x - fx;
		dy = target.y - fy;
		dw = target.width - fw;
		dh = target.height - fh;

		duration = ( options.duration !== undefined ? options.duration : 400 );
		if ( options.easing ) {
			if ( typeof options.easing === 'function' ) {
				easing = options.easing;
			} else {
				easing = ViewBox.easing[ options.easing ];
			}
		}

		if ( !easing ) {
			easing = function ( t ) { return t; };
		}

		loop = function () {
			var timeNow, elapsed, t;

			if ( !animation.running ) {
				return;
			}

			timeNow = Date.now();
			elapsed = timeNow - startTime;

			if ( elapsed > duration ) {
				viewBox.x = target.x;
				viewBox.y = target.y;
				viewBox.width = target.width;
				viewBox.height = target.height;

				viewBox.svg.setAttribute( 'viewBox', viewBox.toString() );

				if ( options.complete ) {
					options.complete();
				}

				return;
			}

			t = easing( elapsed / duration );

			viewBox.x = fx + ( t * dx );
			viewBox.y = fy + ( t * dy );
			viewBox.width = fw + ( t * dw );
			viewBox.height = fh + ( t * dh );

			if ( options.step ) {
				options.step( t );
			}

			viewBox.svg.setAttribute( 'viewBox', viewBox.toString() );
			viewBox.dirty();

			rAF( loop );
		};

		this.running = true;
		startTime = Date.now();

		loop();
	};

	Tween.prototype.stop = function () {
		this.running = false;
	};

	return Tween;

});
