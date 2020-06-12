import * as SHA1 from './sha-1.js';
import * as UTF8 from './utf-8.js';
import { srand, rand } from './random.js';
const Set = (size, map) => new Array(size).fill(0).map((_,i) => map(i)).join('');
const Chr = (code) => String.fromCharCode(code);
const charsetMap = {
	digits: '0123456789',
	lowercase: Set(26, i => Chr(i+97)),
	uppercase: Set(26, i => Chr(i+65)),
	specialascii: Set(94, i => Chr(i+33)).replace(/[0-9A-Za-z]/g, ''),
	specialnonascii: Set(95, i => Chr(i+161)).replace(/\xAD/, ''),
};
export const generate = (config) => {
	let {
		password,
		pattern,
		usage,
		length,
		counter,
		year,
		digits,
		lowercase,
		uppercase,
		specialascii,
		specialnonascii
	} = config;
	digits |= 0;
	lowercase |= 0;
	uppercase |= 0;
	specialascii |= 0;
	specialnonascii |= 0;
	let seed = UTF8.encode([
		password,
		pattern,
		usage.trim().toLowerCase(),
		length,
		counter,
		year,
		digits,
		lowercase,
		uppercase,
		specialascii,
		specialnonascii,
	].join(':'));
	length = parseInt(length);
	if (isNaN(length)) throw 'Invalid length';
	srand(seed);
	let charset = '';
	let chars = '';
	const addCharset = str => {
		charset += str;
		chars += str[rand()%str.length];
	};
	if (digits) addCharset(charsetMap.digits);
	if (lowercase) addCharset(charsetMap.lowercase);
	if (uppercase) addCharset(charsetMap.uppercase);
	if (specialascii) addCharset(charsetMap.specialascii);
	if (specialnonascii) addCharset(charsetMap.specialnonascii);
	let missing = length - chars.length;
	while (missing-- > 0) {
		chars += charset[rand()%charset.length];
	}
	let res = '';
	chars = chars.split('');
	while (chars.length) {
		res += chars.splice(rand()%chars.length, 1)[0];
	}
	return res.substr(0, length);
};