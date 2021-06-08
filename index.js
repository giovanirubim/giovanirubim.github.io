const http = require('http');
const path = require('path');
const fs = require('fs');
const port = process.argv[2] ?? 8080;
const root = __dirname;
const mimeMap = {
	'html': 'text/html',
	'css': 'text/css',
	'js': 'application/javascript',
	'json': 'application/json',
};
const getMime = (path) => {
	const ext = path
		.replace(/^.*\.(\w+)$/, '$1')
		.toLowerCase();
	return mimeMap[ext] ?? 'application/octet-stream';
};
const server = http.createServer((req, res) => {
	const urlpath = req.url
		.replace(/[?#].*$/, '')
		.replace(/\/$/, '/index.html');
	const filepath = path.join(root, urlpath);
	try {
		if (!fs.existsSync(filepath)) {
			res.writeHead(404);
			res.end();
			return;
		}
		const stat = fs.lstatSync(filepath);
		if (stat.isDirectory()) {
			res.writeHead(301, {
				'location': urlpath + '/',
			});
			res.end();
			return;
		}
		const buffer = fs.readFileSync(filepath);
		res.writeHead(200, {
			'content-type': getMime(filepath),
			'content-length': buffer.length,
		});
		res.write(buffer);
		res.end();
	} catch(error) {
		console.error(error);
		res.writeHead(500);
		res.end();
	}
});
server.listen(port, () => {
	console.log(`Listening to port ${port}`);
});
