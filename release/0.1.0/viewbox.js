// ViewBox 0.1.0
// Copyright (2014) Rich Harris
// Released under the MIT License

// https://github.com/Rich-Harris/viewbox

;
( function( global ) {

	'use strict';


	var utils_rAF = function() {

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

	var ViewBox_prototype_animate = function( rAF ) {
		var animation = function( viewBox, to, options ) {
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
			duration = options.duration !== undefined ? options.duration : 400;
			if ( options.easing ) {
				if ( typeof options.easing === 'function' ) {
					easing = options.easing;
				} else {
					easing = ViewBox.easing[ options.easing ];
				}
			}
			if ( !easing ) {
				easing = function( t ) {
					return t;
				};
			}
			loop = function() {
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
						options.complete();
					}
					return;
				}
				t = easing( elapsed / duration );
				viewBox.x = fx + t * dx;
				viewBox.y = fy + t * dy;
				viewBox.width = fw + t * dw;
				viewBox.height = fh + t * dh;
				if ( options.step ) {
					options.step( t );
				}
				viewBox.svg.setAttribute( 'viewBox', viewBox.toString() );
				viewBox.dirty();
				rAF( loop );
			};
			animation.stop = function() {
				running = false;
			};
			running = true;
			startTime = Date.now();
			loop();
			return animation;
		};
		return function ViewBox$animate( x, y, width, height, options ) {
			var corrected;
			if ( typeof x === 'object' ) {
				options = y;
				width = x.width !== undefined ? x.width : this.width;
				height = x.height !== undefined ? x.height : this.height;
				y = x.y !== undefined ? x.y : this.y;
				x = x.x !== undefined ? x.x : this.x;
			}
			options = options || {};
			if ( this.animation ) {
				this.animation.stop();
			}
			corrected = this.correct( x, y, width, height );
			this.animation = animation( this, corrected, options );
		};
	}( utils_rAF );

	var ViewBox_prototype_aspectRatio = function ViewBox$aspectRatio() {
		return this.width / this.height;
	};

	var ViewBox_prototype_clean = function ViewBox$clean() {
		if ( this._dirty ) {
			// cache screen CTM
			this.screenCTM = this.svg.getScreenCTM();
			this._dirty = false;
		}
	};

	var ViewBox_prototype_correct = function ViewBox$correct( x, y, width, height, secondPass ) {
		var zoom, clientBox, minWidth, minHeight, corrected, zoomFactor, recheck;
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
		if ( this.right !== undefined && x + width > this.right ) {
			x = this.right - width;
			if ( this.left !== undefined && x < this.left ) {
				width = this.right - this.left;
			}
		}
		// ditto with y bounds
		if ( this.top !== undefined && y < this.top ) {
			y = this.top;
		}
		if ( this.bottom !== undefined && y + height > this.bottom ) {
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
			corrected = zoom( corrected, corrected.x + corrected.width / 2, corrected.y + corrected.height / 2, zoomFactor );
		}
		// if we need to do another pass, do so, but only one
		if ( recheck && !secondPass ) {
			corrected = this.correct( corrected.x, corrected.y, corrected.width, corrected.height, true );
		}
		return corrected;
	};

	var ViewBox_prototype_getClientCoords = function ViewBox$getClientCoords( svgX, svgY ) {
		if ( this._dirty ) {
			this.clean();
		}
		if ( typeof svgX === 'object' ) {
			svgY = svgX.y;
			svgX = svgX.x;
		}
		return {
			x: svgX * this.screenCTM.a + this.screenCTM.e,
			y: svgY * this.screenCTM.a + this.screenCTM.f
		};
	};

	var ViewBox_prototype_getSvgCoords = function ViewBox$getSvgCoords( clientX, clientY ) {
		var ctm;
		if ( this._dirty ) {
			this.clean();
		}
		if ( typeof clientX === 'object' ) {
			clientY = clientX.y;
			clientX = clientX.x;
		}
		ctm = this.screenCTM;
		return {
			x: ( clientX - ctm.e ) / ctm.a,
			y: ( clientY - ctm.f ) / ctm.a
		};
	};

	var utils_parseViewBox = function parseViewBox( str ) {
		var split = str.split( ' ' );
		return {
			x: +split[ 0 ],
			y: +split[ 1 ],
			width: +split[ 2 ],
			height: +split[ 3 ]
		};
	};

	var ViewBox_prototype_getViewBoxFromSvg = function( parseViewBox ) {

		return function ViewBox$getViewBoxFromSvg() {
			var viewBoxAttr, width, height, boundingClientRect;
			viewBoxAttr = this.svg.getAttribute( 'viewBox' );
			if ( viewBoxAttr ) {
				this.set( parseViewBox( viewBoxAttr ) );
			} else {
				width = this.svg.getAttribute( 'width' );
				height = this.svg.getAttribute( 'height' );
				if ( !width && !height ) {
					boundingClientRect = this.svg.getBoundingClientRect;
					width = boundingClientRect.width;
					height = boundingClientRect.height;
				}
				this.set( {
					x: 0,
					y: 0,
					width: width || 100,
					height: height || 100
				} );
			}
		};
	}( utils_parseViewBox );

	var ViewBox_prototype_getZoom = function ViewBox$getZoom() {
		return this.svg.getScreenCTM().a;
	};

	var ViewBox_prototype_pan = function ViewBox$pan( dx, dy, animate ) {
		var zoom, newX, newY, corrected;
		if ( typeof dx === 'object' ) {
			animate = dx.animate;
			dy = dx.dy;
			dx = dx.dx;
		}
		zoom = this.getZoom();
		newX = this.x - dx / zoom;
		newY = this.y - dy / zoom;
		corrected = this.correct( newX, newY, this.width, this.height );
		if ( animate ) {
			this.animate( corrected, animate );
		} else {
			extend( this, corrected );
			this.svg.setAttribute( 'viewBox', this.toString() );
		}
	};

	var utils_extend = function extend( obj1, obj2 ) {
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

	var ViewBox_prototype_set = function( extend ) {

		return function ViewBox$set( x, y, width, height, options ) {
			var corrected;
			if ( typeof x === 'object' ) {
				extend( this, x );
			} else {
				this.x = x;
				this.y = y;
				this.width = width;
				this.height = height;
				extend( this, options );
			}
			corrected = this.correct( this.x, this.y, this.width, this.height );
			extend( this, corrected );
			this.svg.setAttribute( 'viewBox', this.toString() );
		};
	}( utils_extend );

	var ViewBox_prototype_toString = function ViewBox$toString() {
		return this.x + ' ' + this.y + ' ' + this.width + ' ' + this.height;
	};

	var utils_zoom = function zoom( current, x, y, factor ) {
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

	var ViewBox_prototype_zoom = function( zoom, extend ) {

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
	}( utils_zoom, utils_extend );

	var utils_easing = {
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

	var ViewBox_ViewBox = function( animate, aspectRatio, clean, correct, getClientCoords, getSvgCoords, getViewBoxFromSvg, getZoom, pan, set, toString, zoom, easing ) {

		var ViewBox = function( svg, x, y, width, height, options ) {
			var self = this;
			if ( !( svg instanceof SVGSVGElement ) ) {
				throw new Error( 'First argument must be an svg element' );
			}
			this.svg = svg;
			// register as dirty whenever user resizes or scrolls (manually invoke using
			// the viewBox.dirty() method)
			this.dirty = function() {
				self._dirty = true;
			};
			window.addEventListener( 'resize', this.dirty );
			window.addEventListener( 'scroll', this.dirty );
			this.dirty();
			if ( arguments.length === 1 ) {
				this.getViewBoxFromSvg();
			} else if ( arguments.length === 2 && typeof x === 'object' ) {
				this.getViewBoxFromSvg();
				this.set( x );
			} else {
				this.set( {
					x: x,
					y: y,
					width: width,
					height: height
				} );
				if ( options ) {
					this.set( options );
				}
			}
		};
		ViewBox.prototype = {
			animate: animate,
			aspectRatio: aspectRatio,
			clean: clean,
			correct: correct,
			getClientCoords: getClientCoords,
			getSvgCoords: getSvgCoords,
			getViewBoxFromSvg: getViewBoxFromSvg,
			getZoom: getZoom,
			pan: pan,
			set: set,
			toString: toString,
			zoom: zoom
		};
		ViewBox.easing = easing;
		return ViewBox;
	}( ViewBox_prototype_animate, ViewBox_prototype_aspectRatio, ViewBox_prototype_clean, ViewBox_prototype_correct, ViewBox_prototype_getClientCoords, ViewBox_prototype_getSvgCoords, ViewBox_prototype_getViewBoxFromSvg, ViewBox_prototype_getZoom, ViewBox_prototype_pan, ViewBox_prototype_set, ViewBox_prototype_toString, ViewBox_prototype_zoom, utils_easing );

	var ViewBox = function( ViewBox ) {

		return ViewBox;
	}( ViewBox_ViewBox );




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
