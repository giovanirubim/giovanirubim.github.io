export const fixTypo = (text) => text
	.replace(/o/ig, '0')
	.replace(/[il]/ig, '1')
	.replace(/s/ig, '5')
	.replace(/g/ig, '9');
