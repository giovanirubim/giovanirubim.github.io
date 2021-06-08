import * as Keyboard from './keyboard.js';
import * as Data from './data.js';

const getMax = (array) => array.reduce((a, b) => Math.max(a, b));

const qwerty = 'QWERTYUIOPASDFGHJKLÇZXCVBNM#$%';
const custom = 'MFDW#ÇYQLUNSTAKJEOIRZXCV$%BHGP';
const colemak = 'QWFPGJLUY#ARSTDHNEIOZXCVBKMÇ$%';

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
		this.setPosition(position);
		this.pressed = false;
		this.pressCount = 0;
		this.highlight = 0;
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
}

const initKeys = () => {
	for (let i=0; i<numberOfKeys; ++i) {
		keyArray.push(new Key(qwerty[i], i));
	}
};

initKeys();

const canvas = document.querySelector('canvas');
Keyboard.setCanvas(canvas);
Keyboard.startRender(keyArray);
window.keyArray = keyArray;
