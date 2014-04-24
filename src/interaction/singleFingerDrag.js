import clean from 'utils/clean';
import now from 'utils/now';
import rAF from 'utils/rAF';

export default function draggable ( viewBox ) {
	var svg,
		dragging,
		lastX,
		lastY,
		zoom,
		activeFingers = [],
		fingerById = {};

	svg = viewBox.svg;

	function touchstartHandler ( event ) {
		var touch, finger, i, time;

		time = now();

		i = event.changedTouches.length;
		while ( i-- ) {
			touch = event.changedTouches[i];
			finger = {
				x: touch.clientX,
				y: touch.clientY,
				t: time,
				id: touch.identifier
			};

			activeFingers.push( finger );
			fingerById[ touch.identifier ] = finger;
		}

		if ( !dragging ) {
			activeFingers[0].isPrimary = true;

			window.addEventListener( 'touchmove', touchmoveHandler, false );
			window.addEventListener( 'touchend', touchendHandler, false );
			window.addEventListener( 'touchcancel', touchendHandler, false );

			dragging = true;
		}
	}

	function touchmoveHandler ( event ) {
		var touch, finger, moved, i, time, elapsed;

		time = now();

		i = event.changedTouches.length;
		while ( i-- ) {
			touch = event.changedTouches[i];
			finger = fingerById[ touch.identifier ];

			if ( !finger ) {
				continue; // maybe from outside the SVG
			}

			moved = true;

			if ( finger.isPrimary ) {
				viewBox.pan( touch.clientX - finger.x, touch.clientY - finger.y );
			}

			// keep track of velocity
			elapsed = ( time - finger.t );

			finger.vx = ( touch.clientX - finger.x ) / elapsed;
			finger.vy = ( touch.clientY - finger.y ) / elapsed;
			finger.t = time;

			finger.x = touch.clientX;
			finger.y = touch.clientY;
		}

		if ( moved ) event.preventDefault();
	}

	function touchendHandler ( event ) {
		var touch, finger, ended, i, newPrimaryNeeded;

		if ( !event.touches.length ) {
			// no longer dragging
			dragging = false;
			endTouchDrag();
		}

		i = event.changedTouches.length;
		while ( i-- ) {
			touch = event.changedTouches[i];
			finger = fingerById[ touch.identifier ];

			if ( !finger ) {
				continue; // maybe from outside the SVG
			}

			ended = true;

			activeFingers.splice( activeFingers.indexOf( finger ), 1 );
			fingerById[ touch.identifier ] = null;

			if ( finger.isPrimary ) {
				if ( dragging ) {
					newPrimaryNeeded = true;
				} else if ( viewBox.inertia ) {
					console.log( 'tracking velocity %s,%s', finger.vx, finger.vy );

					viewBox._velocity = {
						t: now(),
						x: finger.vx,
						y: finger.vy
					};

					rAF( viewBox._applyInertia );
				}
			}
		}

		if ( newPrimaryNeeded ) {
			activeFingers[0].isPrimary = true;
		}

		if ( ended ) event.preventDefault();
	}

	function endTouchDrag () {
		window.removeEventListener( 'touchmove', touchmoveHandler, false );
		window.removeEventListener( 'touchend', touchendHandler, false );
		window.removeEventListener( 'touchcancel', touchendHandler, false );
	}

	svg.addEventListener( 'touchstart', touchstartHandler, false );
}
