export default function ViewBox$on ( eventName, callback ) {
	var cancelled, callbacks = this._callbacks[ eventName ] || ( this._callbacks[ eventName ] = [] );

	if ( callbacks.indexOf( callback ) === -1 ) {
		callbacks.push( callback );
	}

	return {
		cancel: function () {
			if ( !cancelled ) {
				callbacks.splice( callbacks.indexOf( callback, 1 ) );
				cancelled = true;
			}
		}
	};
}
