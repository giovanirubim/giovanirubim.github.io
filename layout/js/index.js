const words = await $.get('data/pt-en.json');
const nextWord = () => {
	const value = Math.random();
	let index = 0;
	for (;;) {
		if (index === words.length) {
			-- index;
			break;
		}
		if (value <= words[index][1]) {
			break;
		}
		++ index;
	}
	return words[index][0]
	.replace(/ç/g, '*')
	.normalize('NFD')
	.replace(/[^\x00-\x7f]/g, '')
	.replace(/\*/g, 'c');
};

let currentLayout;

const getMax = (arr) => arr.reduce((a, b) => Math.max(a, b));

const width = 800;
const height = 250;
const keySize = 40;
const keySpacing = 16;
const midSpace = 150;
const nRows = 3;
const nCols = 10;
const spaceCol = nCols >> 1;
const stride = keySize + keySpacing;
const rowValues = [ 4, 15, 3 ];
const colValues = [ 3, 3, 4, 5, 0.5, 0.5, 5, 4, 3, 3 ];
const keyboardWidth = keySize*nCols + keySpacing*(nCols - 2) + midSpace;
const keyboardHeight = keySize*nRows + keySpacing*(nRows - 1);
const x0 = (width - keyboardWidth)/2;
const y0 = (height - keyboardHeight)/2;

let maxValue;

const mergeValues = (a, b) => a*b;
maxValue = mergeValues(getMax(rowValues), getMax(colValues));

const calcValue = (index) => {
	const i = index/nCols|0
	const j = index%nCols;
	const row = rowValues[i];
	const col = colValues[j];
	const value = mergeValues(col, row);
	return value/maxValue;
};

const indexes = new Array(nRows*nCols).fill(0).map((_,i) => i);
const keys = [];
const map = {
	temperature: indexes.map((i) => 0),
	toIndex: {},
	toValue: indexes.map(calcValue)
};

const updateTemperature = () => {
	const max = keys.reduce((max, key) => Math.max(max, key.count), 0);
	map.temperature = keys.map((key) => key.count/max);
};

let lastCol = null;
let lastHand = null;
let sumPoints = 0;
let totalPoints = 0;

class Key {
	constructor(char, index) {
		this.char = char;
		this.index = index;
		this.col = index%nCols;
		this.row = index/nCols|0;
		this.pressed = false;
		this.count = 0;
		this.hand = this.col >= spaceCol? 'R': 'L';
		this.value = map.toValue[this.index];
	}
	press() {
		this.pressed = true;
		this.count ++;
	}
	release() {
		this.pressed = false;
	}
}

const getKey = (char) => {
	return keys[map.toIndex[char.toUpperCase()]]
};

const setLayout = (layout) => {
	resetEvaluation();
	layout = layout.toUpperCase();
	currentLayout = layout;
	const items = currentLayout.split('').map((char, index) => new Key(char, index));
	items.forEach((item) => {
		const key = keys[map.toIndex[item.char]];
		if (key) {
			item.count = key.count;
			item.pressed = key.pressed;
		}
	});
	map.toIndex = Object.fromEntries(indexes.map((i) => [currentLayout[i], i]));
	keys.length = 0;
	keys.push(...items);
};

const drawKey = ({ char, row, col, pressed }) => {
	const index = row*nCols + col;
	let y = y0 + row*stride;
	let x = x0 + col*stride;
	if (col >= spaceCol) {
		x += midSpace - keySpacing;
	}
	const temperature = map.temperature[index];
	ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
	ctx.fillStyle = `rgba(255, 64, 0, ${temperature})`;
	// if (pressed) {
	// 	ctx.fillStyle = 'rgba(0, 255, 192, 0.75)';
	// }
	ctx.beginPath();
	ctx.rect(x, y, keySize, keySize);
	ctx.fill();
	ctx.stroke();
	const cx = x + keySize/2;
	const cy = y + keySize/2;
	ctx.fillStyle = '#fff';
	ctx.fillText(char, cx, cy);
};

const calcPoints = () => totalPoints ? (sumPoints/totalPoints) : 0;

const drawKeyboard = () => {
	ctx.clearRect(0, 0, width, height);
	ctx.fillStyle = 'rgba(0, 128, 255, 0.1)';
	ctx.fillRect(x0, y0, keyboardWidth, keyboardHeight);
	ctx.font = keySize/2 + 'px monospace';
	keys.forEach(drawKey);
	const cx = x0 + keyboardWidth/2;
	const cy = y0 + keyboardHeight/2;
	ctx.fillStyle = '#fff';
	ctx.font = midSpace*0.3 + 'px monospace';
	let points = calcPoints();
	points = Math.max(points, 0).toFixed(1);
	ctx.fillText(points, cx, cy);
	// ctx.font = keySize*0.5 + 'px monospace';
	// ctx.fillText(queue, cx, y0 + keyboardHeight + keySize);
};

let canvas, ctx;
const initCanvas = () => {
	canvas = document.querySelector('canvas');
	canvas.width = width;
	canvas.height = height;
	ctx = canvas.getContext('2d');
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.lineWidth = 4;
	ctx.lineJoin = 'round';
};

let queue = ' '.repeat(40);
let buffer = '';
let pressed = null;
const resetEvaluation = () => {
	sumPoints = 0;
	totalPoints = 0;
	lastCol = null;
	lastHand = null;
};

const iteration = () => {
	if (buffer === '') {
		buffer = ' ' + nextWord();
	}
	const char = buffer[0];
	buffer = buffer.substr(1);
	if (pressed !== null) {
		pressed.release();
		pressed = null;
	}
	queue = window.queue = queue.substr(1) + char;
	const key = getKey(char);
	if (key) {
		key.press();
		pressed = key;
		let value = key.value*7;
		let str = [value]
		if (key.col !== lastCol) {
			value += 2.5;
		}
		if (key.hand !== lastHand) {
			value += 0.5;
		}
		totalPoints ++;
		sumPoints += value;
		lastCol = key.col;
		lastHand = key.hand;
	} else {
		lastCol = null;
		lastHand = null;
	}
};

const qwerty = window.qwerty = 'QWERTYUIOPASDFGHJKLÇZXCVBNM---';
const colemak = window.colemak = 'QWFPGJLUY-ARSTDHNEIOZXCVBKMÇ--';
setLayout(qwerty);
initCanvas();
drawKeyboard();

let iterationCountdown = 0;
let doNext = null;
const iterationBatch = 1;

const frame = () => {
	updateTemperature();
	drawKeyboard();
	requestAnimationFrame(frame);
};

setInterval(() => {
	for (let i=0; i<iterationBatch; ++i) {
		iteration();
		if (--iterationCountdown === 0 && doNext !== null) {
			const fn = doNext;
			doNext = null;
			fn();
		}
	}
}, 0);

frame();

const evalLayout = (layout, amount, callback) => {
	setLayout(layout);
	iterationCountdown = amount;
	if (callback) {
		doNext = () => {
			callback(calcPoints());
		};
		return;
	}
	return new Promise((done) => {
		doNext = () => {
			done(calcPoints());
		};
	});
};

const log = (data) => {
	console.log(JSON.stringify(data, null, '  '));
};

window.test1 = async () => {
	const a = queue;
	const val = await evalLayout(qwerty, 1);
	const b = queue;
	log({
		a,
		b,
		val,
		current: calcPoints(),
	});
};

window.test2 = () => {
	const a = queue;
	evalLayout(qwerty, 1, (val) => {
		const b = queue;
		log({
			a,
			b,
			val,
			current: calcPoints(),
		});
	});
};

const iterate = (amount, callback) => {
	resetEvaluation();
	iterationCountdown = amount;
	doNext = callback;
};

window.iterate = iterate;

window.swap = (pair) => {
	let [a, b] = pair.split('');
	a = getKey(a).index;
	b = getKey(b).index;
	let layout = currentLayout.split('');
	const aux = layout[a];
	layout[a] = layout[b];
	layout[b] = aux;
	layout = layout.join('');
	setLayout(layout);
};

window.shuffle = () => {
	let layout = currentLayout.split('');
	for (let i=layout.length; i;) {
		const j = Math.random()*(i--)|0;
		const aux = layout[i];
		layout[i] = layout[j];
		layout[j] = aux;
	}
	layout = layout.join('');
	layout = layout.replace(/[ZXCV]/g, '');
	layout = layout.replace(/^(.{20})(.*)$/, '$1ZXCV$2');
	setLayout(layout);
};

window.setLayout = setLayout;
window.getKey = getKey;
window.evalLayout = evalLayout;
