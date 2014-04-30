export default function clean ( viewBox ) {
	var computedStyle;

	viewBox._elWidth = viewBox.svg.offsetWidth;
	viewBox._elHeight = viewBox.svg.offsetHeight;

	if ( viewBox._elWidth === undefined ) {
		// We must be in FireFox. Goddammit.
		computedStyle = getComputedStyle( viewBox.svg );
		viewBox._elWidth = stripPx( computedStyle.width );
		viewBox._elHeight = stripPx( computedStyle.height );
	}

	viewBox._aspectRatio = viewBox._elWidth / viewBox._elHeight;
	viewBox._ctm = viewBox.svg.getScreenCTM();
	viewBox._dirty = false;
};

function stripPx ( length ) {
	return +( length.replace( 'px', '' ) );
}
