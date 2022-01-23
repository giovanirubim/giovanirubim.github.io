import * as Almanac from './almanac.js';
import { trilaterate } from './math.js';

let inputData;
let paper;
let inputDecimals;
let useDecimals = false;

const args = [];
const NM_TO_MI = 1852/1609.344;
const DEG_TO_RAD = Math.PI/180;
const RAD_TO_DEG = 180/Math.PI;

const strFloat = (val, decs = 4) => (val*1).toFixed(decs)*1 + '';
const strAngle = (val) => {
	if (useDecimals) {
		return strFloat(val, 4);
	}
	const sign = val >= 0 ? '' : '-';
	const totalSec = Math.round(Math.abs(val * 3600));
	const s = totalSec % 60;
	const totalMin = Math.round((totalSec - s)/60);
	const m = totalMin % 60;
	const h = Math.round((totalMin - m)/60);
	return sign + `${
		h
	}°${
		m.toString().padStart(2, '0')
	}'${
		s.toString().padStart(2, '0')
	}"`
};
const strLat = (val) => {
	let str = strAngle(val);
	if (str.startsWith('-')) {
		str += 'S';
	} else {
		str += 'N';
	}
	str = str.replace(/^[+\-]\s*/, '');
	return str;
};
const strLong = (val) => {
	let str = strAngle(val);
	if (str.startsWith('-')) {
		str += 'W';
	} else {
		str += 'E';
	}
	str = str.replace(/^[+\-]\s*/, '');
	return str;
};

const hourRegex = /^(\d+\s*h\s*\d+(\s*m(\s*\d+(\.\d+)?(\s*s)?)?)?)$/i;
const degreeRegexes = [
	/^(([+\-]\s*)?\d+(\s+\d+(\s+\d+(\.\d+)?)?)?)$/,
	/^(([+\-]\s*)?\d+(\s*°\s*\d+(\s*'\s*\d+(\.\d+)?"?)?)?)$/,
];
const floatRegex = /^(([+\-]\s*)?\d+(\.\d+)?)$/;

const parseHours = (str) => str
	.replace(/\s*([hms:])\s*/ig, '$1')
	.split(/[hms:\s]/)
	.map((val, i) => val*Math.pow(60, -i))
	.reduce((a, b) => a + b);

const parseDegrees = (str) => {
	const sign = str.startsWith('-') ? -1 : 1;
	const abs = str
		.replace(/^[+\-]\s*/, '')
		.replace(/\s*([°'"+\-])\s*/ig, '$1')
		.split(/[°'"\s]/)
		.map((val, i) => val*Math.pow(60, -i))
		.reduce((a, b) => a + b);
	return abs*sign;
};

const example = `

	Star: Antares
	Time: 2022-01-15 00:57:38 UTC-4
	RA/DEC: 16h30m43.64s / -26 28 43.2
	ALT: 50.868722

	Star: Arcturus
	Time: 2022-01-15 01:07:06 UTC-4
	RA/DEC: 14h16m39.27s / 19.06511
	ALT: +35°50'16"

	Star: Vega
	Time: 2022-01-15 01:13:20 UTC-4
	RA/DEC: 18h37m38.64s / 38°48'09.5"
	ALT: 58 15 35.4

`.trim().replace(/[\t\x20]*\n[\t\x20]*/g, '\n');

const clearPaper = () => {
	paper.innerHTML = '';
};

const addPaperLine = (line) => {
	paper.innerText += line.toUpperCase();
	paper.innerHTML += '<br>';
};

const timeRegex = /^(\d+-\d+-\d+\s+\d+:\d+(:\d+(\.\d+)?)?(\s+(UTC|GMT)?\s*[\-+]\d+(:\d+)?)?)$/i;
const parseTime = (time) => {
	if (!timeRegex.test(time)) {
		throw `
			Bad time format
			It should be something like
			2022-01-22 21:32:50 +2:30
		`;
	}
	const date = new Date(time);
	if (isNaN(date*1)) {
		throw 'This date/time doesn\'t seem to exist';
	}
	return date;
};

const parseRa = (ra) => {
	if (!hourRegex.test(ra)) {
		throw `
			Bad right ascension format "${ra}"
			It should be something like
			18h52m32.5s or 18:52
		`;
	}
	return parseHours(ra);
};

const parseDec = (dec) => {
	if (floatRegex.test(dec)) {
		return Number(dec);
	}
	if (!degreeRegexes.find(regex => regex.test(dec))) {
		throw `
			Bad declination format "${dec}"
			It should be something like
			-26 28 43.2 or 38°48'09.5" or 13.94217
		`;
	}
	return parseDegrees(dec);
};

const parseRaDec = (radec) => {
	if (!radec.includes('/')) {
		throw `
			Bad RA/DEC format
			It should be something like
			18h52m32.5s / -26°28'43.2"
		`;
	}
	const [ ra, dec ] = radec.trim().split(/\s*\/\s*/);
	return [
		parseRa(ra),
		parseDec(dec),
	];
};

const parseAlt = (alt) => {
	if (floatRegex.test(alt)) {
		return Number(alt);
	}
	if (!degreeRegexes.find(regex => regex.test(alt))) {
		throw `
			Bad altitude angle format "${alt}"
			It should be something like
			26 28 43.2 or 38°48'09.5" or 13.94217
		`;
	}
	return parseDegrees(alt);
};

const processStar = (star) => {
	let { name, radec, alt, time } = star;
	addPaperLine(`- ${name} -`);
	time = parseTime(time);
	if (radec == null) {
		radec = Almanac.findRaDec(name);
		if (radec == null) {
			throw `Did not find the RA/DEC for ${name} in the almanac\nPlease provide the RA/DEC`;
		}
	}
	let [ ra, dec ] = parseRaDec(radec);
	let lat = dec;
	let long = Almanac.calcLongitude(ra, time);
	addPaperLine(`GP = ${strLat(lat)}, ${strLong(long)}`);
	alt = parseAlt(alt);
	let arc = 90 - alt;
	addPaperLine(`alt = ${
		strFloat(alt)
	}° // 90° - ${
		strFloat(alt)
	}° = ${
		strFloat(arc)
	}°`);
	let nms = arc*60;
	let miles = nms*NM_TO_MI;
	addPaperLine(`${
		strFloat(arc)
	}*60 nm = ${
		strFloat(nms, 1)
	} nm = ${
		strFloat(miles, 1)
	} mi`);
	addPaperLine('');
	args.push({
		gp: [ lat*DEG_TO_RAD, long*DEG_TO_RAD ],
		arc: arc*DEG_TO_RAD,
	});
};

const doCalculations = () => {
	args.length = 0;
	const lines = inputData.value.toLowerCase().trim().split(/\s*\n\s*/);
	let current_star = null;
	let current_time = null;
	const stars = [];
	for (let line of lines) {
		const [, field, value ] = line.match(/^([^:]+?)\s*:\s*(.*)$/) ?? [];
		if (field == null || value == null) {
			throw `Unprocessable line "${line}"`;
		}
		if (field === 'star') {
			if (current_star != null) {
				processStar(current_star);
			}
			current_star = { name: value, time: current_time };
			stars.push(current_star);
			continue;
		}
		if (/ra\s*\/\s*dec/i.test(field)) {
			current_star.radec = value;
			continue;
		}
		if (field === 'time') {
			current_star.time = value;
			continue;
		}
		if (field === 'alt') {
			current_star.alt = value;
			continue;
		}
		throw `Unknown field "${field}"`;
	}
	processStar(current_star);
	const result = trilaterate(args);
	addPaperLine(`result = ${
		strLat(result[0]*RAD_TO_DEG)
	}, ${
		strLong(result[1]*RAD_TO_DEG)
	}`)
};

const updateCalculations = () => {
	clearPaper();
	try {
		doCalculations();
	} catch(error) {
		if (typeof error === 'string') {
			addPaperLine(error.trim().replace(/\s*\n\s*/g, '\n'));
		} else {
			addPaperLine('Oops, there was some issue during the calculations');
			addPaperLine('But you can check the console');
			console.error(error);
		}
	}
};

window.addEventListener('load', async () => {
	inputData = document.querySelector('textarea');
	inputData.value = example;
	inputData.focus();
	inputData.oninput = updateCalculations;
	inputDecimals = document.querySelector('[name="decimals"]');
	inputDecimals.onchange = () => {
		useDecimals = inputDecimals.checked;
		updateCalculations();
	};
	paper = document.querySelector('#paper');
	updateCalculations();
});
