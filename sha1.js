function UTF8Encode(str) {
	var output = new Array(str.length), code, nBytes, max, i, j, k;
	for (i=j=0; i<str.length; ++i) {
		code = str.charCodeAt(i);
		if (code < 128) {
			output[j++] = code;
		} else {
			nBytes = 2;
			max = 2048;
			while (code >= max) {
				++ nBytes;
				max <<= 5;
			}
			for (k=nBytes; --k;) {
				output[j+k] = code & 63 | 128;
				code >>>= 6;
			}
			output[j] = (0xFF << (8 - nBytes)) & 0xFF | code;
			j += nBytes;
		}
	}
	return output;
}

function UTF8Decode(input) {
	var str = "", val, code, nBytes, mask, i;
	for (i=0; i<input.length;) {
		val = input[i++];
		if (val < 128) {
			str += String.fromCharCode(val);
		} else {
			mask = 32;
			nBytes = 2;
			while (mask & val) {
				nBytes ++;
				mask >>>= 1;
			}
			code = val & (mask - 1);
			while (--nBytes)
				code = (code << 6) | (input[i++]) & 63;
			str += String.fromCharCode(code); 
		}
	}
	return str;
}

function SHA1(input) {
	var chunk = new Array(80);
	var iw = 0, ic = 0, word = 0;
	var h1 = 0x67452301;
	var h2 = 0xEFCDAB89;
	var h3 = 0x98BADCFE;
	var h4 = 0x10325476;
	var h5 = 0xC3D2E1F0;
	var a, b, c, d, e, f, k, t, w;
	function readChunk() {
		a = h1;
		b = h2;
		c = h3;
		d = h4;
		e = h5;
		for (var i=0; i<80; ++i) {
			if (i < 16) {
				w = chunk[i];
			} else {
				w = chunk[i-3] ^ chunk[i-8] ^ chunk[i-14] ^ chunk[i-16];
				w = chunk[i] = (w << 1) | (w >>> 31);
			}
			if (i < 20) {
				f = b & c | (~b) & d;
				k = 0x5A827999;
			} else if (i < 40) {
				f = b ^ c ^ d;
				k = 0x6ED9EBA1;
			} else if (i < 60) {
				f = b & c | b & d | c & d;
				k = 0x8F1BBCDC;
			} else {
				f = b ^ c ^ d;
				k = 0xCA62C1D6;
			}
			t = (((a << 5) | (a >>> 27)) + f + e + k + w) & (~0);
			e = d;
			d = c;
			c = (b << 30) | (b >>> 2);
			b = a;
			a = t;
		}
		h1 = (h1 + a) & (~0);
		h2 = (h2 + b) & (~0);
		h3 = (h3 + c) & (~0);
		h4 = (h4 + d) & (~0);
		h5 = (h5 + e) & (~0);
	}
	function pushByte(byte) {
		word  = (word << 8) | byte;
		iw = (iw + 1) & 3;
		if (!iw) {
			chunk[ic] = word;
			word = 0;
			ic = (ic + 1) & 15;
			if (!ic)
				readChunk();
		}
	}
	for (var i=0; i<input.length; ++i)
		pushByte(input[i]);
	pushByte(0x80);
	while (iw || ic != 14)
		pushByte(0);
	var nBits = input.length * 8;
	chunk[14] = Math.floor(nBits / ((1<<30) * 4)) & (~0);
	chunk[15] = nBits & (~0);
	readChunk();
	return [
		(h1 >> 24) & 0xFF, (h1 >> 16) & 0xFF, (h1 >> 8) & 0xFF, h1 & 0xFF,
		(h2 >> 24) & 0xFF, (h2 >> 16) & 0xFF, (h2 >> 8) & 0xFF, h2 & 0xFF,
		(h3 >> 24) & 0xFF, (h3 >> 16) & 0xFF, (h3 >> 8) & 0xFF, h3 & 0xFF,
		(h4 >> 24) & 0xFF, (h4 >> 16) & 0xFF, (h4 >> 8) & 0xFF, h4 & 0xFF,
		(h5 >> 24) & 0xFF, (h5 >> 16) & 0xFF, (h5 >> 8) & 0xFF, h5 & 0xFF
	];
}

function sha1(str) {
	var output = SHA1(UTF8Encode(str));
	var val, str = "";
	for (var i=0; i<output.length; ++i) {
		val = output[i];
		str += val < 16 ? "0" + val.toString(16) : val.toString(16);
	}
	return str;
}