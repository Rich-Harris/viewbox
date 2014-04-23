import rAF from 'utils/rAF';
import maximise from 'utils/maximise';
import set from 'utils/set';

var DEFAULT_V = 0.9,
	DEFAULT_RHO = 1.42,
	VanWijk;

VanWijk = function ( viewBox, target, options, easingFn ) {
	var self = this, maximisedStart, maximisedEnd, loop, c0, c1, w0, w1, aspectRatio, V, rho, normaliseFactor;

	c0 = { x: viewBox.x + viewBox.width / 2, y: viewBox.y + viewBox.height / 2 };
	c1 = { x: target.x + target.width / 2, y: target.y + target.height / 2 };

	maximisedStart = maximise( viewBox.x, viewBox.y, viewBox.width, viewBox.height, viewBox._elWidth / viewBox._elHeight );
	maximisedEnd = maximise( target.x, target.y, target.width, target.height, viewBox._elWidth / viewBox._elHeight );

	set( viewBox, maximisedStart );

	w0 = maximisedStart.width;
	w1 = maximisedEnd.width;

	// defaults, as per the original paper
	if (options.V === undefined) V = DEFAULT_V;
	if (options.rho === undefined) rho = DEFAULT_RHO;

	aspectRatio = maximisedStart.width / maximisedStart.height;

	// the following is taken from https://gist.github.com/RandomEtc/600144
	// via https://gist.github.com/mbostock/600164. I don't understand
	// any of it.
	var u0 = 0,
		u1 = dist( c0, c1 );

	// i = 0 or 1
	function b ( i ) {
		var n = sq( w1 ) - sq( w0 ) + ( ( i ? -1 : 1 ) * Math.pow( rho, 4 ) * sq( u1 - u0 ) );
		var d = 2 * ( i ? w1 : w0 ) * sq( rho ) * ( u1-u0 );
		return n / d;
	}

	// give this a b(0) or b(1)
	function r ( b ) {
		return Math.log( -b + Math.sqrt( sq( b ) + 1 ) );
	}

	var r0 = r( b( 0 ) ),
		r1 = r( b( 1 ) ),
		S = ( r1 - r0 ) / rho; // "distance"

	normaliseFactor = 1 / S;

	function u ( s ) {
		var a = w0 / sq( rho ),
			b = a * cosh( r0 ) * tanh( rho * s + r0 ),
			c = a * sinh( r0 );
		return b - c + u0;
	}

	function w ( s ) {
		return w0 * cosh( r0 ) / cosh( rho * s + r0 );
	}

	// special case
	if ( Math.abs( u0 - u1 ) < 0.000001 ) {
		if ( Math.abs( w0 - w1 ) < 0.000001 ) return;

		var k = w1 < w0 ? -1 : 1;
		S = Math.abs( Math.log( w1 / w0 ) ) / rho;
		u = function ( s ) {
			return u0;
		}
		w = function ( s ) {
			return w0 * Math.exp( k * rho * s );
		}
	}

	var t0 = Date.now();
	loop = function() {
		var timeNow, elapsed, s, eased, pos, width, height, complete;

		if ( !self.running ) {
			return;
		}

		timeNow = Date.now();
		elapsed = ( timeNow - t0 ) / 1000; // elapsed time in seconds
		s = V * elapsed;

		if ( s > S ) {

			viewBox.set( target );

			if ( options.complete ) {
				options.complete.call( viewBox );
			}

			return;

		}

		rAF( loop );

		eased = easingFn( s * normaliseFactor ) / normaliseFactor;

		pos = lerp2( c0, c1, ( u( eased ) - u0 ) / ( u1 - u0 ) );

		width = w( eased );
		height = ( width / aspectRatio );

		set( viewBox, {
			x: pos.x - width/2,
			y: pos.y - height/2,
			width: width,
			height: height
		});

		if ( options.step ) {
			options.step.call( viewBox );
		}
	};

	this.running = true;
	loop();
};

VanWijk.prototype.stop = function () {
	this.running = false;
};

export default VanWijk;

function sq ( n ) { return n * n; }
function dist ( a, b ) { return Math.sqrt( sq( b.x - a.x ) + sq( b.y - a.y ) ); }
function lerp1 ( a, b, p ) { return a + ( ( b - a ) * p ) }
function lerp2 ( a, b, p ) { return { x: lerp1( a.x, b.x, p ), y: lerp1( a.y, b.y, p ) }; }
function cosh ( x ) { return ( Math.exp( x ) + Math.exp( -x ) ) / 2; }
function sinh ( x ) { return ( Math.exp( x ) - Math.exp( -x ) ) / 2; }
function tanh ( x ) { return sinh( x ) / cosh( x ); }
