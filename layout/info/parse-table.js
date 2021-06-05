const fs = require('fs')
const lines = fs.readFileSync('./table.txt').toString('utf8').split(/\s*\n\s*/);

const langs = lines[0].split('\t').slice(1).map((x) => x.replace(/\s*\[.*\]$/, ''));
let rows = lines.slice(1).map((line) => {
	let row = line.split('\t')
	let letter = row[0];
	if (!letter.match(/[a-zãâáàéêíóôõúç]/)) {
		return null;
	}
	let entries = row.slice(1).map((val, i) => {
		const lang = langs[i];
		return [
			lang,
			(val.replace(/[%~]/g, '')/100).toPrecision(7)*1,
		];
	}).filter((entry) => entry[0].match(/Port|Eng/));
	entries.forEach((entry) => {
		if (entry[0] === 'English') {
			entry[0] = 'en';
		} else {
			entry[0] = 'pt';
		}
	})
	let cols = Object.fromEntries(entries);
	return {letter, cols};
}).filter((row) => row !== null).map((row) => ({
	letter: row.letter, ...row.cols
}));

const map = {};
rows.forEach((row) => {
	map[row.letter] = row;
});
rows.forEach((row) => {
	if (row.letter.match(/[^a-zç]/)) {
		let other = map[row.letter.normalize('NFD').replace(/[^\x00-\x7f]/g, '')];
		other.pt += row.pt;
		other.en += row.en;
		row.remove = true;
	}
});
rows = rows.filter((row) => !row.remove);

let totals = {pt: 0, en: 0};
rows.forEach((row) => {
	totals.pt += row.pt;
	totals.en += row.en;
});
rows.forEach((row) => {
	row.pt /= totals.pt;
	row.en /= totals.en;
	row.count = (row.pt + row.en)/2;
});
rows.sort((a, b) => b.count - a.count);
rows = rows.map(({ letter, count }) => ({ letter, count }));
console.log(rows.map(({ letter}) => letter).join(''));

fs.writeFileSync('./frequency.json', JSON.stringify(rows, null, '\t'));
