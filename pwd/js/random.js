import * as UTF8 from './utf-8.js';
import * as SHA1 from './sha-1.js';

let seed = [0, 0, 0, 0];
const buffer = [0, 0, 0, 0, 0];
let bIndex = 5;
export const srand = (value) => {
	if (typeof value === 'string') {
		seed = [0, 0, 0, 0].concat(UTF8.encode(value));
	} else if (value instanceof Array) {
		seed = [0, 0, 0, 0].concat(value);
	} else {
		throw 'Invalid seed type';
	}
	bIndex = 5;
};
export const rand = () => {
	if (bIndex === buffer.length) {
		let sha1 = SHA1.digest(seed);
		let carry = 1;
		for (let i=4; i--;) {
			carry = (seed[i] += carry) >>> 8;
			seed[i] &= 255;
		}
		for (let i=0; i<5; ++i) {
			buffer[i] = parseInt(sha1.substr(i*8, 8), 16);
		}
		bIndex = 0;
	}
	return buffer[bIndex++];
};