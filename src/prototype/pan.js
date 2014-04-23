import clean from 'utils/clean';
import extend from 'utils/extend';
import constrain from 'utils/constrain';

export default function ViewBox$pan ( dx, dy, animate ) {
	var zoom, newX, newY, constrained;

	if ( this._dirty ) clean( this );

	if ( typeof dx === 'object' ) {
		animate = dx.animate;
		dy = dx.dy;
		dx = dx.dx;
	}

	zoom = this.getZoom();

	newX = this.x -( dx / zoom );
	newY = this.y -( dy / zoom );

	constrained = constrain( newX, newY, this.width, this.height, this._elWidth, this._elHeight, this.constraints );

	if ( animate ) {
		this.animate( constrained, animate );
	} else {
		extend( this, constrained );
		this.svg.setAttribute( 'viewBox', this.toString() );
	}
};
