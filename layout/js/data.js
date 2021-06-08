import Chars from './chars.js';

const langs = ['en', 'pt'];
const all = langs.join('-');
const createSet = () => {
	const entries = langs
	.concat(all)
	.map((name) => [name, {}]);
	return Object.fromEntries(entries);
};

let currentMode = all;

const letterFrequency = createSet();
const nearFrequency = createSet();
const temperatureMultiplier = Object.fromEntries(
	langs.concat(all)
		.map((lang) => [lang, 0])
);

const mergeLetterFrequency = (array) => {
	array.forEach((item) => {
		const char = item.letter;
		let sum = 0;
		for (let lang of langs) {
			const value = item[lang];
			letterFrequency[lang][char] = value;
			temperatureMultiplier[lang] = Math.max(temperatureMultiplier[lang], value);
			sum += value;
		}
		const average = sum/langs.length;
		letterFrequency[all][char] = average;
		temperatureMultiplier[all] = Math.max(temperatureMultiplier[all], average);
	});
	for (let lang in temperatureMultiplier) {
		const value = temperatureMultiplier[lang];
		temperatureMultiplier[lang] = 1/value;
	}
};

const mergeNearFrequency = (object) => {
	const chars = Chars.low.letters.split('');
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

export const load = async () => await loadPromise;

export const setMode = (mode) => currentMode = mode;

export const getTemperature = (char) => {
	const value = letterFrequency[currentMode][char] ?? 0;
	return value*temperatureMultiplier[currentMode];
};

export const getNearValue = (from, to) => {
	return nearFrequency[currentMode][from][to] ?? 0;
};

export const ready = (callback) => {
	init().then(() => callback());
};
