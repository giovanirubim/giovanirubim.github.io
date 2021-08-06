let width;
let height;
let canvas;
let ctx;

function resize() {
	const newWidth = window.innerWidth;
	const newHeight = window.innerHeight;
	if (newWidth === width && newHeight === height) {
		return;
	}
	width = canvas.width = newWidth;
	height = canvas.height = newHeight;
}

function init() {
	canvas = document.querySelector('canvas');
	ctx = canvas.getContext('2d');
	resize();
}

window.addEventListener('load', init);
window.addEventListener('resize', resize);
