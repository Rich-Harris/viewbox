import clean from 'utils/clean';

export default function ViewBox$getClientCoords ( svgX, svgY ) {
	var ctm, ctm_a;

	if ( this._dirty ) clean( this );

	if ( typeof svgX === 'object' ) {
		svgY = svgX.y;
		svgX = svgX.x;
	}

	ctm = this._ctm;
	ctm_a = ctm.a;

	return {
		x: ( svgX * ctm_a ) + ctm.e,
		y: ( svgY * ctm_a ) + ctm.f
	};
};
