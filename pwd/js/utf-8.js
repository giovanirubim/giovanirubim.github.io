export const encode = (string, output = []) => {
	const {length} = string;
	let j = 0;
	for (let i=0; i<length; ++i) {
		const code = string.charCodeAt(i);
		if (code < (0b10000000)) {
			output[j++] = code;
		} else if (code < (1 << 11)) {
			output[j++] = 0b11000000|(code >>> 6);
			output[j++] = 0b10000000|(code & 0b00111111);
		} else {
			output[j++] = 0b11100000|(code >>> 12);
			output[j++] = 0b10000000|((code >>> 6) & 0b00111111);
			output[j++] = 0b10000000|(code & 0b00111111);
		}
	}
	return output;
};
export const decode = (bytes) => {
	let i = 0;
	let string = '';
	const {length} = bytes;
	while (i < length) {
		const code = bytes[i++];
		if (code < 0b10000000) {
			string += String.fromCharCode(code);
		} else if (code < 0b11100000) {
			string += String.fromCharCode(((code & 0b00011111) << 6)
				|(bytes[i++] & 0b00111111));
		} else {
			const mid = bytes[i++];
			string += String.fromCharCode(((code & 0b00011111) << 12)
				|((mid & 0b00111111) << 6)
				|(bytes[i++] & 0b00111111));
		}
	}
	return string;
};