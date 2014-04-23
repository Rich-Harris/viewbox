import rAF from 'utils/rAF';
import maximise from 'utils/maximise';
import constrain from 'utils/constrain';
import set from 'utils/set';

var Tween = function ( viewBox, target, options, easing ) {
	var animation = this, constrained, maximisedStart, maximisedEnd, fx, fy, fw, fh, dx, dy, dw, dh, startTime, duration, running, easing, loop;

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

	duration = ( options.duration !== undefined ? options.duration : 400 );

	loop = function () {
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
			x: fx + ( t * dx ),
			y: fy + ( t * dy ),
			width: fw + ( t * dw ),
			height: fh + ( t * dh )
		});

		if ( options.step ) {
			options.step.call( viewBox, t );
		}

		rAF( loop );
	};

	this.running = true;
	startTime = Date.now();

	loop();
};

Tween.prototype.stop = function () {
	this.running = false;
};

export default Tween;
