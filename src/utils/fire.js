export default function fire ( viewBox, eventName ) {
	var callbacks = viewBox._callbacks[ eventName ], args;

	if ( !callbacks ) {
		return;
	}

	args = Array.prototype.slice.call( arguments, 2 );

	callbacks.slice().forEach( function ( cb ) {
		try {
			cb.apply( viewBox, args );
		} catch ( err ) {
			console.error( err.message || err );
		}
	});
}
