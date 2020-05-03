const byteToBin = (new Array(256).fill(0)).map((z,i) => i.toString(2).padStart(8,'0'));
const split = (str, chunkSize) => {
	const chunks = [];
	for (let i=0; i<str.length; i+=chunkSize) {
		chunks.push(str.substr(i, chunkSize));
	}
	return chunks;
};
export const digest = (bytes) => {
	if (!(bytes instanceof Array)) {
		throw 'The argument must be an array of bytes';
	}
	let bin = '';
	bytes.forEach(byte => bin += byteToBin[byte]);
	const size = bin.length;
	bin += '1';
	const mod = bin.length % 512;
	if (mod < 448) {
		bin += '0'.repeat(448 - mod);
	} else if (mod > 448) {
		bin += '0'.repeat(512 - (mod - 448));
	}
	bin += size.toString(2).padStart(64, '0');
	const chunks = split(bin, 512);
    var h1 = 0x67452301|0;
    var h2 = 0xEFCDAB89|0;
    var h3 = 0x98BADCFE|0;
    var h4 = 0x10325476|0;
    var h5 = 0xC3D2E1F0|0;
    chunks.forEach(chunk => {
    	let a = h1;
    	let b = h2;
    	let c = h3;
    	let d = h4;
    	let e = h5;
    	let f, k, t;
    	let words = split(chunk, 32).map(x => parseInt(x, 2));
    	for (let i=0; i<80; ++i) {
    		let word;
    		if (i < 16) {
                word = words[i];
            } else {
                word = words[i-3] ^ words[i-8] ^ words[i-14] ^ words[i-16];
                word = words[i] = (word << 1) | (word >>> 31);
            }
            if (i < 20) {
                f = b & c | (~b) & d;
                k = 0x5A827999|0;
            } else if (i < 40) {
                f = b ^ c ^ d;
                k = 0x6ED9EBA1|0;
            } else if (i < 60) {
                f = b & c | b & d | c & d;
                k = 0x8F1BBCDC|0;
            } else {
                f = b ^ c ^ d;
                k = 0xCA62C1D6|0;
            }
            t = (((a << 5) | (a >>> 27)) + f + e + k + word)|0;
            e = d;
            d = c;
            c = (b << 30) | (b >>> 2);
            b = a;
            a = t;
    	}
    	h1 = (a + h1)|0;
    	h2 = (b + h2)|0;
    	h3 = (c + h3)|0;
    	h4 = (d + h4)|0;
    	h5 = (e + h5)|0;
    });
	return [h1, h2, h3, h4, h5].map(x => ((x >>> 1)*2 + (x&1)).toString(16).padStart(8, '0')).join('');
};