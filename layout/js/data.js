import Chars from './chars.js';

const langs = ['en', 'pt'];
const all = langs.join('-');

export const modes = langs.concat(all);

const createLangMap = (fill) => {
	const entries = langs
		.concat(all)
		.map((name) => [name, fill()]);
	return Object.fromEntries(entries);
};
const createKeyMap = (fill) => Object.fromEntries(
	Chars.low.all
		.split('')
		.map((char) => [char, fill()])
);
const createDirMap = (fill) => ({
	prev: fill(),
	next: fill(),
	average: fill(),
});

let currentMode = all;

const letterFrequency = createLangMap(() => ({}));
const nearFrequency = createLangMap(
	() => createKeyMap(
		() => createDirMap(
			() => createKeyMap(() => 0)
		)
	)
);
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
	const dirs = ['prev', 'next'];
	for (let lang of langs) {
		for (let a of chars) {
			for (let dir of dirs) {
				for (let b of chars) {
					const value = object[lang][a][dir][b];
					nearFrequency[lang][a][dir][b] = value;
					nearFrequency[lang][a].average[b] += value / dirs.length;
				}
			}
		}
	}
	dirs.push('average');
	for (let lang of langs) {
		for (let a of chars) {
			for (let dir of dirs) {
				for (let b of chars) {
					const value = nearFrequency[lang][a][dir][b];
					nearFrequency[all][a][dir][b] += value / langs.length;
				}
			}
		}
	}
};

const init = async () => {
	mergeLetterFrequency(await $.get('data/outputs/letter-frequency.json'));
	mergeNearFrequency(await $.get('data/outputs/near-frequency.json'));
};

const loadPromise = init();

export const load = async () => await loadPromise;

export const setMode = (mode) => currentMode = mode;
export const getMode = (mode) => currentMode;

export const getTemperature = (char) => {
	return getFrequency(char)*temperatureMultiplier[currentMode];
};

export const getFrequency = (char) => {
	return letterFrequency[currentMode][char] ?? 0;
};

export const getNearValue = (from, to) => {
	return nearFrequency[currentMode][from].average[to] ?? 0;
};
export const getNextFrequency = (from, to) => {
	return nearFrequency[currentMode][from].next[to] ?? 0;
};
export const getPrevFrequency = (from, to) => {
	return nearFrequency[currentMode][from].prev[to] ?? 0;
};

export const ready = (callback) => {
	init().then(() => callback());
};
