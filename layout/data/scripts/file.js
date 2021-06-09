const fs = require('fs');
const path = require('path');

module.exports.read = (filename) => {
	const pathname = path.join(__dirname, '../sources/', filename);
	return fs.readFileSync(pathname);
};

module.exports.write = (filename, contnet) => {
	const pathname = path.join(__dirname, '../outputs/', filename);
	return fs.writeFileSync(pathname, contnet);
};
