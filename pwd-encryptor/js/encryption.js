import * as utf8 from './utf-8.js'

const strToHex = (str) => utf8.encode(str)
	.map(byte => byte.toString(16).padStart(2, 0))
	.join('')

const hexToStr = (hex) => utf8.decode(
	hex
		.replace(/(\w\w)/g, '$1 ')
		.trim()
		.split(' ')
		.map(hex => parseInt(hex, 16))
)

const int32ToHex = (int) => {
	let res = ''
	for (let i=0; i<8; ++i) {
		res = (int & 15).toString(16) + res
		int >>>= 4
	}
	return res
}

const xorHex = (a, b) => {
	const length = Math.max(a.length, b.length)
	let res = ''
	for (let i=0; i<length; ++i) {
		res += (`0x${a[i]}`^`0x${b[i]}`).toString(16)
	}
	return res
}

const hashStr = (str) => new sjcl.hash.sha256()
	.update(str)
	.finalize()
	.map(int32ToHex)
	.join('')

const randomHex = (n) => {
	if (!n) return ''
	return Math.floor(Math.random()*16).toString(16) + randomHex(n - 1)
}

const fixCode = (str) => str
	.replace(/\s/g, '')
	.toLowerCase()
	.replace(/o/g, '0')
	.replace(/i/g, '1')
	.replace(/s/g, '5')
	.replace(/z/g, '2')
	.replace(/q/g, '9')
	.replace(/g/g, '6')

export const validCode = (code) => {
	code = fixCode(code)
	if (!/^[a-f\d]{6}\/[a-f\d]*-[a-f\d]{2}$/.test(code)) {
		return false
	}
	const checksum = code.replace(/^\w+\/\w+-/, '')
	const hash = hashStr(code.replace(/-.*$/, ''))
	return hash.substr(0, 2) === checksum? code: false;
}

export const encrypt = (key, text) => {
	let salt = randomHex(6)
	let hexText = strToHex(text)
	let hash = hashStr(salt + '/' + key).substr(0, hexText.length)
	let encrypted = xorHex(hash, hexText)
	let checksum = hashStr(salt + '/' + encrypted).substr(0, 2)
	let output = salt + '/' + encrypted + '-' + checksum
	return output.toUpperCase()
}

export const decrypt = (key, input) => {
	input = fixCode(input.toLowerCase())
	let [, salt, encrypted] = input.match(/^(\w+)\/(\w+)-(\w+)$/)
	let hash = hashStr(salt + '/' + key).substr(0, encrypted.length)
	let hexText = xorHex(hash, encrypted)
	return hexToStr(hexText)
}
