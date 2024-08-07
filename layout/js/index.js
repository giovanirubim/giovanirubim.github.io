import * as Keyboard from './keyboard.js';
import * as Data from './data.js';
import Chars from './chars.js';

const getMax = (array) => array.reduce((a, b) => Math.max(a, b));

const layouts = {
	asset: 'qwjfgypulçasetdhniorzxcvbkm,.;',
	colemak: 'qwfpgjluyçarstdhneiozxcvbkm,.;',
	'custom-1': 'mfdw;çybulnstakjeoirzxcv,.qhpg',
	'custom-2': 'çpduxvyqglintahceosr.bm;zj,kfw',
	'custom-3': 'wpyo;,dulcrniegvtahsqbjçzxk.mf',
	qwerty: 'qwertyuiopasdfghjklçzxcvbnm,.;',
	workman: 'dqrwbjfupçashtgyneoizxmcvkl,.;',
	dvorak: 'ç,.pyfgcrlaoeuidhtns;qjkxbmwvz',
};

const keyArray = window.keyArray = [];
const keyMap = {};
const nRows = 3;
const nCols = 10;
const spaceCol = (nCols >> 1);
const numberOfKeys = nRows*nCols;
const rowValues = [ 4, 15, 3 ];
const colValues = [ 6, 6, 9, 9.5, 0, 0, 9.5, 9, 6, 6 ];
const maxValue = getMax(rowValues)*getMax(colValues);
const values = rowValues
	.map((rowValue) => colValues
		.map((colValue) => rowValue*colValue)
	)
	.flat()
	.map((value) => value / maxValue);

let lastImprovement = new Date();
const maxTime = 5000;
const tryToImprove = () => {
	const currentFitness = calcFitness();
	const chars = keyArray.map((key) => key.char);
	const currentLayout = chars.join('');
	let swaps = Math.random()*2 + 1 | 0;
	while (swaps--) {
		let i = Math.random()*numberOfKeys | 0;
		let j = Math.random()*numberOfKeys | 0;
		const aux = chars[i];
		chars[i] = chars[j];
		chars[j] = aux;
	}
	const newLayout = chars.join('');
	setLayout(newLayout);
	const newFitness = calcFitness();
	if (newFitness <= currentFitness) {
		setLayout(currentLayout);
		if (new Date() - lastImprovement >= maxTime) {
			store()
			shuffle();
		}
	} else {
		console.clear()
		console.log(newFitness.toPrecision(4)*1);
		lastImprovement = new Date();
		showKeyboardInfo();
	}
};

const gen = 250;
window.train = () => {
	setInterval(() => {
		for (let i=gen; i--;) {
			tryToImprove();
		}
	}, 0);
};

const setLayout = (layout) => {
	const toIndex = {};
	for (let i=0; i<numberOfKeys; ++i) {
		toIndex[layout[i]] = i;
	}
	keyArray.forEach((key) => key.setPosition(toIndex[key.char]));
	keyArray.sort((a, b) => a.position - b.position);
};

const isLetterRegex = /^[a-zç]$/i;
class Key {
	constructor(char, position) {
		this.char = char;
		this.upcase = char.toUpperCase();
		this.setPosition(position);
		this.pressed = false;
		this.pressCount = 0;
		this.highlight = 0;
		this.renderData = {
			x: null,
			y: null,
			width: null,
			height: null,
		};
		this.isLetter = isLetterRegex.test(char);
	}
	setPosition(position) {
		this.position = position;
		this.col = position%nCols;
		this.row = position/nCols|0;
		this.hand = this.col >= spaceCol? 'R': 'L';
	}
	press() {
		this.pressed = true;
		this.pressCount ++;
	}
	release() {
		this.pressed = false;
	}
	get value() {
		return values[this.position];
	}
	get temperature() {
		return Data.getTemperature(this.char);
	}
	get frequency() {
		return Data.getFrequency(this.char);
	}
}

const initKeys = () => {
	for (let i=0; i<numberOfKeys; ++i) {
		keyArray.push(new Key(Chars.low.all[i], i));
	}
	keyArray.forEach((key) => {
		keyMap[key.char] = key;
	});
};

const calcColumnRepetition = () => {
	let sum = 0;
	const array = Chars.low.letters;
	for (let key of array) {
		const keyCol = keyMap[key].col;
		const keyFrequency = Data.getFrequency(key);
		for (let next of array) {
			const nextCol = keyMap[next].col;
			if (nextCol !== keyCol) {
				continue;
			}
			const nextFrequency = Data.getNextFrequency(key, next);
			sum += keyFrequency * nextFrequency;
		}
	}
	return (sum*100).toPrecision(2)*1;
};

const calcHeatmapValue = () => {
	let sum = 0;
	keyArray.forEach((key) => sum += key.frequency*key.value);
	return (sum*100).toPrecision(3)*1;
};

const calcHandBalance = () => {
	let sum = 0;
	keyArray.forEach((key) => sum += key.frequency*(key.hand === 'R'));
	const unbalance = Math.abs(sum - 0.5)*2;
	const balance = ((1 - unbalance)*100).toPrecision(3)*1;
	if (balance === 100) {
		return '100%';
	}
	return `${balance}% (${sum > 0.5? 'right': 'left'})`;
};

const parseHandBalance = (balance) => {
	return Number(balance.split('%')[0])/100;
};

const calcLangFitness = (lang) => {
	const mode = Data.getMode();
	Data.setMode(lang);
	const heatmap = calcHeatmapValue();
	const balance = parseHandBalance(calcHandBalance());
	const colRep = calcColumnRepetition();
	Data.setMode(mode);
	return heatmap*1.5 - colRep*3 + Math.pow(balance, 4)*5;
};

const calcFitness = () => {
	const pt = calcLangFitness('pt');
	const en = calcLangFitness('en');
	return Math.min(pt, en);
};

const showKeyboardInfo = () => {
	$('#info').html(`
		Heatmap value: ${ calcHeatmapValue() }<br>
		Column repetition: ${ calcColumnRepetition() }<br>
		Hand balance: ${ calcHandBalance() }<br>
	`);
};

const showKeyInfo = (key) => {
	$('#info').html(`
		Letter temperature: ${ key.temperature.toPrecision(2)*1 }<br>
		Position value: ${ key.value.toPrecision(2)*1 }<br>
	`);
};

window.shuffle = () => {
	const layout = keyArray.map((key) => key.char);
	for (let i=layout.length; i;) {
		const j = Math.random()*(i--) | 0;
		const aux = layout[i];
		layout[i] = layout[j];
		layout[j] = aux;
	}
	setLayout(layout.join(''));
	showKeyboardInfo();
};

window.store = () => {
	const fitness = calcFitness();
	const json = window.localStorage.getItem('stored') ?? '[]';
	const array = JSON.parse(json);
	const layout = keyArray.map((key) => key.char).join('');
	const item = { layout, fitness };
	array.push(item);
	array.sort((a, b) => b.fitness - a.fitness);
	window.localStorage.setItem('stored', JSON.stringify(array.slice(0, 20)));
};

let currentText = '';
const maxWidth = 47;
const updateText = () => {
	currentText = currentText
		.replace(/\x20+/g, '_')
		.replace(/^_+/, '')
		.replace(/__+/g, '_');
	let words = currentText.match(/[a-zç]+|_/g);
	if (!words) {
		$('#textbox').html('');
		return;
	}
	let html = words[0];
	let line = html.length;
	for (let i=1; i<words.length; ++i) {
		const word = words[i];
		if (line + word.length <= maxWidth) {
			html += word;
			line += word.length;
		} else {
			html += '<br>' + word;
			line = word.length;
		}
	}
	$('#textbox').html(html);
};

const getPressedKey = (pressed) => {
	if (pressed.length !== 1) {
		return { key: null, input: null };
	}
	const lower = pressed.toLowerCase();
	const index = layouts.qwerty.indexOf(lower);
	if (index === -1) {
		return { key: null, input: null };
	}
	const key = keyArray[index];
	return {
		key,
		input: pressed === lower? key.char: key.upcase
	};
};

const init = async () => {
	await Data.load();
	Data.setMode($('#panel [name="lang"].selected').attr('value'));
	initKeys();
	const selectedLayout = $('#panel [name="layout"].selected').attr('value')
	setLayout(layouts[selectedLayout]);
	const canvas = document.querySelector('canvas');
	Keyboard.setCanvas(canvas);
	Keyboard.startRender(keyArray);
	let lastKeyHover = null;
	$(canvas).on('mousemove', (e) => {
		const x = e.offsetX;
		const y = e.offsetY;
		let key = keyArray.find(({ renderData }) => {
			if (renderData.x > x) {
				return false;
			}
			if (renderData.y > y) {
				return false;
			}
			if (x >= renderData.x + renderData.width) {
				return false;
			}
			if (y >= renderData.y + renderData.height) {
				return false;
			}
			return true;
		});
		if (!key || key && !key.isLetter) {
			key = null;
		}
		if (key === lastKeyHover) {
			return;
		}
		lastKeyHover = key;
		keyArray.forEach((key) => key.highlight = 0);
		if (key == null || !key.isLetter) {
			showKeyboardInfo();
			return;
		}
		const { char } = key;
		keyArray.forEach((key) => {
			if (char === key.char) {
				return;
			}
			key.highlight = Math.pow(Data.getNearValue(char, key.char), 0.5);
		});
		showKeyInfo(key);
	});
	showKeyboardInfo();
	$('#panel').on('click', '[name="lang"]', function() {
		const button = $(this);
		const lang = button.attr('value');
		$('#panel [name="lang"].selected').removeClass('selected');
		button.addClass('selected');
		Data.setMode(lang);
		showKeyboardInfo();
	});
	$('#panel').on('click', '[name="layout"]', function() {
		const button = $(this);
		const layout = button.attr('value');
		$('#panel [name="layout"].selected').removeClass('selected');
		button.addClass('selected');
		setLayout(layouts[layout]);
		showKeyboardInfo();
	});
	window.onkeydown = (e) => {
		const { key } = getPressedKey(e.key);
		if (key) {
			key.pressed = true;
		}
		if (e.key.toLowerCase() === 'backspace') {
			if (e.ctrlKey) {
				currentText = currentText.replace(/(_?[a-zç]+_?|_)$/i, '');
			} else {
				currentText = currentText.replace(/.$/, '');
			}
			updateText();
		}
	};
	window.onkeyup = (e) => {
		const { key } = getPressedKey(e.key);
		if (key) {
			key.pressed = false;
		}
	};
	window.onkeypress = (e) => {
		if (e.ctrlKey || e.altKey) {
			return;
		}
		const { key, input } = getPressedKey(e.key);
		if (e.key === ' ') {
			currentText += '_'
		} else if (key) {
			currentText += input;
		}
		updateText();
	};
};

init();
