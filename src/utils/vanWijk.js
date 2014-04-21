define([

], function (

) {

	'use strict';

	// http://www.win.tue.nl/~vanwijk/zoompan.pdf

	return function ( viewBox, c0, c1, w0, w1, V, rho ) {

		var interval, aspectRatio = viewBox.width/viewBox.height;

		// defaults, as per the original paper
		if (V === undefined) V = 0.9;
		if (rho === undefined) rho = 1.42;

		// simple interpolation of positions will be fine:
		var u0 = 0,
			u1 = dist(c0,c1);

		// i = 0 or 1
		function b(i) {
			var n = sq(w1) - sq(w0) + ((i ? -1 : 1) * Math.pow(rho,4) * sq(u1-u0));
			var d = 2 * (i ? w1 : w0) * sq(rho) * (u1-u0);
			return n / d;
		}

		// give this a b(0) or b(1)
		function r(b) {
			return Math.log(-b + Math.sqrt(sq(b)+1));
		}

		var r0 = r(b(0)),
			r1 = r(b(1)),
			S = (r1-r0) / rho; // "distance"

		function u(s) {
			var a = w0/sq(rho),
				b = a * cosh(r0) * tanh(rho*s + r0),
				c = a * sinh(r0);
			return b - c + u0;
		}

		function w(s) {
			return w0 * cosh(r0) / cosh(rho*s + r0);
		}

		// special case
		if (Math.abs(u0-u1) < 0.000001) {
			if (Math.abs(w0-w1) < 0.000001) return;

			var k = w1 < w0 ? -1 : 1;
			S = Math.abs(Math.log(w1/w0)) / rho;
			u = function(s) {
				return u0;
			}
			w = function(s) {
				return w0 * Math.exp(k * rho * s);
			}
		}

		var t0 = Date.now();
		interval = setInterval(function() {
			var t1 = Date.now();
			var t = (t1 - t0) / 1000.0;
			var s = V * t;
			if (s > S) {
				s = S;
				clearInterval(interval);
				interval = 0;
			}
			var us = u(s);
			var pos = lerp2(c0,c1,(us-u0)/(u1-u0));
			//applyPos(map, pos, w(s));

			var width = w(s);
			var height = (width/aspectRatio);

			viewBox.set({
				x: pos.x - width/2,
				y: pos.y - height/2,
				width: width,
				height: height
			});
		}, 40);
	};

	function sq(n) { return n*n; }
	function dist(a,b) { return Math.sqrt(sq(b.x-a.x)+sq(b.y-a.y)); }
	function lerp1(a,b,p) { return a + ((b-a) * p) }
	function lerp2(a,b,p) { return { x: lerp1(a.x,b.x,p), y: lerp1(a.y,b.y,p) }; }
	function cosh(x) { return (Math.exp(x) + Math.exp(-x)) / 2; }
	function sinh(x) { return (Math.exp(x) - Math.exp(-x)) / 2; }
	function tanh(x) { return sinh(x) / cosh(x); }

});
