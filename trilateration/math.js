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
const ALIGN_TIME = new Date('2022-07-01 05:23:00 +0');
const SID_DAY = 86164.09053820801;

Array.prototype.cs = function() { return this.map(x => x*TO_DEG).join(', '); };

const calcLongitude = (time, ra) => {
	const shift = (ALIGN_TIME - time)/1000/SID_DAY%1*360;
	const angle = ra + shift;
	return (angle%360 + 360 + 180)%360 - 180;
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
	const arc = chordToArcRadians(chord, AV_RAD);
	return arc*AV_RAD;
};

const chordToArcRadians = (chord, radius) => {
	return Math.asin(chord/radius/2)*2;
};

const arcRadiansToChord = (arc, radius) => {
	return Math.sin(arc/2)*radius*2;
};

const arcRadiansToHump = (arc, radius) => {
	return radius*(1 - Math.cos(arc/2));
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

const calcErrorFn = (args) => {
	const p = args.map(data => data.gp.map(val => val*TO_RAD));
	const d = args.map(data => data.distance);
	const calcError = (coord) => {
		let sum = 0;
		for (let i=args.length; i--;) {
			const error = calcSphereDistance(coord, p[i]) - d[i];
			sum += error*error;
		}
		return sum;
	};
	return calcError;
};

const getCircleOfEqualAltitude = (center, altitude, numberOfPoints) => {
	const angleStep = Math.PI*2/numberOfPoints;
	const arc = QUART_CIRC - altitude;
	for (let i=0; i<=numberOfPoints; ++i) {
		const angle = i*angleStep;
		const sin = Math.sin(angle);
		const cos = Math.cos(angle);
	}
};
