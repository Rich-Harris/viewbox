import clean from 'utils/clean';
import extend from 'utils/extend';
import constrain from 'utils/constrain';
import maximise from 'utils/maximise';
import set from 'utils/set';

export default function ViewBox$set ( x, y, width, height, constraints ) {
	var constrained;

	if ( this._dirty ) clean( this );

	if ( typeof x === 'object' ) {
		constraints = y;

		height = x.height;
		width = x.width;
		y = x.y;
		x = x.x;
	}

	extend( this.constraints, constraints );

	constrained = constrain( x, y, width, height, this._elWidth, this._elHeight, this.constraints );
	console.log( 'constrained', constrained );

	set( this, constrained );
};
