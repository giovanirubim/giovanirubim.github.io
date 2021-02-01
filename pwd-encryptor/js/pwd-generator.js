const range = (a, b) => {
	a = a.charCodeAt(0)
	b = b.charCodeAt(0)
	return new Array(b - a + 1).fill().map((_,i) => String.fromCharCode(a + i))
}
const alphabets = {
	uppercase: range('A', 'Z'),
	lowercase: range('a', 'z'),
	digits: range('0', '9'),
	specialChars: '!#$%&()*+,--./:;=?@[]{}'.split('')
}
const toAlphabet = {}
for (let name in alphabets) {
	const alphabet = alphabets[name]
	alphabet.forEach(char => toAlphabet[char] = alphabet)
}
const getAlphabets = (template) => {
	const array = []
	for (let char of template) {
		array.push(toAlphabet[char])
	}
	return array
}
const pick = (array) => array[Math.floor(Math.random()*array.length)]
const shuffle = (array) => {
	for (let i=array.length; i>1;) {
		const j = Math.floor(Math.random()*(i--))
		const aux = array[j]
		array[j] = array[i]
		array[i] = aux
	}
	return array
}
const generate = (size, template = 'aA0?') => {
	let res = []
	let all = []
	const alphabets = getAlphabets(template)
	for (name in alphabets) {
		const alphabet = alphabets[name]
		res.push(pick(alphabet))
		all.push(...alphabet)
	}
	while (res.length < size) {
		res.push(pick(all))
	}
	shuffle(res)
	return res.join('')
}
export default generate