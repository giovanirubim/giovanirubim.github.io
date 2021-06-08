const width = 800;
const height = 250;
const keySize = 40;
const keySpacing = 16;
const midSpace = 150;
const nRows = 3;
const nCols = 10;
const nKeys = nRows*nCols;
const spaceCol = nCols >> 1;
const stride = keySize + keySpacing;
const keyboardClosedWidth = stride*nCols - keySpacing;
const keyboardWidth = keySize*nCols + keySpacing*(nCols - 2) + midSpace;
const keyboardHeight = keySize*nRows + keySpacing*(nRows - 1);
const x0 = (width - keyboardWidth)/2;
const y0 = (height - keyboardHeight)/2;
const cx = x0 + keyboardWidth/2;
const cy = y0 + keyboardHeight/2;

let canvas, ctx;
let currentKeys = [];

export const setCanvas = (canvas) => {
	canvas.width = width;
	canvas.height = height;
	ctx = canvas.getContext('2d');
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.lineJoin = 'round';
};

const initT = new Date()*1;
const midPosition = spaceCol - 0.5;
const calcMidDist = (col) => Math.abs(col - midPosition);
const maxMidDist = Math.max(calcMidDist(0), calcMidDist(nCols - 1));
const normalize = (value) => value ? value/Math.abs(value) : 0;
const getTimeValue = (delta, start, duration, y0 = 0, y1 = 1, fn) => {
	let x = (delta - start)/duration;
	x = Math.min(Math.max(0, x), 1);
	return (fn?.(x) ?? x)*(y1 - y0) + y0;
};
const fn = {
	squared: (x) => x*x,
	endSin: (x) => Math.sin(x*Math.PI/2),
	endSin2: (x) => fn.endSin(fn.endSin(x)),
	sine: (x) => Math.cos((x + 1)*Math.PI)/2 + 0.5,
};
const mul = 0;
const keyAnimation = ({ col, row }) => {
	const delta = new Date() - initT;
	const dir = normalize(col - midPosition);
	const midProximity = 1 - calcMidDist(col)/maxMidDist;
	const delay = midProximity*500*mul;
	let y = y0 + row*stride;
	let x = x0 + col*stride;
	if (col >= spaceCol) {
		x += midSpace - keySpacing;
	}
	x = getTimeValue(delta, delay, 650*mul, x - 150*dir, x, fn.endSin2);
	const borderOpacity = getTimeValue(delta, delay + 200*mul, 500*mul);
	const colorOpacity = getTimeValue(delta, 1000*mul, 1750*mul, 0, 1, fn.sine);
	return {
		x, y,
		borderOpacity,
		colorOpacity,
	};
};

const drawKey = (key) => {
	ctx.lineWidth = 1;
	const { char, pressed, value, highlight } = key;
	const {
		x, y,
		borderOpacity,
		colorOpacity,
	} = keyAnimation(key);
	ctx.strokeStyle = `rgba(255, 255, 255, ${0.25*borderOpacity})`;
	if (pressed) {
		ctx.fillStyle = `rgba(0, 255, 192, ${0.75*colorOpacity})`;
	} else {
		ctx.fillStyle = `rgba(255, 64, 0, ${value*colorOpacity})`;
	}
	ctx.beginPath();
	ctx.rect(x, y, keySize, keySize);
	ctx.fill();
	ctx.stroke();
	if (!'#$%'.includes(char)) {
		ctx.fillStyle = `rgba(255, 255, 255, ${1*borderOpacity})`;
	} else {
		ctx.fillStyle = `rgba(255, 255, 255, ${0.2*borderOpacity})`;
	}
	const cx = x + keySize/2;
	const cy = y + keySize/2;
	ctx.fillText(char, cx, cy);
	if (key.highlight !== 0) {
		const shift = 0;
		const size = keySize + shift*2;
		ctx.beginPath();
		ctx.lineWidth = 4;
		ctx.rect(x - shift, y - shift, size, size);
		ctx.strokeStyle = `rgba(0, 192, 255, ${key.highlight})`;
		ctx.stroke();
	}
};

const drawKeyboard = (keys) => {
	currentKeys = keys;
	ctx.clearRect(0, 0, width, height);
	ctx.fillStyle = 'rgba(0, 128, 255, 0.1)';
	ctx.fillRect(x0, y0, keyboardWidth, keyboardHeight);
	ctx.font = keySize*0.3 + 'px monospace';
	keys.forEach(drawKey);
};

let frameRequest = null;

const frame = () => {
	drawKeyboard(currentKeys);
	frameRequest = requestAnimationFrame(frame);
};

export const stopRender = () => {
	if (frameRequest !== null) {
		cancelAnimationFrame(frameRequest);
		frameRequest = null;
	}
};

export const startRender = (keys) => {
	if (keys) {
		currentKeys = keys;
	}
	if (frameRequest === null) {
		frameRequest = requestAnimationFrame(frame);
	}
};

export const draw = drawKeyboard;
