const { PI, sqrt } = Math;
const TAU = PI*2;
const R = 6371e3;
const C = R*TAU;
const sqr = (x) => x*x;

const inToM = 0.0254;
const mToIn = 1/inToM;
const miToM = 1609.344;
const mToMi = 1/miToM;
const mToFt = 3.28084;
const ftToM = 1/mToFt;
const cos = Math.cos;
const sin = Math.sin;
const tan = Math.tan;
const asin = Math.asin;

const hToPl = (h) => (sqrt(4*(R*R + h*h)))/2 - R;
const sToPl = (s) => hToPl(tan(s/R)*R);
const hToPe = (h) => R*(1 - cos(asin(h/R)));
const sToPe = (s) => R*(1 - cos(s/R));
const funFE = (x) => sqr(x*mToMi)*8*inToM;
const sagitta = (sd) => (1 - cos(sd/R/2))*R;

const units = [

	[1e3, 'km'],
	[1, 'm'],
	[1e-2, 'cm'],
	[1e-3, 'mm'],

	// [1609.34, 'mi'],
	// [0.9144, 'yd'],
	// [0.3048, 'ft'],
	// [0.0254, 'in'],

];

const toStr = (x) => {
	let selected;
	for (let pair of units) {
		selected = pair;
		if (x >= pair[0]) break;
	}
	const [ scale, name ] = selected;
	return ((x/scale).toPrecision(6)*1) + name;
};
