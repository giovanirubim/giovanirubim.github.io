import * as utf8 from './utf-8.js'
const filterCode = (str) => str
	.replace(/o/ig, '0')
	.replace(/i/ig, '1')
	.replace(/s/ig, '5')
	.replace(/g/ig, '9')
	.replace(/z/ig, '2')
	.replace(/[^a-fA-F\d\-/]/g, '')
const strToHex = (str) => {
	return utf8.encode(str)
		.map(byte => byte.toString(16).padStart(2, 0))
		.join('')
}
const hexToStr = (hex) => {
	const bytes = hex
		.replace(/(\w\w)/g, ' $1')
		.trim()
		.split(' ')
		.map(hex => parseInt(hex, 16))
	return utf8.decode(bytes)
}
const int32ToHex = (int) => {
	let res = ''
	for (let i=0; i<8; ++i) {
		res = (int & 15).toString(16) + res
		int >>>= 4
	}
	return res
}
const xorHex = (a, b) => {
	let res = ''
	const length = Math.max(a.length, b.length)
	for (let i=0; i<length; ++i) {
		res += (parseInt(a[i], 16) ^ parseInt(b[i], 16)).toString(16)
	}
	return res
}
const hashStr = (str) => {
	const hasher = new sjcl.hash.sha256()
	hasher.update(str)
	return hasher.finalize().map(int32ToHex).join('')
}
const checkConfirm = (code) => {
	code = filterCode(code).toLowerCase()
	const [, salt, encrypted] = code
}
const randomHex = (n) => n? Math.floor(Math.random()*16).toString(16) + randomHex(n - 1): ''
export const encrypt = (key, text) => {
	let salt = randomHex(6)
	let hexText = strToHex(text)
	let hash = hashStr(salt + '/' + key).substr(0, hexText.length)
	let encrypted = xorHex(hash, hexText)
	let confirm = hashStr(salt + '/' + encrypted).substr(0, 2)
	let output = salt + '/' + encrypted + '-' + confirm
	return output.toUpperCase()
}
export const decrypt = (key, input) => {
	input = filterCode(input.toLowerCase())
	let [, salt, encrypted] = input.match(/^(\w+)\/(\w+)-(\w+)$/)
	let hash = hashStr(salt + '/' + key).substr(0, encrypted.length)
	let hexText = xorHex(hash, encrypted)
	return hexToStr(hexText)
}
