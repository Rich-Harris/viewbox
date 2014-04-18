module.exports = function ( grunt ) {

	'use strict';

	grunt.registerTask( 'build', [
		'clean',
		'jshint',
		'requirejs',
		'concat:closure',
		'jsbeautifier'
	]);

};
