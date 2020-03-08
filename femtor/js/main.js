import * as view3d from './view3d.js';
import * as leftbar from './leftbar.js';
import animate from './animate.js';
import './view3d-controls.js';

let esx = null;
let esy = null;
const handleResize = () => {
	let sx = window.innerWidth - leftbar.getWidth();
	let sy = window.innerHeight;
	if (sx === esx && sy === esy) {
		esx = sx;
		esy = sy;
	}
	view3d.resize(sx, sy);
	view3d.render();
	return true;
};

$(document).ready(() => {
	view3d.addCylinder(1, 2, 50);
	view3d.addCylinder(1, 10, 4);
	leftbar.init();
	const canvas = $(view3d.getCanvas());
	$('#view3d').append(canvas);
	handleResize();
	$(window).bind('resize', handleResize);
});