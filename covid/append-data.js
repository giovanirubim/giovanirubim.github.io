const lib = require('./lib.js');
const data = lib.load();
const {argv} = process;
const argc = argv.length;
if (argc < 8) {
	console.log(`Missing ${8 - argc} arguments  (confirmed, discarded, deaths, recovered, suspects, hospitalized) `);
	process.exit(0);
} else if (argc > 8) {
	console.log('Too many arguments');
	process.exit(0);
}
const total = 'confirmed discarded deaths recovered'.split(/\s/);
const current = 'suspects hospitalized'.split(/\s/);
let index = 2;
console.log('Appended:')
total.forEach(name => {
	let val = parseInt(argv[index++]);
	console.log(` - total ${name}: ${val}`);
	data.total[name].push(val);
})
current.forEach(name => {
	let val = parseInt(argv[index++]);
	console.log(` - current ${name}: ${val}`);
	data.current[name].push(val);
});
lib.store(data);