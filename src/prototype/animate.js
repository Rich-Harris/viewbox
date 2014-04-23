import rAF from 'utils/rAF';
import clean from 'utils/clean';
import constrain from 'utils/constrain';
import maximise from 'utils/maximise';
import minimise from 'utils/minimise';
import easing from 'utils/easing';
import Tween from 'animation/Tween';
import VanWijk from 'animation/VanWijk';

var empty = {};

export default function ViewBox$animate ( x, y, width, height, options ) {
	var maximised, reshaped, constrained, easingFn;

	if ( this._dirty ) clean( this );

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

	constrained = constrain( x, y, width, height, this._elWidth, this._elHeight, this.constraints );

	easingFn = ( typeof options.easing === 'function' ? options.easing : easing[ options.easing ] ) || linear;

	if ( options.smooth ) {
		this.animation = new VanWijk( this, constrained, options, easingFn );
	} else {
		this.animation = new Tween( this, constrained, options, easingFn );
	}
};

function linear ( t ) {
	return t;
}
