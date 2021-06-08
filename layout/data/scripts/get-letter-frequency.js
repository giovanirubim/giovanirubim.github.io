const fs = require('fs');

const removeAccent = (string) => string
	.normalize('NFD')
	.replace(/[^\x00-\x7f]/g, '');

const lines = fs.readFileSync('../sources/letter-frequency.txt')
	.toString('utf8')
	.split(/\s*\n\s*/);

const langs = lines[0]
	.split('\t')
	.slice(1)
	.map((x) => x.replace(/\s*\[.*\]$/, ''));

// Parses rows into a filtered array of objects
const rows = lines.slice(1)
	.map((line) => {
		const row = line.split('\t')
		const letter = row[0];
		if (!letter.match(/[a-zãâáàéêíóôõúç]/)) {
			// Invalid character
			return null;
		}
		// Pair language lables with percentages
		const entries = row.slice(1)
			.map((val, i) => {
				const lang = langs[i];
				return [
					lang,
					(val.replace(/[%~]/g, '')/100).toPrecision(7)*1,
				];
			})
			.filter((entry) => entry[0].match(/Port|Eng/));
		entries.forEach((entry) => {
			if (entry[0] === 'English') {
				entry[0] = 'en';
			} else {
				entry[0] = 'pt';
			}
		})
		return { letter, ...Object.fromEntries(entries) };
	})
	.filter((row) => row !== null);

// Merges accented letters
const map = {};
rows.forEach((row) => {
	const { letter, en, pt } = row;
	const key = /[a-zç]/.test(letter) ? letter : removeAccent(letter);
	const other = map[key];
	if (other !== undefined) {
		other.en += en;
		other.pt += pt;
	} else {
		map[key] = { en, pt };
	}
});

// Normalizes totals
const total = {en: 0, pt: 0};
for (let letter in map) {
	total.en += map[letter].en;
	total.pt += map[letter].pt;
}
for (let letter in map) {
	map[letter].en /= total.en;
	map[letter].pt /= total.pt;
}

const result = Object.entries(map)
	.map(([ letter, frequency ]) => ({ letter, ...frequency }));

const json = JSON.stringify(result, null, '\t');
fs.writeFileSync('../outputs/letter-frequency.json', json);
