import Chars from './chars.js';

const langs = ['en', 'pt'];
const all = langs.join('-');
const createSet = () => {
	const entries = langs
	.concat(all)
	.map((name) => [name, {}]);
	return Object.fromEntries(entries);
};

export const letterFrequency = createSet();
export const nearFrequency = createSet();

const mergeLetterFrequency = (array) => {
	array.forEach((item) => {
		let sum = 0;
		for (let lang of langs) {
			const value = item[lang];
			letterFrequency[lang][item.letter] = value;
			sum += value;
		}
		letterFrequency[all][item.letter] = sum/langs.length;
	});
};

const mergeNearFrequency = (object) => {
	const chars = Chars.replace(/[#\$%]/g, '').split('');
	const common = {};
	for (let lang of langs) {
		for (let a of chars) {
			if (common[a] === undefined) {
				common[a] = Object.fromEntries(chars.map((char) => [char, 0]));
			}
			const map = {};
			for (let b of chars) {
				const value = object[lang][a][b];
				map[b] = value;
				common[a][b] += value;
			}
			nearFrequency[lang][a] = map;
		}
	}
	for (let a of chars) {
		for (let b of chars) {
			common[a][b] /= langs.length;
		}
	}
	nearFrequency[all] = common;
};

const init = async () => {
	mergeLetterFrequency(await $.get('data/outputs/letter-frequency.json'));
	mergeNearFrequency(await $.get('data/outputs/near-frequency.json'));
};

const loadPromise = init();

export const ready = (callback) => {
	init().then(() => callback());
};
