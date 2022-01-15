const AV_RAD = 6371230.0;
const EQ_RAD = 6378137.0;
const PO_RAD = 6356752.3;

const { PI, sqrt, cos, sin, tan, acos, asin } = Math;
const TO_RAD = PI/180;
const TO_DEG = 180/PI;
const TAU = PI*2;
const QUART_CIRC = PI/2;
const OCT_CIRC = PI/4;
const HALF_CIRC = PI;
const MI_TO_M = 1609.34;
const M_TO_MI = 1/MI_TO_M;
const NM_TO_M = 1852;
const M_TO_NM = 1/NM_TO_M;
const MI_TO_NM = MI_TO_M/NM_TO_M;
const NM_TO_MI = NM_TO_M/MI_TO_M;
const ALIGN_TIME = new Date('2022-01-14T16:23:32.7Z');
const SID_DAY = 86164.09053820801;
const STARS = {
	acrux: [ -173.0399166666666, -63.22683333333334 ],
};

Array.prototype.cs = function() { return this.map(x => x*TO_DEG).join(', '); };

const calcLongitude = (time, ra) => {
	const shift = (ALIGN_TIME - time)/1000/SID_DAY%1*360;
	const angle = ra + shift;
	return (angle%360 + 360 + 180)%360 - 180;
};

const parseAngle = (arg) => {
	const src = ('' + arg).trim();
	let str = src;
	let signal = 1;
	const nsew = /(^[NSEWnsew])|([NSEWnew]$)/g;
	const sw = /(^[SWsw])|([SWw]$)/g;
	if (nsew.test(str)) {
		if (sw.test(str)) {
			signal = -1;
		}
		str = str.replace(nsew).trim();
	}
	if (str.startsWith('-')) {
		str = str.substring(1);
		signal = -1;
	}
	const split = str.split(/\s+|['"°]|[a-z]+/).map(x => x || '0');
	const parsed = split.map((x, i) => x*Math.pow(60, -i));
	const rawValue = parsed.reduce((a, b) => a + b);
	if (/^\d+\s*h/i.test(src)) {
		let angle = rawValue/24*360;
		const res = (angle*signal%360 + 180)%360 - 180;
		if (res === -180) return 180;
		return res;
	}
	return rawValue*signal;
};

const coord = (lat, long) => [ lat*TO_RAD, long*TO_RAD ];

const calcEllipseSurfacePoint = (angle) => {
	const slope = tan(angle);
	const a = slope/PO_RAD;
	const x = sqrt(1/(1/(EQ_RAD*EQ_RAD) + a*a));
	const y = x*slope;
	return [ x, y ];
};

const spheroidCoordToEuclidian = ([ lat, long ]) => {
	const ellipsePoint = calcEllipseSurfacePoint(lat);
	const [ radius, y ] = ellipsePoint;
	const x = sin(long)*radius;
	const z = cos(long)*radius;
	return [ x, y, z ];
};

const sphereCoordToEuclidian = ([ lat, long ]) => {
	const rad = cos(lat)*AV_RAD;
	const y = sin(lat)*AV_RAD;
	const x = sin(long)*rad;
	const z = cos(long)*rad;
	return [ x, y, z ];
};

const calcEuclidianDistance = ([ ax, ay, az ], [ bx, by, bz ]) => {
	const dx = bx - ax;
	const dy = by - ay;
	const dz = bz - az;
	return sqrt(dx*dx + dy*dy + dz*dz);
};

const calcSphereDistance = (a, b) => {
	const chord = calcEuclidianDistance(
		sphereCoordToEuclidian(a),
		sphereCoordToEuclidian(b),
	);
	const arc = chordToArchRadians(chord, AV_RAD);
	return arc*AV_RAD;
};

const chordToArchRadians = (chord, radius) => {
	return Math.asin(chord/radius/2)*2;
};

const euclidianToSphereCoord = ([ x, y, z ]) => {
	const xSqr = x*x;
	const ySqr = y*y;
	const zSqr = z*z;
	const length3d = sqrt(xSqr + ySqr + zSqr);
	const length2d = sqrt(xSqr + zSqr);
	const lat = asin(y/length3d);
	const long = z >= 0 ? acos(z/length2d) : PI - acos(z/length2d);
	return [ lat, long ];
};

const findMinErrorCoord = (calcError, iterations = 40) => {
	let currentCoord = [0, 0];
	let maxChange = 1;
	for (let i=0; i<iterations; ++i) {
		maxChange /= 2;
		let currentError = null;
		const latShift = maxChange*QUART_CIRC;
		const longShift = maxChange*HALF_CIRC;
		const copy = currentCoord.slice();
		for (let j=0; j<4; ++j) {
			const bit0 = j&1;
			const bit1 = j >> 1;
			const lat  = copy[0] + (2*bit0 - 1)*latShift;
			const long = copy[1] + (2*bit1 - 1)*longShift;
			const coord = [ lat, long ];
			const error = calcError(coord);
			if (error < currentError || j === 0) {
				currentError = error;
				currentCoord = coord;
			}
		}
	}
	return currentCoord;
};

const sphereTrilateration = ({ p1, d1, p2, d2, p3, d3 }) => {
	[ p1, p2, p3 ] = [ p1, p2, p3 ].map(pair => pair.map(x => x*TO_RAD));
	const calcError = (coord) => {
		const e1 = calcSphereDistance(coord, p1) - d1;
		const e2 = calcSphereDistance(coord, p2) - d2;
		const e3 = calcSphereDistance(coord, p3) - d3;
		return e1*e1 + e2*e2 + e3*e3;
	};
	return findMinErrorCoord(calcError);
};

// Target: -25.493107248527046, -54.54828245953229
// - Name: Acrux
//   Time: 2022-01-16 00:10:45 -4
//   Alt: 34 34 12.4
//   RA/DEC: 12h27m49.90s / -63°12'53.8"
//   GP: -63.21494444444445, 8.686953550845942
//   Distance: 6159369
// - Name: Betelgeuse
//   Time: 2022-01-16 00:20:02 -4
//   Alt: 41 16 53.8
//   RA/DEC: 5h56m22.35s/+7 24 35.6
//   GP: 7.409888888888889, -91.50502568023978
//   Distance: 5413587
// - Name: Canopus
//   Time: 2022-01-16 00:28:54 -4
//   Alt: +53 38 54.6
//   RA/DEC: 6h24m28.25s / -52 42 32.6
//   GP: -52.70905555555556, -86.70317804577718
//   Distance: 4039378

