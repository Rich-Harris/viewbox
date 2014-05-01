import clean from 'utils/clean';

export default function draggable ( viewBox ) {
	var svg,
		lastX,
		lastY;

	svg = viewBox.svg;

	function mousedownHandler ( event ) {
		// we don't care about right-clicks etc
		if ( event.which !== undefined && event.which !== 1 ) return;

		lastX = event.clientX;
		lastY = event.clientY;

		window.addEventListener( 'mousemove', mousemoveHandler, false );
		window.addEventListener( 'mouseup', mouseupHandler, false );
	}

	function mousemoveHandler ( event ) {
		viewBox.pan( ( event.clientX - lastX ), ( event.clientY - lastY ) );

		lastX = event.clientX;
		lastY = event.clientY;
	}

	function mouseupHandler ( event ) {
		window.removeEventListener( 'mousemove', mousemoveHandler, false );
		window.removeEventListener( 'mouseup', mouseupHandler, false );
	}

	svg.addEventListener( 'mousedown', mousedownHandler, false );
}
