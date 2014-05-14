var percentage = /^(\d)+%$/;

export default function clean ( viewBox ) {
	var computedStyle, parentElement, parentComputedStyle, parentWidth, parentHeight;

	viewBox._elWidth = viewBox.svg.offsetWidth;
	viewBox._elHeight = viewBox.svg.offsetHeight;

	if ( viewBox._elWidth === undefined ) {
		// We must be in FireFox. Goddammit.
		computedStyle = getComputedStyle( viewBox.svg );

		if ( percentage.test( computedStyle.width ) || percentage.test( computedStyle.height ) ) {
			// We must be in an old version of FireFox. AARGH!
			parentElement = viewBox.svg.parentElement;
			parentComputedStyle = getComputedStyle( parentElement );

			parentWidth = stripPx( parentComputedStyle.width );
			parentHeight = stripPx( parentComputedStyle.height );

			// TODO 'auto' etc

			if ( percentage.test( computedStyle.width ) ) {
				viewBox._elWidth = +( computedStyle.width.replace( '%', '' ) ) * parentWidth / 100;
			}

			if ( percentage.test( computedStyle.height ) ) {
				viewBox._elHeight = +( computedStyle.height.replace( '%', '' ) ) * parentHeight / 100;
			}
		}

		else {
			viewBox._elWidth = stripPx( computedStyle.width );
			viewBox._elHeight = stripPx( computedStyle.height );
		}
	}

	viewBox._aspectRatio = viewBox._elWidth / viewBox._elHeight;
	viewBox._ctm = viewBox.svg.getScreenCTM();
	viewBox._dirty = false;
};

function stripPx ( length ) {
	return +( length.replace( 'px', '' ) );
}
