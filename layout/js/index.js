import * as Keyboard from './keyboard.js';
import * as Data from './data.js';
import Chars from './chars.js';

const getMax = (array) => array.reduce((a, b) => Math.max(a, b));

const qwerty = 'qwertyuiopasdfghjklçzxcvbnm<>;';
const custom = 'mfdw<çybulnstakjeoirzxcv>;qhpg';
const colemak = 'qwfpgjluy<arstdhneiozxcvbkmç>;';

const keyArray = window.keyArray = [];
const keyMap = {};
const nRows = 3;
const nCols = 10;
const spaceCol = (nCols >> 1);
const numberOfKeys = nRows*nCols;
const rowValues = [ 4, 15, 3 ];
const colValues = [ 6, 6, 9, 9, 1, 1, 9, 9, 6, 6 ];
const maxValue = getMax(rowValues)*getMax(colValues);
const values = rowValues
	.map((rowValue) => colValues
		.map((colValue) => rowValue*colValue)
	)
	.flat()
	.map((value) => value / maxValue);

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
		this.isLetter = /^[a-zç]$/i.test(char);
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
}

const initKeys = () => {
	for (let i=0; i<numberOfKeys; ++i) {
		keyArray.push(new Key(qwerty[i], i));
	}
	keyArray.forEach((key) => {
		keyMap[key.char] = key;
	});
};

const init = async () => {
	await Data.load();
	Data.setMode('en-pt');
	initKeys();
	const canvas = document.querySelector('canvas');
	Keyboard.setCanvas(canvas);
	Keyboard.startRender(keyArray);
	$(canvas).on('mousemove', (e) => {
		const x = e.offsetX;
		const y = e.offsetY;
		const key = keyArray.find(({ renderData }) => {
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
		keyArray.forEach((key) => key.highlight = 0);
		if (key == null || !key.isLetter) {
			$('#info').html('');
			return;
		}
		const { char } = key;
		keyArray.forEach((key) => {
			if (char === key.char) {
				return;
			}
			key.highlight = Math.pow(Data.getNearValue(char, key.char), 0.35);
		});
		$('#info').html(`
			Letter temperature: ${ key.temperature.toPrecision(2)*1 } <br>
			Position value: ${ key.value.toPrecision(2)*1 }
		`);
	});
};

init();
