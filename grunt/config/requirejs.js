module.exports = {
	compile: {
		options: {
			baseUrl: 'amd/',
			name: 'ViewBox',
			out: 'tmp/viewbox.js',
			optimize: 'none',
			logLevel: 2,
			onBuildWrite: function( name, path, contents ) {
				var depMap = {};

				// get list of dependencies
				contents = contents.replace( /var (\S+) = (__dependency\d+__)\["default"\];/g, function ( match, $1, $2 ) {
					depMap[ $2 ] = $1;
					return '';
				})

				// rename them
				.replace( /__dependency\d+__/g, function ( match ) {
					return depMap[ match ];
				})

				// return default exports
				.replace( '__exports__["default"] =', 'return' )

				// remove __exports__
				.replace( /,?"exports"\]/, ']' )
				.replace( /,?\s*__exports__/, '' );

				return require( 'amdclean' ).clean({
					code: contents,
					prefixTransform: function ( name ) {
						if ( name === 'viewbox' ) {
							return 'ViewBox';
						}

						return name
							.replace( 'utils_', '' )
							.replace( 'animation_', '' )
							.replace( 'prototype_', 'ViewBox$' );
					}
				}) + '\n';
			}
		}
	}
}
