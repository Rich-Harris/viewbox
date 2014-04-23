module.exports = function ( grunt ) {

	'use strict';

	grunt.registerTask( 'build', [
		'clean',
		'jshint',
		'transpile',
		'requirejs',
		'concat:closure',
		'jsbeautifier',
		'copy:build',
		'clean:amd'
	]);

};
