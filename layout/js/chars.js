let string = '';
for (let i=0; i<26; ++i) {
	string += String.fromCharCode(i + 97);
}
string += 'ç#$%';
string = string.split('').sort().join('');
export default string;
