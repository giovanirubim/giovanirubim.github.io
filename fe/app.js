const http = require('http');
const fs = require('fs');
const app = http.createServer((req, res) => {
	let path = '.' + req.url;
	if (path === './') {
		res.end(fs.readFileSync('./index.html'));
	} else {
		res.writeHead(200, {
			'Content-Type': 'application/javascript'
		});
		res.end(fs.readFileSync(path));
	}
});
app.listen(80);