const fs = require('fs');
const http = require('http');
const mimeMap = {
	'html': 'text/html',
	'css': 'text/css',
	'js': 'application/javascript',
};
const getMime = path => {
	let ext = path.substr(1+path.lastIndexOf('.'));
	return mimeMap[ext];
};
http.createServer((req, res) => {
	try {
		const path = '.' + req.url;
		const file = fs.readFileSync(path);
		res.writeHead(200, {'Content-Type': getMime(path)});
		res.end(file);
	} catch(err) {
		console.log(err);
		res.writeHead(500);
		res.end();
	}
}).listen(80, () => console.log('started'));