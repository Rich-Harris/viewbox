define([
	'utils/rAF',
	'utils/constrain',
	'utils/maximise',
	'animation/Tween',
	'animation/VanWijk'
], function (
	rAF,
	constrain,
	maximise,
	Tween,
	VanWijk
) {

	var animation, empty = {};

	animation = function ( viewBox, to, options ) {
		var animation, fx, fy, fw, fh, dx, dy, dw, dh, startTime, duration, running, easing, loop;

		animation = {};

		fx = viewBox.x;
		fy = viewBox.y;
		fw = viewBox.width;
		fh = viewBox.height;

		dx = to.x - fx;
		dy = to.y - fy;
		dw = to.width - fw;
		dh = to.height - fh;

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

			if ( !running ) {
				return;
			}

			timeNow = Date.now();
			elapsed = timeNow - startTime;

			if ( elapsed > duration ) {
				viewBox.x = to.x;
				viewBox.y = to.y;
				viewBox.width = to.width;
				viewBox.height = to.height;

				viewBox.svg.setAttribute( 'viewBox', viewBox.toString() );

				if ( options.complete ) {
					// set the REAL viewbox


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

		animation.stop = function () {
			running = false;
		};

		running = true;
		startTime = Date.now();

		loop();

		return animation;
	};

	return function ViewBox$animate ( x, y, width, height, options ) {
		var constrained;

		if ( typeof x === 'object' ) {
			options = y;

			width = ( x.width !== undefined ? x.width : this.width );
			height = ( x.height !== undefined ? x.height : this.height );
			y = ( x.y !== undefined ? x.y : this.y );
			x = ( x.x !== undefined ? x.x : this.x );
		}

		options = options || empty;

		if ( this.animation ) {
			this.animation.stop();
		}

		constrained = constrain( this, x, y, width, height );

		if ( options.smooth ) {
			this.animation = new VanWijk( this, constrained, options );
		} else {
			this.animation = new Tween( this, constrained, options );
		}
	};

});
