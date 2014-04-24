module.exports = function ( grunt ) {

	'use strict';

	grunt.registerTask( 'default', [
		'build',
		//'qunit',   GAH - phantomJS doesn't work with system.js
		'uglify',
		'copy:build'
	]);

};
