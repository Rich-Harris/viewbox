import clean from 'utils/clean';

export default function ViewBox$getZoom () {
	if ( this._dirty ) clean( this );
	return this._elWidth / this.width;
};
