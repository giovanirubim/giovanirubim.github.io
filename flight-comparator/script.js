const width = 800;
const height = 800;
const d1 = Math.PI/180;
const d90 = Math.PI/2;
const d180 = Math.PI;
const d360 = Math.PI*2;

let canvas;
let textarea;
let ctx;
let image;

let example = `
	flight one:
	- time: 100
	- origin: -25.5, -54.55
	- destination: 0, 0
	
	second flight:
	- time: 1
	- origin: 45, 45
	- destination: -10, 0
`
.replace(/\n\t*/g, '\n')
.trim();

const parseTime = (str) => str
	.replace(/\s*[a-z:]\s*|\s+/g, '\x20')
	.trim()
	.split(/\s+/)
	.map((val, i) => val*Math.pow(60, -i))
	.reduce((a, b) => a + b);

const parseCoord = (str) => str
	.split(/\s*,\s*/)
	.map(value => value*d1);

const projectCoord = ([ lat, long ]) => {
	const rad = (d90 - lat)/d360;
	const x = 0.5 + Math.sin(long)*rad;
	const y = 0.5 + Math.cos(long)*rad;
	return [
		x*width,
		y*height,
	];
};

const loadImage = src => new Promise((done, fail) => {
	const image = new Image();
	image.onload = () => done(image);
	image.onerror = error => fail(error);
	image.src = src;
});

const parseFlights = (str) => {
	const lines = str.split('\n');
	const flights = [];
	let flight = null;
	for (let line of lines) {
		line = line.trim();
		if (line === '') {
			continue;
		}
		if (line.startsWith('-')) {
			let [ name, value ] = line
				.substring(1)
				.trim()
				.split(/\s*:\s*/);
			switch (name) {
				case 'time':        value = Number(value);     break;
				case 'origin':      value = parseCoord(value); break;
				case 'destination': value = parseCoord(value); break;
			}
			flight[name] = value;
		} else {
			const name = line.replace(/:$/, '');
			flight = { name };
			flights.push(flight);
		}
	}
	return flights;
};

const drawPoint = ([ x, y ]) => {
	ctx.beginPath();
	ctx.arc(x, y, 4, 0, d360);
	ctx.fill();
};

const drawLine = ([ ax, ay ], [ bx, by ]) => {
	ctx.beginPath();
	ctx.moveTo(ax, ay);
	ctx.lineTo(bx, by);
	ctx.stroke();
};

const processFlights = (flights) => {
	let totalTime = 0;
	let totalMapDistance = 0;
	for (let flight of flights) {
		const { name, origin, destination, time } = flight;
		const a = projectCoord(origin);
		const b = projectCoord(destination);
		flight.a = a;
		flight.b = b;
		const [ ax, ay ] = a;
		const [ bx, by ] = b;
		const dx = bx - ax;
		const dy = by - ay;
		const mapDistance = Math.sqrt(dx*dx + dy*dy);
		totalTime += flight.time;
		totalMapDistance += mapDistance;
		flight.mapDistance = mapDistance;
	}
	const scale = totalMapDistance/totalTime;
	for (let flight of flights) {
		const { time, mapDistance } = flight;
		const expectedDistance = time*scale;
		const difference = mapDistance - expectedDistance;
		flight.error = difference/expectedDistance;
	}
};

const plotFlights = (flights) => {
	ctx.lineWidth = 2;
	for (let flight of flights) {
		const { a, b, error } = flight;
		const absError = Math.abs(error);
		const alphaDif = Math.min(255, absError*255|0);
		const alpha = 255 - alphaDif;
		const color = error < 0
			? `rgb(255, ${alpha}, ${alpha})`
			: `rgb(${alpha}, ${alpha}, 255)`;
		ctx.fillStyle = color;
		ctx.strokeStyle = color;
		drawLine(a, b);
		drawPoint(a);
		drawPoint(b);
	}
};

const update = () => {
	const flights = parseFlights(textarea.value);
	processFlights(flights);
	ctx.clearRect(0, 0, width, height);
	ctx.drawImage(image, 0, 0, width, height);
	plotFlights(flights);
};

window.addEventListener('load', async () => {
	canvas = document.querySelector('canvas');
	ctx = canvas.getContext('2d');
	textarea = document.querySelector('textarea');
	textarea.value = example;
	textarea.addEventListener('input', update);
	canvas.width = width;
	canvas.height = height;
	image = await loadImage('./azimuthal-projection.png');
	update();
});
