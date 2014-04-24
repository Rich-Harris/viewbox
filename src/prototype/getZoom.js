import clean from 'utils/clean';

export default function ViewBox$getZoom () {
	if ( this._dirty ) clean( this );
	return Math.min( this._elWidth / this.width, this._elHeight / this.height );
};
