export default (
	window.performance && typeof window.performance.now === 'function' ?
		function () {
			return window.performance.now();
		} :
		function () {
			return Date.now();
		}
);
