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
		let urlpath = req.url.replace(/[?#].*/, '')
		let filepath = path.join(__dirname, urlpath)
		const isDir = fs.lstatSync(filepath).isDirectory()
		if (urlpath.endsWith('/')) {
			if (!isDir) {
				res.writeHead(404)
				res.end()
				return
			} else {
				filepath = path.join(__dirname, urlpath + 'index.html')
			}
		} else if (isDir) {
			res.writeHead(301, { location: urlpath + '/' })
			res.end()
			return
		}
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
