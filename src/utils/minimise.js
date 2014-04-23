export default function minimise ( x, y, width, height, originalAspectRatio ) {
	var minimised = {};

	if ( ( width / height ) > originalAspectRatio ) {
		// preserve height
		minimised.width = height * originalAspectRatio;
		minimised.height = height;

		minimised.x = x + ( width - minimised.width ) / 2;
		minimised.y = y;
	} else {
		// preserve width
		minimised.width = width;
		minimised.height = width / originalAspectRatio;

		minimised.x = x;
		minimised.y = y + ( height - minimised.height ) / 2;
	}

	return minimised;
};
