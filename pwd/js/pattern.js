let grid = 3;
let posMap = {};
let size = 256;
let canvas, ctx;
let mx, my;
let changeHandler;
let mouseIsDown = false;
const currentPattern = [];
const color = {
	outerCircle: '#111',
	innerCircle: '#fff',
	path: '#fff'
}
let measures = {};
let consts = {
	margin: 0.0,
	radius: 0.8,
	innerRadius: 0.25,
	path: 0.6,
};
let calcs = {
	margin: () => size*consts.margin,
	inner: () => size - measures.margin*2,
	radius: () => measures.inner*consts.radius/grid/2,
	cell: () => {
		let space = measures.inner*(1 - consts.radius)/(grid - 1);
		return measures.radius*2 + space;
	},
	shift: () => measures.margin + measures.radius,
	innerRadius: () => measures.radius*consts.innerRadius,
	path: () => measures.innerRadius*consts.path,
};
const updateMeasures = () => {
	for (let attr in calcs) {
		measures[attr] = calcs[attr]();
	}
};
// direction from a to b
const calcDir = (ax, ay, bx, by) => {
	let dx = bx - ax;
	let dy = by - ay;
	let dist = Math.sqrt(dx*dx + dy*dy);
	return [dx/dist, dy/dist];
};
// distance from a to b
const calcDist = (ax, ay, bx, by) => {
	let dx = bx - ax;
	let dy = by - ay;
	return Math.sqrt(dx*dx + dy*dy);
};
export const render = () => {
	ctx.clearRect(0, 0, size, size);
	ctx.fillStyle = color.outerCircle;
	for (let i=grid; i--;) {
		let x = i*measures.cell + measures.shift;
		for (let j=grid; j--;) {
			let y = j*measures.cell + measures.shift;
			ctx.beginPath();
			ctx.arc(x, y, measures.radius, 0, Math.PI*2);
			ctx.fill();
		}
	}
	ctx.lineCap = ctx.lineJoin = 'round';
	ctx.lineWidth = measures.path;
	ctx.strokeStyle = color.path;
	ctx.beginPath();
	let lx, ly;
	currentPattern.forEach(([ix, iy], i) => {
		const x = lx = ix*measures.cell + measures.shift;
		const y = ly = iy*measures.cell + measures.shift;
		if (i) {
			ctx.lineTo(x, y);
		} else {
			ctx.moveTo(x, y);
		}
	});
	if (mouseIsDown && lx != null) {
		ctx.lineTo(mx, my);
	}
	ctx.stroke();
	ctx.fillStyle = color.innerCircle;
	for (let i=grid; i--;) {
		let x = i*measures.cell + measures.shift;
		for (let j=grid; j--;) {
			let y = j*measures.cell + measures.shift;
			ctx.beginPath();
			ctx.arc(x, y, measures.innerRadius, 0, Math.PI*2);
			ctx.fill();
		}
	}
};
const decompose = (x, y) => [x, y].map(val => (val - measures.shift)/measures.cell);
const pick = (x, y, checkRec = true) => {
	let key = `${x},${y}`;
	if (posMap[key]) return;
	if (currentPattern.length && checkRec) {
		let [ax, ay] = currentPattern[currentPattern.length - 1];
		let [bx, by] = [x, y];
		let x0 = Math.min(ax, bx);
		let y0 = Math.min(ay, by);
		let x1 = Math.max(ax, bx);
		let y1 = Math.max(ay, by);
		let dx = bx - ax;
		let dy = by - ay;
		let dir = Math.abs(dx/dy);
		for (let x=x0; x<=x1; ++x) {
			let dx = bx - x;
			for (let y=y0; y<=y1; ++y) {
				let dy = by - y;
				const temp = Math.abs(dx/dy);
				if (temp === dir || Math.abs(temp - dir) < 1e-15) {
					pick(x, y, false);
				}
			}
		}
	}
	currentPattern.push([x, y]);
	posMap[key] = true;
};
const checkPos = (x, y) => {
	let [ix, iy] = decompose(x, y).map(Math.round);
	let [tx, ty] = [ix, iy].map(val => val*measures.cell + measures.shift);
	let dx = tx - x;
	let dy = ty - y;
	const dist = Math.sqrt(dx*dx + dy*dy);
	if (dist <= measures.radius) {
		pick(ix, iy);
	}
	mx = x;
	my = y;
};
const handleChange = () => {
	if (!changeHandler) return;
	if (currentPattern.length < 2) {
		currentPattern.length = 0;
		posMap = {};
	}
	let str = currentPattern.map(([x, y]) => x + y*grid).join(',');
	render();
	changeHandler(str);
};
const handleMousedown = (x, y) => {
	currentPattern.length = 0;
	posMap = {};
	checkPos(x, y);
	mouseIsDown = true;
	render();
};
const handleMousemove = (x, y) => {
	checkPos(x, y);
	render();
};
const handleMouseup = (x, y) => {
	if (!mouseIsDown) return;
	mouseIsDown = false;
	mx = my = null;
	checkPos(x, y);
	render();
	handleChange();
};
export const setCanvas = arg => {
	canvas = arg;
	canvas.width = size;
	canvas.height = size;
	ctx = canvas.getContext('2d');
	updateMeasures();
	canvas.onmousedown = e => {
		if (e.button !== 0) return;
		let x = e.offsetX;
		let y = e.offsetY;
		handleMousedown(x, y);
	};
	canvas.onmousemove = e => {
		let x = e.offsetX;
		let y = e.offsetY;
		if (!(e.buttons & 1)) {
			if (mouseIsDown) {
				handleMouseup(x, y);
			}
			return;
		}
		if (!mouseIsDown) {
			handleMousedown(x, y);
			return;
		}
		handleMousemove(x, y);
	};
	canvas.onmouseup = e => {
		let x = e.offsetX;
		let y = e.offsetY;
		if (e.button === 0 && mouseIsDown) {
			handleMouseup(x, y);
		}
	};
	canvas.ontouchstart = e => {
		const {left, top} = canvas.getBoundingClientRect();
		e.preventDefault();
		[e] = e.changedTouches;
		let x = e.pageX - left;
		let y = e.pageY - top;
		handleMousedown(x, y);
	};
	canvas.ontouchmove = e => {
		const {left, top} = canvas.getBoundingClientRect();
		e.preventDefault();
		[e] = e.changedTouches;
		let x = e.pageX - left;
		let y = e.pageY - top;
		handleMousemove(x, y);
	};
	canvas.ontouchend = canvas.ontouchcancel = canvas.ontouchleave = e => {
		const {left, top} = canvas.getBoundingClientRect();
		e.preventDefault();
		[e] = e.changedTouches;
		let x = e.pageX - left;
		let y = e.pageY - top;
		handleMouseup(x, y);
	};
};
export const onChange = handler => {
	changeHandler = handler;
};
export const setGrid = val => {
	grid = val;
	let prev = currentPattern.length;
	currentPattern.length = 0;
	posMap = {};
	updateMeasures();
	prev > 1 && handleChange();
};
export const resize = newSize => {
	size = newSize;
	canvas.width = size;
	canvas.height = size;
	updateMeasures();
};