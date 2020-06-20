const lib = require('./lib.js');
const data = lib.load();
for (let prefix in data) {
	const obj = data[prefix];
	for (let name in obj) {
		const array = obj[name];
		array.splice(array.length - 1, 1);
	}
}
lib.store(data);
console.log('last row removed');