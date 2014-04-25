var now;

if ( window.performance && typeof window.performance.now === 'function' ) {
	now = function () {
		return window.performance.now();
	};
} else {
	if ( typeof Date.now !== 'function' ) {
		Date.now = function () {
			return new Date.getTime();
		};
	}

	now = function () {
		return Date.now();
	};
}

export default now;
