import * as cmdkey from './cmdkey.js';
import * as view3d from './view3d.js';
import animate from './animate.js';

const minDist = 5;
const animation = {
	home: null,
	perspective: null
};
const smooth = x => (1 - Math.cos(Math.PI*x))*0.5;

// Home animation (resets view to '2d')
const animateHome = () => {
	const o0 = view3d.getOrientation();
	const o1 = Math.round(o0/(Math.PI*0.5))*Math.PI*0.5;
	const r0 = view3d.getRotation();
	const r1 = Math.round(r0/Math.PI)*Math.PI;
	const s0 = view3d.getShift();
	const s1 = 0;
	const d0 = view3d.getDistance();
	const d1 = view3d.getInitialDistance();
	animation.home = animate(t => {
		const a = smooth(t);
		const b = 1 - a;
		view3d.setOrientation(o0*b + o1*a);
		view3d.setRotation(r0*b + r1*a);
		view3d.setShift(s0*b + s1*a);
		view3d.setDistance(d0*b + d1*a);
		view3d.render();
	});
};
const stopHomeAnimation = () => {
	const {home} = animation;
	if (!home || !home.running) return false;
	return home.stop();
};
const finishHomeAnimation = () => {
	const {home} = animation;
	if (!home || !home.running) return false;
	return home.finish();
};

// Perspective animation
const animatePerspective = p1 => {
	const p0 = view3d.getPerspective();
	animation.perspective = animate(b => {
		const a = 1 - b;
		view3d.setPerspective(a*p0 + b*p1);
		view3d.render();
	});
};
const stopPerspectiveAnimation = () => {
	const {perspective} = animation;
	if (!perspective || !perspective.running) return false;
	return perspective.stop();
};
const finishPerspectiveAnimation = () => {
	const {perspective} = animation;
	if (!perspective || !perspective.running) return false;
	return perspective.finish();
};

// Key bindings
cmdkey.bind({key: 'home'}, () => {
	if (finishHomeAnimation()) {
		finishPerspectiveAnimation();
		return;
	}
	animateHome();
	stopPerspectiveAnimation();
	animatePerspective(0);
});
cmdkey.bind({key: 'p'}, () => {
	if (finishPerspectiveAnimation()) {
		return;
	}
	animatePerspective(1 - view3d.getPerspective());
});

const bindMouseControls = () => {

	const canvas = $(view3d.getCanvas());
	let click = null;

	const calcDist = (ax, ay, bx, by) => {
		const dx = bx - ax;
		const dy = by - ay;
		return Math.sqrt(dx*dx + dy*dy);
	};

	canvas.bind('mousedown', e => {
		if (e.button !== 0) return;
		const x = e.offsetX;
		const y = e.offsetY;
		click = {
			x, y,
			moved: false,
			shift0: view3d.getShift(),
			rotation0: view3d.getRotation(),
			orientation0: view3d.getOrientation(),
			shift1: view3d.getShiftAt(x, y),
			rotation1: view3d.getRotationAt(x, y),
			orientation1: view3d.getOrientationAt(x, y),
			altKey: e.altKey,
			ctrlKey: e.ctrlKey,
			shiftKey: e.shiftKey,
		};
	});

	canvas.bind('mousemove', e => {
		if (click === null) return;
		if ((e.buttons & 1) === 0) {
			click = null;
			return;
		}
		const x = e.offsetX;
		const y = e.offsetY;
		let startedNow = false;
		if (click.moved === false) {
			const x0 = click.x;
			const y0 = click.y;
			if (calcDist(x0, y0, x, y) < minDist) return;
			click.moved = true;
			startedNow = true;
		}
		if (startedNow) {
			stopHomeAnimation();
		}
		if (click.shiftKey) {
			const {shift0, shift1} = click;
			const shift2 = view3d.getShiftAt(x, y);
			view3d.setShift(shift0 + shift2 - shift1);
			view3d.render();
		} else if (click.altKey) {
			const {orientation0, orientation1} = click;
			const orientation2 = view3d.getOrientationAt(x, y);
			view3d.setOrientation(orientation0 + orientation2 - orientation1);
			view3d.render();
		} else {
			const {rotation0, rotation1} = click;
			const rotation2 = view3d.getRotationAt(x, y);
			view3d.setRotation(rotation0 + rotation2 - rotation1);
			view3d.render();
		}
	});

	canvas[0].addEventListener('wheel', e => {
		const delta = e.deltaY/Math.abs(e.deltaY);
		const d0 = view3d.getDistance();
		const d1 = Math.exp(Math.log(d0) + delta*0.04);
		view3d.setDistance(d1);
		view3d.render();
	});

};

$(document).ready(bindMouseControls);