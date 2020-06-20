const fs = require('fs');
module.exports.load = () => {
	const window = {};
	eval(fs.readFileSync('./data.js').toString());
	return window.data;
};
module.exports.store = (data) => {
	fs.writeFileSync('./data.js', `window.data = ${JSON.stringify(data)};`);
};
