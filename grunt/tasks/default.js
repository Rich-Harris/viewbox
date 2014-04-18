module.exports = function ( grunt ) {

	'use strict';

	grunt.registerTask( 'default', [
		'build',
		'qunit',
		'uglify',
		'copy:build'
	]);

};
