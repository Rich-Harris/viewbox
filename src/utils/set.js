export default function set ( viewBox, box ) {
	viewBox.x = box.x;
	viewBox.y = box.y;
	viewBox.width = box.width;
	viewBox.height = box.height;

	viewBox.svg.setAttribute( 'viewBox', viewBox.toString() );

	viewBox._dirty = true;
};
