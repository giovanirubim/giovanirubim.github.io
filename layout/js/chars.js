let all = '';
for (let i=0; i<26; ++i) {
	all += String.fromCharCode(i + 97);
}
all += 'ç<>;';
all = all.split('').join('');
const letters = all.replace(/[^a-zç]/g, '');
const map = {
	low: { all, letters },
	up: {
		all: all.toUpperCase(),
		letters: letters.toUpperCase(),
	},
};
export default map;
