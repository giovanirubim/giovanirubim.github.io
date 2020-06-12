const utf8ToString = (bytes) => {
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
}

const w1252ToString = (bytes) => {
	let string = '';
	bytes.forEach(byte => string += String.fromCharCode(byte));
	return string;
};

const validUtf8 = array => {
	const {length} = array;
	for (let i=0; i<length;) {
		const head = array[i++];
		if (head < 0b10000000) continue;
		if (head <= 0b11000000 || head >= 0b11110000 || head == 0b11100000) return false;
		if (array[i++] >>> 6 !== 0b10) return false;
		if (head < 0b11100000) continue;
		if (array[i++] >>> 6 !== 0b10) return false;
	}
	return true;
};

const subs = [];
const parseTime = (str) => {
	const [h, m, s] = str.split(':');
	return h*(3600000) + m*60000 + s.replace(',','.')*1000;
};

const dumpTime = (time) => {
	time = Math.round(time);
	const ms = time%60000;
	time = Math.round((time - ms)/60000);
	const m = time%60;
	const h = Math.round((time - m)/60);
	const s = ms.toString().padStart(5, '0');
	return `${
		(h+'').padStart(2, '0')
	}:${
		(m+'').padStart(2, '0')
	}:${
		s.substr(0, 2)
	},${
		s.substr(2, 3)
	}`;
};

const setSrc = (src) => {
	subs.length = 0;
	if (validUtf8(src)) {
		src = utf8ToString(src);
	} else {
		src = w1252ToString(src);
	}
	src = src.replace(/\r/g, '').trim();
	src.split('\n\n').forEach(str => {
		let [ num, time, ...lines ] = str.trim().split('\n');
		time = time.split(' --> ');
		const a = parseTime(time[0]);
		const b = parseTime(time[1]);
		subs.push({ num, a, b, lines });
	});
};

const download = () => {
	let result = '';
	subs.forEach(({ num, a, b, lines }) => {
		result += num + '\r\n';
		result += `${ dumpTime(a) } --> ${ dumpTime(b) }\r\n`;
		result += lines.join('\r\n') + '\r\n\r\n';
	});
	const a = document.createElement("a");
	a.style.display = "none";
	document.body.appendChild(a);
	a.href = window.URL.createObjectURL(new Blob([result]));
	a.setAttribute("download", 'subtitle.srt');
	a.click();
	window.URL.revokeObjectURL(a.href);
	document.body.removeChild(a);
};

$(document).ready(() => {
	$('input').on('change', function(){
		const [file] = this.files;
		const reader = new FileReader();
		reader.onload = () => setSrc(new Uint8Array(reader.result));
		reader.readAsArrayBuffer(file);
	});
});