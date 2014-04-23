export default function extend ( obj1, obj2 ) {
	var key;

	if ( !obj2 ) {
		return;
	}

	for ( key in obj2 ) {
		if ( obj2.hasOwnProperty( key ) ) {
			obj1[ key ] = obj2[ key ];
		}
	}
};
