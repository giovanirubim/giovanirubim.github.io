const byteToHex = (byte) => {
	return byte.toString(16).padStart(2, '0');
};

const sha256 = (text) => {
	return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
};

export const sampleCode = `/* {{instruction}} */
(async()=>{
	let password = prompt('{{enter_pass}}'),
		encrypted = prompt('{{enter_encrypted}}').toLowerCase(),
		[ s, p ] = encrypted.match(/\\w+/g),
		buff = new TextEncoder().encode(s + password),
		hash = new Uint8Array(await crypto.subtle.digest('SHA-256', buff)),
		xor = p.match(/../g).map((b, i) => '0x' + b ^ hash[i]),
		res = new TextDecoder().decode(new Uint8Array(xor).buffer);
	alert('Recovered password: ' + res);
})();`;

export const encrypt = async (text, password) => {
	const salt = 'xxx'.replace(/x/g, () => byteToHex(Math.random()*256|0));
	const hash = new Uint8Array(await sha256(salt + password));
	const buff = new Uint8Array(new TextEncoder().encode(text));
	const payload = [ ...buff ].map((b, i) => byteToHex(b ^ hash[i])).join('');
	const sumBuff = await sha256(salt + payload);
	const checksum = byteToHex(new Uint8Array(sumBuff)[0]);
	return `${salt}/${payload}-${checksum}`;
};

export const decrypt = async (encrypted, password) => {
	const [ salt, payload, checksum ] = encrypted.toLowerCase().match(/\w+/g);
	const hash = new Uint8Array(await sha256(salt + password));
	const xor = payload.match(/../g).map((b, i) => '0x' + b ^ hash[i]);
	const text = new TextDecoder().decode(new Uint8Array(xor).buffer);
	return text;
};

export const validSum = async (encrypted) => {
	const [ salt, payload, checksum ] = encrypted.toLowerCase().match(/\w+/g);
	const sumBuff = await sha256(salt + payload);
	const sumByte = byteToHex(new Uint8Array(sumBuff)[0]);
	return sumByte === checksum;
};
