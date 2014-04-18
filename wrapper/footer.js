

// export as CommonJS...
if ( typeof module !== 'undefined' && module.exports ) {
	module.exports = ViewBox;
}

// ...or as AMD module
else if ( typeof define !== 'undefined' && define.amd ) {
	define( function () { return ViewBox; });
}

// ...or as browser global
else {
	global.ViewBox = ViewBox;
}

}( typeof window !== 'undefined' ? window : this ));
