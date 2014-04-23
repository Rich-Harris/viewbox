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
