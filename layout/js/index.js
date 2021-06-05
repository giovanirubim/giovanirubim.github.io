const words = await $.get('data/en.json');
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

const getMax = (array) => array.reduce((a, b) => Math.max(a, b));
const shuffle = (array) => {
	for (let i=array.length; i;) {
		const j = Math.random()*(i--)|0;
		const aux = array[i];
		array[i] = array[j];
		array[j] = aux;
	}
};

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

const indexes = new Array(nKeys).fill(0).map((_,i) => i);
const keys = [];
const map = window.map = {
	temperature: indexes.map(calcValue),
	toIndex: {},
	toValue: indexes.map(calcValue)
};

const updateTemperature = () => {
	const max = keys.reduce((max, key) => Math.max(max, key.count), 0);
	if (max === 0) {
		return;
	}
	map.temperature = keys.map((key) => key.count/max);
};

let lastCol = null;
let lastHand = null;
let sumPoints = 0;
let colSwaps = 0;
let handSwaps = 0;
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
	if (!'#$%'.includes(char)) {
		ctx.fillStyle = '#fff';
	} else {
		ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
	}
	const cx = x + keySize/2;
	const cy = y + keySize/2;
	ctx.fillText(char, cx, cy);
};

const calcPoints = () => totalPoints ? (sumPoints/totalPoints) : 0;

const drawKeyboard = () => {
	ctx.clearRect(0, 0, width, height);
	ctx.fillStyle = 'rgba(0, 128, 255, 0.1)';
	ctx.fillRect(x0, y0, keyboardWidth, keyboardHeight);
	ctx.font = keySize/3 + 'px monospace';
	// ctx.font = keySize/2 + 'px monospace';
	keys.forEach(drawKey);
	const cx = x0 + keyboardWidth/2;
	const cy = y0 + keyboardHeight/2;
	ctx.fillStyle = '#fff';
	ctx.font = midSpace*0.2 + 'px monospace';
	let points = calcPoints();
	points = Math.round(Math.max(points, 0)*1000);
	ctx.fillText(points, cx, cy);
	ctx.font = keySize*0.5 + 'px monospace';
	ctx.fillText(iterationCounter, cx, y0 + keyboardHeight + keySize);
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
	iterationCounter = 0;
	sumPoints = 0;
	totalPoints = 0;
	handSwaps = 0;
	colSwaps = 0;
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
		colSwaps += key.col !== lastCol;
		handSwaps += key.hand !== lastHand;
		sumPoints += key.value;
		totalPoints += 1;
		lastCol = key.col;
		lastHand = key.hand;
	} else {
		lastCol = null;
		lastHand = null;
	}
};

let iterationCounter = 0;
const iterationBatch = 101;
const interval = 0;

const qwerty = window.qwerty = 'QWERTYUIOPASDFGHJKLÇZXCVBNM#$%';
const custom = window.custom = 'MFDW#ÇYQLUNSTAKJEOIRZXCV$%BHGP';
const colemak = window.colemak = 'QWFPGJLUY#ARSTDHNEIOZXCVBKMÇ$%';
const mergeLayouts = (a, b) => {
	const maps = [a, b].map((layout) => {
		const map = {};
		for (let i=0; i<nKeys; ++i) {
			const key = layout[i];
			map[key] = i;
			map[i] = key;
		}
		return map;
	});
	const layout = new Array(nKeys).fill(null);
	const contains = {};
	for (let i=0; i<nKeys; ++i) {
		if (a[i] === b[i]) {
			const char = a[i];
			layout[i] = char;
			contains[char] = true;
		}
	}
};

setLayout(qwerty);
initCanvas();
drawKeyboard();

const frame = () => {
	updateTemperature();
	drawKeyboard();
	requestAnimationFrame(frame);
};

setInterval(() => {
	for (let i=0; i<iterationBatch; ++i) {
		iteration();
		++ iterationCounter;
	}
}, interval);

frame();

const log = (data) => {
	console.log(JSON.stringify(data, null, '  '));
};

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

window.setLayout = (layout) => {
	setLayout(layout);
	drawKeyboard();
};
window.getKey = getKey;
