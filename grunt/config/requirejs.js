module.exports = {
	compile: {
		options: {
			baseUrl: 'src/',
			name: 'ViewBox',
			out: 'tmp/viewbox.js',
			optimize: 'none',
			logLevel: 2,
			onBuildWrite: function( name, path, contents ) {
				var moduleNames = {};

				return require( 'amdclean' ).clean({
					code: contents
				}) + '\n';
			}
		}
	}
}
