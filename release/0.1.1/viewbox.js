// ViewBox 0.1.1
// Copyright (2014) Rich Harris
// Released under the MIT License

// https://github.com/Rich-Harris/viewbox

;
( function( global ) {

	'use strict';


	var rAF = function() {

		// https://gist.github.com/paulirish/1579671
		( function( vendors, lastTime, window ) {
			var x;
			for ( x = 0; x < vendors.length && !window.requestAnimationFrame; ++x ) {
				window.requestAnimationFrame = window[ vendors[ x ] + 'RequestAnimationFrame' ];
				window.cancelAnimationFrame = window[ vendors[ x ] + 'CancelAnimationFrame' ] || window[ vendors[ x ] + 'CancelRequestAnimationFrame' ];
			}
			if ( !window.requestAnimationFrame ) {
				window.requestAnimationFrame = function( callback ) {
					var currTime, timeToCall, id;
					currTime = Date.now();
					timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );
					id = window.setTimeout( function() {
						callback( currTime + timeToCall );
					}, timeToCall );
					lastTime = currTime + timeToCall;
					return id;
				};
			}
			if ( !window.cancelAnimationFrame ) {
				window.cancelAnimationFrame = function( id ) {
					window.clearTimeout( id );
				};
			}
		}( [
			'ms',
			'moz',
			'webkit',
			'o'
		], 0, window ) );
		return window.requestAnimationFrame;
	}();

	var clean = function clean( viewBox ) {
		viewBox._elWidth = viewBox.svg.offsetWidth;
		viewBox._elHeight = viewBox.svg.offsetHeight;
		viewBox._aspectRatio = viewBox._elWidth / viewBox._elHeight;
		viewBox._ctm = viewBox.svg.getScreenCTM();
		viewBox._dirty = false;
	};

	var maximise = function maximise( x, y, width, height, containerAspectRatio ) {
		var maximised = {};
		if ( width / height < containerAspectRatio ) {
			// preserve height
			maximised.width = height * containerAspectRatio;
			maximised.height = height;
			maximised.x = x - ( maximised.width - width ) / 2;
			maximised.y = y;
		} else {
			// preserve width
			maximised.width = width;
			maximised.height = width / containerAspectRatio;
			maximised.x = x;
			maximised.y = y - ( maximised.height - height ) / 2;
		}
		return maximised;
	};

	var minimise = function minimise( x, y, width, height, originalAspectRatio ) {
		var minimised = {};
		if ( width / height > originalAspectRatio ) {
			// preserve height
			minimised.width = height * originalAspectRatio;
			minimised.height = height;
			minimised.x = x + ( width - minimised.width ) / 2;
			minimised.y = y;
		} else {
			// preserve width
			minimised.width = width;
			minimised.height = width / originalAspectRatio;
			minimised.x = x;
			minimised.y = y + ( height - minimised.height ) / 2;
		}
		return minimised;
	};

	var constrain = function( clean, maximise, minimise ) {

		return function constrain( x, y, width, height, elWidth, elHeight, constraints ) {
			var currentZoom, clientBox, maximised, cx, cy, minWidth, minHeight, desiredAspectRatio, constrained, maxZoomFactor, minZoomX, minZoomY, minZoom, minZoomFactor, zoomFactor, recheck, d;
			desiredAspectRatio = width / height;
			maximised = maximise( x, y, width, height, elWidth / elHeight );
			currentZoom = elWidth / maximised.width;
			maxZoomFactor = 1;
			// If we're past the maxZoom, we need to zoom out
			if ( constraints.maxZoom !== undefined && currentZoom > constraints.maxZoom ) {
				maxZoomFactor = constraints.maxZoom / currentZoom;
			}
			// But if we violate our bounds, we need to zoom in
			if ( constraints.left !== undefined && constraints.right !== undefined ) {
				minZoomX = elWidth / ( constraints.right - constraints.left );
			}
			if ( constraints.top !== undefined && constraints.bottom !== undefined ) {
				minZoomY = elHeight / ( constraints.bottom - constraints.top );
			}
			minZoom = Math.max( minZoomX || 0, minZoomY || 0 );
			// Bounds take priority over maxZoom
			zoomFactor = Math.max( minZoom / currentZoom, maxZoomFactor );
			if ( zoomFactor !== 1 ) {
				// Apply zoom
				cx = maximised.x + maximised.width / 2;
				cy = maximised.y + maximised.height / 2;
				maximised.width /= zoomFactor;
				maximised.height /= zoomFactor;
				maximised.x = cx - maximised.width / 2;
				maximised.y = cy - maximised.height / 2;
			}
			// Ensure that we're in bounds
			if ( constraints.left !== undefined && maximised.x < constraints.left ) {
				maximised.x = constraints.left;
			}
			if ( constraints.right !== undefined && maximised.x + maximised.width > constraints.right ) {
				maximised.x = constraints.right - maximised.width;
			}
			if ( constraints.top !== undefined && maximised.y < constraints.top ) {
				maximised.y = constraints.top;
			}
			if ( constraints.bottom !== undefined && maximised.y + maximised.height > constraints.bottom ) {
				maximised.y = constraints.bottom - maximised.height;
			}
			// Minimise the result, so it better matches the user's intentions (i.e. same aspect ratio)
			return minimise( maximised.x, maximised.y, maximised.width, maximised.height, desiredAspectRatio );
		};
	}( clean, maximise, minimise );

	var easing = {
		linear: function( pos ) {
			return pos;
		},
		easeIn: function( pos ) {
			return Math.pow( pos, 3 );
		},
		easeOut: function( pos ) {
			return Math.pow( pos - 1, 3 ) + 1;
		},
		easeInOut: function( pos ) {
			if ( ( pos /= 0.5 ) < 1 ) {
				return 0.5 * Math.pow( pos, 3 );
			}
			return 0.5 * ( Math.pow( pos - 2, 3 ) + 2 );
		}
	};

	var set = function set( viewBox, box ) {
		viewBox.x = box.x;
		viewBox.y = box.y;
		viewBox.width = box.width;
		viewBox.height = box.height;
		viewBox.svg.setAttribute( 'viewBox', viewBox.toString() );
		viewBox._dirty = true;
	};

	var Tween = function( rAF, maximise, constrain, set ) {

		var Tween = function( viewBox, target, options, easing ) {
			var animation = this,
				constrained, maximisedStart, maximisedEnd, fx, fy, fw, fh, dx, dy, dw, dh, startTime, duration, running, easing, loop;
			constrained = constrain( target.x, target.y, target.width, target.height, viewBox._elWidth, viewBox._elWidth, viewBox.constraints );
			maximisedStart = maximise( viewBox.x, viewBox.y, viewBox.width, viewBox.height, viewBox._aspectRatio );
			maximisedEnd = maximise( constrained.x, constrained.y, constrained.width, constrained.height, viewBox._aspectRatio );
			set( viewBox, maximisedStart );
			fx = maximisedStart.x;
			fy = maximisedStart.y;
			fw = maximisedStart.width;
			fh = maximisedStart.height;
			dx = maximisedEnd.x - fx;
			dy = maximisedEnd.y - fy;
			dw = maximisedEnd.width - fw;
			dh = maximisedEnd.height - fh;
			duration = options.duration !== undefined ? options.duration : 400;
			loop = function() {
				var timeNow, elapsed, t;
				if ( !animation.running ) {
					return;
				}
				timeNow = Date.now();
				elapsed = timeNow - startTime;
				if ( elapsed > duration ) {
					set( viewBox, constrained );
					if ( options.complete ) {
						options.complete.call( viewBox, 1 );
					}
					return;
				}
				t = easing( elapsed / duration );
				set( viewBox, {
					x: fx + t * dx,
					y: fy + t * dy,
					width: fw + t * dw,
					height: fh + t * dh
				} );
				if ( options.step ) {
					options.step.call( viewBox, t );
				}
				rAF( loop );
			};
			this.running = true;
			startTime = Date.now();
			loop();
		};
		Tween.prototype.stop = function() {
			this.running = false;
		};
		return Tween;
	}( rAF, maximise, constrain, set );

	var VanWijk = function( rAF, maximise, set ) {

		var DEFAULT_V = 0.9,
			DEFAULT_RHO = 1.42,
			VanWijk;
		VanWijk = function( viewBox, target, options, easingFn ) {
			var self = this,
				maximisedStart, maximisedEnd, loop, c0, c1, w0, w1, aspectRatio, V, rho, normaliseFactor;
			c0 = {
				x: viewBox.x + viewBox.width / 2,
				y: viewBox.y + viewBox.height / 2
			};
			c1 = {
				x: target.x + target.width / 2,
				y: target.y + target.height / 2
			};
			maximisedStart = maximise( viewBox.x, viewBox.y, viewBox.width, viewBox.height, viewBox._elWidth / viewBox._elHeight );
			maximisedEnd = maximise( target.x, target.y, target.width, target.height, viewBox._elWidth / viewBox._elHeight );
			set( viewBox, maximisedStart );
			w0 = maximisedStart.width;
			w1 = maximisedEnd.width;
			// defaults, as per the original paper
			if ( options.V === undefined )
				V = DEFAULT_V;
			if ( options.rho === undefined )
				rho = DEFAULT_RHO;
			aspectRatio = maximisedStart.width / maximisedStart.height;
			// the following is taken from https://gist.github.com/RandomEtc/600144
			// via https://gist.github.com/mbostock/600164. I don't understand
			// any of it.
			var u0 = 0,
				u1 = dist( c0, c1 );
			// i = 0 or 1
			function b( i ) {
				var n = sq( w1 ) - sq( w0 ) + ( i ? -1 : 1 ) * Math.pow( rho, 4 ) * sq( u1 - u0 );
				var d = 2 * ( i ? w1 : w0 ) * sq( rho ) * ( u1 - u0 );
				return n / d;
			}
			// give this a b(0) or b(1)
			function r( b ) {
				return Math.log( -b + Math.sqrt( sq( b ) + 1 ) );
			}
			var r0 = r( b( 0 ) ),
				r1 = r( b( 1 ) ),
				S = ( r1 - r0 ) / rho;
			// "distance"
			normaliseFactor = 1 / S;

			function u( s ) {
				var a = w0 / sq( rho ),
					b = a * cosh( r0 ) * tanh( rho * s + r0 ),
					c = a * sinh( r0 );
				return b - c + u0;
			}

			function w( s ) {
				return w0 * cosh( r0 ) / cosh( rho * s + r0 );
			}
			// special case
			if ( Math.abs( u0 - u1 ) < 0.000001 ) {
				if ( Math.abs( w0 - w1 ) < 0.000001 )
					return;
				var k = w1 < w0 ? -1 : 1;
				S = Math.abs( Math.log( w1 / w0 ) ) / rho;
				u = function( s ) {
					return u0;
				};
				w = function( s ) {
					return w0 * Math.exp( k * rho * s );
				};
			}
			var t0 = Date.now();
			loop = function() {
				var timeNow, elapsed, s, eased, pos, width, height, complete;
				if ( !self.running ) {
					return;
				}
				timeNow = Date.now();
				elapsed = ( timeNow - t0 ) / 1000;
				// elapsed time in seconds
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
				height = width / aspectRatio;
				set( viewBox, {
					x: pos.x - width / 2,
					y: pos.y - height / 2,
					width: width,
					height: height
				} );
				if ( options.step ) {
					options.step.call( viewBox );
				}
			};
			this.running = true;
			loop();
		};
		VanWijk.prototype.stop = function() {
			this.running = false;
		};
		return VanWijk;

		function sq( n ) {
			return n * n;
		}

		function dist( a, b ) {
			return Math.sqrt( sq( b.x - a.x ) + sq( b.y - a.y ) );
		}

		function lerp1( a, b, p ) {
			return a + ( b - a ) * p;
		}

		function lerp2( a, b, p ) {
			return {
				x: lerp1( a.x, b.x, p ),
				y: lerp1( a.y, b.y, p )
			};
		}

		function cosh( x ) {
			return ( Math.exp( x ) + Math.exp( -x ) ) / 2;
		}

		function sinh( x ) {
			return ( Math.exp( x ) - Math.exp( -x ) ) / 2;
		}

		function tanh( x ) {
			return sinh( x ) / cosh( x );
		}
	}( rAF, maximise, set );

	var ViewBox$animate = function( rAF, clean, constrain, maximise, minimise, easing, Tween, VanWijk ) {

		var empty = {};
		return function ViewBox$animate( x, y, width, height, options ) {
			var maximised, reshaped, constrained, easingFn;
			if ( this._dirty )
				clean( this );
			if ( typeof x === 'object' ) {
				options = y;
				width = x.width !== undefined ? x.width : this.width;
				height = x.height !== undefined ? x.height : this.height;
				y = x.y !== undefined ? x.y : this.y;
				x = x.x !== undefined ? x.x : this.x;
			}
			options = options || empty;
			if ( this.animation ) {
				this.animation.stop();
			}
			constrained = constrain( x, y, width, height, this._elWidth, this._elHeight, this.constraints );
			easingFn = ( typeof options.easing === 'function' ? options.easing : easing[ options.easing ] ) || linear;
			if ( options.smooth ) {
				this.animation = new VanWijk( this, constrained, options, easingFn );
			} else {
				this.animation = new Tween( this, constrained, options, easingFn );
			}
		};

		function linear( t ) {
			return t;
		}
	}( rAF, clean, constrain, maximise, minimise, easing, Tween, VanWijk );

	var ViewBox$getClientCoords = function( clean ) {

		return function ViewBox$getClientCoords( svgX, svgY ) {
			var ctm, ctm_a;
			if ( this._dirty )
				clean( this );
			if ( typeof svgX === 'object' ) {
				svgY = svgX.y;
				svgX = svgX.x;
			}
			ctm = this._ctm;
			ctm_a = ctm.a;
			return {
				x: svgX * ctm_a + ctm.e,
				y: svgY * ctm_a + ctm.f
			};
		};
	}( clean );

	var ViewBox$getSvgCoords = function( clean ) {

		return function ViewBox$getSvgCoords( clientX, clientY ) {
			var ctm, ctm_a;
			if ( this._dirty )
				clean( this );
			if ( typeof clientX === 'object' ) {
				clientY = clientX.y;
				clientX = clientX.x;
			}
			ctm = this._ctm;
			ctm_a = ctm.a;
			return {
				x: ( clientX - ctm.e ) / ctm_a,
				y: ( clientY - ctm.f ) / ctm_a
			};
		};
	}( clean );

	var ViewBox$getZoom = function( clean ) {

		return function ViewBox$getZoom() {
			if ( this._dirty )
				clean( this );
			return this._elWidth / this.width;
		};
	}( clean );

	var extend = function extend( obj1, obj2 ) {
		var key;
		if ( !obj2 ) {
			return;
		}
		for ( key in obj2 ) {
			if ( obj2.hasOwnProperty( key ) ) {
				obj1[ key ] = obj2[ key ];
			}
		}
	};

	var ViewBox$pan = function( clean, extend, constrain ) {

		return function ViewBox$pan( dx, dy, animate ) {
			var zoom, newX, newY, constrained;
			if ( this._dirty )
				clean( this );
			if ( typeof dx === 'object' ) {
				animate = dx.animate;
				dy = dx.dy;
				dx = dx.dx;
			}
			zoom = this.getZoom();
			newX = this.x - dx / zoom;
			newY = this.y - dy / zoom;
			constrained = constrain( newX, newY, this.width, this.height, this._elWidth, this._elHeight, this.constraints );
			if ( animate ) {
				this.animate( constrained, animate );
			} else {
				extend( this, constrained );
				this.svg.setAttribute( 'viewBox', this.toString() );
			}
		};
	}( clean, extend, constrain );

	var ViewBox$set = function( clean, extend, constrain, maximise, set ) {

		return function ViewBox$set( x, y, width, height, constraints ) {
			var constrained;
			if ( this._dirty )
				clean( this );
			if ( typeof x === 'object' ) {
				constraints = y;
				this.x = x.x;
				this.y = x.y;
				this.width = x.width;
				this.height = x.height;
			} else {
				this.x = x;
				this.y = y;
				this.width = width;
				this.height = height;
			}
			extend( this.constraints, constraints );
			constrained = constrain( this.x, this.y, this.width, this.height, this._elWidth, this._elHeight, this.constraints );
			set( this, constrained );
		};
	}( clean, extend, constrain, maximise, set );

	var ViewBox$toJSON = function ViewBox$toJSON() {
		return {
			x: this.x,
			y: this.y,
			width: this.width,
			height: this.height,
			constraints: this.constraints
		};
	};

	var ViewBox$toString = function ViewBox$toString() {
		return this.x + ' ' + this.y + ' ' + this.width + ' ' + this.height;
	};

	var zoom = function zoom( current, x, y, factor ) {
		var newX, newY, newWidth, newHeight, x1_to_cx, y1_to_cy;
		newWidth = current.width / factor;
		newHeight = current.height / factor;
		x1_to_cx = x - current.x;
		y1_to_cy = y - current.y;
		newX = x - x1_to_cx / factor;
		newY = y - y1_to_cy / factor;
		return {
			x: newX,
			y: newY,
			width: newWidth,
			height: newHeight
		};
	};

	var ViewBox$zoom = function( zoom, extend ) {

		return function ViewBox$zoom( clientX, clientY, factor, animate ) {
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
	}( zoom, extend );

	var parseViewBox = function parseViewBox( str ) {
		var split = str.split( ' ' );
		return {
			x: +split[ 0 ],
			y: +split[ 1 ],
			width: +split[ 2 ],
			height: +split[ 3 ]
		};
	};

	var getViewBoxFromSvg = function( parseViewBox ) {

		return function getViewBoxFromSvg( svg ) {
			var viewBoxAttr, width, height, boundingClientRect;
			viewBoxAttr = svg.getAttribute( 'viewBox' );
			if ( viewBoxAttr ) {
				return parseViewBox( viewBoxAttr );
			} else {
				width = svg.getAttribute( 'width' );
				height = svg.getAttribute( 'height' );
				if ( !width && !height ) {
					boundingClientRect = svg.getBoundingClientRect();
					width = boundingClientRect.width;
					height = boundingClientRect.height;
				}
				return {
					x: 0,
					y: 0,
					width: width || 100,
					height: height || 100
				};
			}
		};
	}( parseViewBox );

	var ViewBox = function( animate, getClientCoords, getSvgCoords, getZoom, pan, set, toJSON, toString, zoom, easing, getViewBoxFromSvg ) {

		var ViewBox, empty = {};
		ViewBox = function( svg, options ) {
			var self = this,
				initialViewBox;
			if ( !( svg instanceof SVGSVGElement ) ) {
				throw new Error( 'First argument must be an svg element' );
			}
			options = options || empty;
			this.svg = svg;
			this.constraints = options.constraints || {};
			// register as dirty whenever user resizes or scrolls (manually invoke using
			// the viewBox.dirty() method)
			this.dirty = function() {
				self._dirty = true;
			};
			window.addEventListener( 'resize', this.dirty );
			window.addEventListener( 'scroll', this.dirty );
			this.dirty();
			initialViewBox = getViewBoxFromSvg( this.svg );
			if ( 'x' in options )
				initialViewBox.x = options.x;
			if ( 'y' in options )
				initialViewBox.y = options.y;
			if ( 'width' in options )
				initialViewBox.width = options.width;
			if ( 'height' in options )
				initialViewBox.height = options.height;
			this.set( initialViewBox );
		};
		ViewBox.prototype = {
			animate: animate,
			getClientCoords: getClientCoords,
			getSvgCoords: getSvgCoords,
			getZoom: getZoom,
			pan: pan,
			set: set,
			toJSON: toJSON,
			toString: toString,
			zoom: zoom
		};
		ViewBox.easing = easing;
		return ViewBox;
	}( ViewBox$animate, ViewBox$getClientCoords, ViewBox$getSvgCoords, ViewBox$getZoom, ViewBox$pan, ViewBox$set, ViewBox$toJSON, ViewBox$toString, ViewBox$zoom, easing, getViewBoxFromSvg );




	// export as CommonJS...
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = ViewBox;
	}

	// ...or as AMD module
	else if ( typeof define !== 'undefined' && define.amd ) {
		define( function() {
			return ViewBox;
		} );
	}

	// ...or as browser global
	else {
		global.ViewBox = ViewBox;
	}

}( typeof window !== 'undefined' ? window : this ) );
