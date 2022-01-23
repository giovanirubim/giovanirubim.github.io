const { PI, sin, cos, asin, acos, sqrt } = Math;
const QUART_CIRC = PI/2;
const HALF_CIRC = PI;

const mulMat3Mat3 = (a, b, r) => {
	const r0 = a[0]*b[0] + a[1]*b[3] + a[2]*b[6];
	const r1 = a[0]*b[1] + a[1]*b[4] + a[2]*b[7];
	const r2 = a[0]*b[2] + a[1]*b[5] + a[2]*b[8];
	const r3 = a[3]*b[0] + a[4]*b[3] + a[5]*b[6];
	const r4 = a[3]*b[1] + a[4]*b[4] + a[5]*b[7];
	const r5 = a[3]*b[2] + a[4]*b[5] + a[5]*b[8];
	const r6 = a[6]*b[0] + a[7]*b[3] + a[8]*b[6];
	const r7 = a[6]*b[1] + a[7]*b[4] + a[8]*b[7];
	const r8 = a[6]*b[2] + a[7]*b[5] + a[8]*b[8];
	r[0] = r0;
	r[1] = r1;
	r[2] = r2;
	r[3] = r3;
	r[4] = r4;
	r[5] = r5;
	r[6] = r6;
	r[7] = r7;
	r[8] = r8;
};

const mulVec3Mat3 = (v, m, r) => {
	const r0 = v[0]*m[0] + v[1]*m[3] + v[2]*m[6];
	const r1 = v[0]*m[1] + v[1]*m[4] + v[2]*m[7];
	const r2 = v[0]*m[2] + v[1]*m[5] + v[2]*m[8];
	r[0] = r0;
	r[1] = r1;
	r[2] = r2;
};

const coordToEuclidian = (lat, long, dst) => {
	const rad = cos(lat);
	dst[0] = sin(long)*rad;
	dst[1] = sin(lat);
	dst[2] = cos(long)*rad;
	return dst;
};

const euclidianToCoord = (x, y, z, dst) => {
	const sqrx = x*x;
	const sqrz = z*z;
	const sqrxz = sqrx + sqrz;
	const length3d = sqrt(sqrxz + y*y);
	const length2d = sqrt(sqrxz);
	dst[0] = asin(y/length3d);
	dst[1] = x >= 0 ? acos(z/length2d) : - acos(z/length2d);
	return dst;
};

const euclidianDistance = (ax, ay, az, bx, by, bz) => {
	const dx = bx - ax;
	const dy = by - ay;
	const dz = bz - az;
	return Math.sqrt(dx*dx + dy*dy + dz*dz);
};

class Vec3Type extends Float64Array {
	constructor() {
		super(3);
	}
	set(x, y, z) {
		this[0] = x;
		this[1] = y;
		this[2] = z;
		return this;
	}
	clone(vec3 = new Vec3Type()) {
		vec3[0] = this[0];
		vec3[1] = this[1];
		vec3[2] = this[2];
		return this;
	}
	apply(mat3, dst = this) {
		mulVec3Mat3(this, mat3, dst);
		return dst;
	}
	length() {
		const [ x, y, z ] = this;
		return sqrt(x*x + y*y + z*z);
	}
	sub(other, dst = this) {
		dst[0] = this[0] - other[0];
		dst[1] = this[1] - other[1];
		dst[2] = this[2] - other[2];
		return dst;
	}
	toEuclidian(dst = this) {
		const [ lat, long ] = this;
		coordToEuclidian(lat, long, dst);
		return dst;
	}
	toCoord(dst = this) {
		const [ x, y, z ] = this;
		euclidianToCoord(x, y, z, dst);
		return dst;
	}
	scale(value, dst = this) {
		this[0] = dst[0]*value;
		this[1] = dst[1]*value;
		this[2] = dst[2]*value;
		return dst;
	}
	get x() { return this[0]; }
	set x(value) { this[0] = value; }
	get y() { return this[1]; }
	set y(value) { this[1] = value; }
	get z() { return this[2]; }
	set z(value) { this[2] = value; }
	get lat() { return this[0]; }
	set lat(value) { this[0] = value; }
	get long() { return this[1]; }
	set long(value) { this[1] = value; }
}

class Mat3Type extends Float64Array {
	constructor() {
		super(9);
		this[0] = 1;
		this[4] = 1;
		this[8] = 1;
	}
	buildCoordRotation(lat, long) {
		const sin_lat = sin(lat);
		const cos_lat = cos(lat);
		const sin_long = sin(long);
		const cos_long = cos(long);
		this[0] = cos_long;
		this[1] = 0;
		this[2] = - sin_long;
		this[3] = - sin_lat*sin_long;
		this[4] = cos_lat;
		this[5] = - sin_lat*cos_long;
		this[6] = cos_lat*sin_long;
		this[7] = sin_lat;
		this[8] = cos_lat*cos_long;
		return this;
	}
}

export const Vec3 = (x = 0, y = 0, z = 0) => new Vec3Type().set(x, y, z);
export const Mat3 = () => new Mat3Type();

export const getCoordCircle = (lat, long, radius, numberOfPoints = 32) => {
	const mat = Mat3().buildCoordRotation(lat, long);
	const rad = Math.sin(radius);
	const z = Math.cos(radius);
	const step = Math.PI*2/numberOfPoints;
	const vec = Vec3(0, 0, z);
	const points = [];
	for (let i=0; i<numberOfPoints; ++i) {
		const angle = step*i;
		const x = Math.cos(angle)*rad;
		const y = Math.sin(angle)*rad;
		vec.set(x, y, z);
		vec.apply(mat);
		vec.toCoord();
		points.push([ vec[0], vec[1] ]);
	}
	return points;
};

export const arcLengthBetweenCoords = (aLat, aLong, bLat, bLong) => {
	const aux = new Array(3);
	const [ ax, ay, az ] = coordToEuclidian(aLat, aLong, aux);
	const [ bx, by, bz ] = coordToEuclidian(bLat, bLong, aux);
	const chord = euclidianDistance(ax, ay, az, bx, by, bz);
	return asin(chord/2)*2;
};

export const findMinErrorCoord = (calcError, iterations = 40) => {
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

export const trilaterationErrorFunction = (args) => {
	const calcError = (coord) => {
		let sum = 0;
		for (let i=args.length; i--;) {
			const { gp, arc } = args[i];
			const error = arcLengthBetweenCoords(...coord, ...gp) - arc;
			sum += error*error;
		}
		return sum;
	};
	return calcError;
};

export const trilaterate = (args) => {
	const calcError = trilaterationErrorFunction(args);
	return findMinErrorCoord(calcError);
};
