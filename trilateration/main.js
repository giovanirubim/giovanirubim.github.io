let textarea;
let paper;
let usingDecimals = false;

const stringifyDegree = (degree) => {
	if (usingDecimals) {
		return degree.toFixed(6)*1 + '';
	}
	let neg = degree < 0;
	let total = Math.abs(degree) * 3600;
	let sec = total % 60;
	total = Math.round((total - sec)/60);
	let min = total % 60 + '';
	let hr = Math.round((total - min)/60) + '';
	return `${neg?'-':''}${hr}°${min.padStart(2,0)}'${sec.toFixed(2).padStart(5,0)}"`;
};

const stringifyCoord = (lat, long) => {
	lat = stringifyDegree(lat);
	long = stringifyDegree(long);
	if (usingDecimals) {
		return `${lat}, ${long}`;
	}
	if (lat.startsWith('-')) {
		lat = lat.replace(/^-/, '') + 'S';
	} else {
		lat += 'N';
	}
	if (long.startsWith('-')) {
		long = long.replace(/^-/, '') + 'W';
	} else {
		long += 'E';
	}
	return `${lat}, ${long}`;
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

const addLine = (line) => {
	paper.innerText += line;
	paper.innerHTML += '<br>';
};

const starNameMatches = (a, b) => {
	a = a.replace(/[^a-zA-Z]/g, '').toLowerCase();
	b = b.replace(/[^a-zA-Z]/g, '').toLowerCase();
	return a === b;
};

const solve = () => {
	paper.innerHTML = '';
	let star = null;
	let time = undefined;
	const stars = [];
	const lines = textarea.value.trim().split(/\s*\n\s*/)
	for (let line of lines) {
		const [, field, value ] = line.toLowerCase().match(/^(.*?)\s*:\s*(.*)$/);
		if (field === 'star') {
			star = { name: value, time };
			stars.push(star);
			continue;
		}
		if (field === 'time') {
			const str = value
				.replace(/utc/i, '')
				.replace(/\s+/g, '\x20');
			time = star.time = new Date(str);
			continue;
		}
		if (field === 'ra/dec') {
			let [ ra, dec ] = value.split(/\s*\/\s*/).map(parseAngle);
			star.ra = ra;
			star.dec = dec;
			continue;
		}
		if (field === 'alt') {
			star.alt = parseAngle(value.trim());
			continue;
		}
	}
	let args = [];
	for (let i=0; i<stars.length; ++i) {
		const star = stars[i];
		let { ra, dec: lat, time, name } = star;
		if (paper.innerText) {
			paper.innerHTML += '<br>';
		}
		addLine(`- ${name.toUpperCase()} -`)
		if (ra == null || lat == null) {
			let [, radec ] = Object.entries(almanac).find(entry => starNameMatches(entry[0], name));
			addLine('RA/DEC = ' + radec);
			[ ra, lat ] = radec.split(/\s*\/\s*/).map(parseAngle);
		}
		const long = calcLongitude(time, ra);
		addLine(`GP = ${stringifyCoord(lat, long)}`);
		const alt = star.alt.toFixed(4)*1;
		const angle = (90 - alt).toFixed(4)*1;
		addLine(`ALT = ${alt}° // 90° - ${alt}° = ${angle}°`);
		const nm = (90 - star.alt)*60;
		const meters = nm*NM_TO_M;
		addLine(`${angle}*60 NM = ${nm.toFixed(3)*1} NM = ${(nm*NM_TO_MI).toFixed(3)*1} MI`);
		args.push({
			gp: [ lat, long ],
			distance: meters,
		});
	}
	addLine('');
	const calcError = calcErrorFn(args);
	const [ lat, long ] = findMinErrorCoord(calcError).map(x => x*TO_DEG);
	addLine(`RESULT = ${stringifyCoord(lat, long)}`);
};

window.addEventListener('load', async () => {
	paper = document.querySelector('#paper');
	textarea = document.querySelector('textarea');
	textarea.value = example;
	textarea.oninput = () => {
		try {
			solve();
		} catch(err) {
			addLine('');
			addLine('Ops, something wrong with the input data');
		}
	};
	document.querySelector('[name="decimals"]').oninput = function() {
		usingDecimals = this.checked;
		solve();
	};
	solve();
});
