const fs = require('fs');

const formatWord = (word) => `^${
	word
		.toLowerCase()
		.replace(/ç/g, 'C')
		.normalize('NFD')
		.replace(/[^\x00-\x7f]/g, '')
		.replace(/C/g, 'ç')
}$`;

const charset = 'a-z;ç;^;$'
	.split(';')
	.map(item => {
		let [a, b = a] = item.split('-');
		a = a.charCodeAt(0);
		b = b.charCodeAt(0);
		let string = '';
		for (let i=a; i<=b; ++i) {
			string += String.fromCharCode(i);
		}
		return string;
	})
	.join('');

const createMap = (fillMethod) => Object.fromEntries(
	charset
		.split('')
		.map((char) => [char, fillMethod?.() ?? 0])
);

const langs = 'en,pt'.split(',');
const mapsEntries = langs.map((lang) => {
	const map = createMap(() => {
		return {
			prev: createMap(),
			next: createMap(),
		};
	});
	const pathname = `../sources/word-frequency-${lang}.txt`;
	fs.readFileSync(pathname)
		.toString('utf8')
		.trim()
		.split(/\s*\n\s*/)
		.forEach((line) => {
			const row = line.split(',');
			const word = formatWord(row[0]);
			const amount = parseInt(row[1]);
			const last = word.length - 1;
			for (let i=0; i<last; ++i) {
				const a = word[i];
				const b = word[i + 1];
				map[b].prev[a] += amount;
				map[a].next[b] += amount;
			}
		});
	const merge = true;
	for (let a in map) {
		const dirmap = map[a];
		const merged = {};
		for (let dir in dirmap) {
			const submap = dirmap[dir];
			let total = 0;
			for (let b in submap) {
				total += submap[b];
			}
			delete submap['^'];
			delete submap['$'];
			total = total || 1;
			for (let b in submap) {
				const relative = submap[b]/total;
				if (merge) {
					merged[b] = (merged[b] ?? 0) + (relative)/2;
				} else {
					submap[b] = relative;
				}
			}
		}
		if (merge) {
			map[a] = merged;
		}
	}
	delete map['^'];
	delete map['$'];
	return [lang, map];
});

const maps = Object.fromEntries(mapsEntries);
const json = JSON.stringify(maps, null, '\t');
fs.writeFileSync('../outputs/near-frequency.json', json);
