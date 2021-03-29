const http = require('http')
const path = require('path')
const fs = require('fs')
const port = 8080
const getExt = filepath => filepath.replace(/^.*\.(\w+)$/, '$1')
const mimeMap = {
	'js': 'application/javascript',
	'jpeg': 'image/jpeg',
	'html': 'text/html',
}
const getMime = (filepath) => mimeMap[getExt(filepath)] || 'application/octet-stream'
const sv = http.createServer((req, res) => {
	try {
		let filepath = path.join(__dirname, req.url.replace(/[?#].*/, ''))
		const file = fs.readFileSync(filepath)
		res.writeHead(200, {
			'content-type': getMime(filepath),
			'content-length': file.length
		})
		res.write(file)
		res.end()
	} catch(err) {
		res.writeHead(404)
		res.end()
	}
})
sv.listen(port, () => {
	console.log('Server started at port ' + port)
})
