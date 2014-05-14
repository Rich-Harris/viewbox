export default function ViewBox$observe ( callback, options ) {
	var observers = this._observers;

	observers.push( callback );

	if ( !options || options.init !== false ) {
		callback( this );
	}

	return {
		cancel: function () {
			if ( !cancelled ) {
				observers.splice( observers.indexOf( callback ), 1 );
				cancelled = true;
			}
		}
	}
}
