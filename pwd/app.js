const fs = require('fs');
const http = require('http');

const concatPaths = (a, b) => {
	const isDash = {'/': 1, '\\': 1};
	if (isDash[a[a.length - 1]]) a = a.substr(0, a.length - 1);
	if (isDash[b[0]]) b = b.substr(1);
	return `${a}/${b}`;
};
const webRoot = __dirname;
const port = 80;

const getMime = path => {
	path = path.substr(path.lastIndexOf('.') + 1);
	return {
		js: 'application/javascript',
		json: 'application/json',
		html: 'text/html',
		css: 'text/css',
		glsl: 'text/plain',
	}[path] || 'application/octet-stream'
};

const app = http.createServer((req, res) => {
	let path = req.url;
	if (path === '/') path += 'index.html';
	path = webRoot + path;
	if (!fs.existsSync(path)) {
		res.writeHead(404);
		res.end();
		return;
	}
	try {
		const file = fs.readFileSync(path);
		res.writeHead(200, {'Content-Type': getMime(path)});
		res.end(file);
	} catch(e) {
		res.writeHead(500);
		res.end();
	}
});
app.listen(port, () => {
	console.log('Server started at port ' + port);
});