module.exports = {
	main: {
		type: 'amd',
		files: [{
			expand: true,
			cwd: 'es6test/in/',
			src: ['**/*.js'],
			dest: 'es6test/out/'
		}]
	}
}
