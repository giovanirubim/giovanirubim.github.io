const EARTH_RADIUS = 6.371e6;

const sin = (deg) => Math.sin(deg*(Math.PI/180));
const cos = (deg) => Math.cos(deg*(Math.PI/180));
const tan = (deg) => Math.tan(deg*(Math.PI/180));

const fixAngle = (angle) => angle < 180 ? angle : angle - 360;
const acos = (cos) => Math.acos(cos)*(180/Math.PI);
const asin = (sin) => Math.asin(sin)*(180/Math.PI);
const atan = (tan) => Math.atan(tan)*(180/Math.PI);

const getAngle = (ndx, ndy) => {
	return ndy >= 0 ? acos(ndx) : 360 - acos(ndx);
};

const maps = {
	nAzimuthal: {
		name: 'Azimuthal (north)',
		ratio: 1,
		toNormal: (lat, long) => {
			const radius = 0.5 - lat/180;
			const dx = sin(long)*radius;
			const dy = - cos(long)*radius;
			return [ dx, dy ];
		},
		toCoord: (dx, dy) => {
			const radius = Math.sqrt(dx*dx + dy*dy);
			if (radius === 0) return [ 90, 0 ];
			const lat = (1 - radius*2)*90;
			const ndx = - dy/radius;
			const ndy = dx/radius;
			const long = fixAngle(getAngle(ndx, ndy));
			return [ lat, long ];
		},
	},
	mercator: {
		name: "Mercator",
		ratio: 1,
		toNormal: (lat, long) => [
			long/180,
			Math.log(tan(45 + lat/2))/Math.PI,
		],
		toCoord: (nx, ny) => [
			(atan(Math.exp((ny)*Math.PI)) - 45)*2,
			nx*180,
		],
	},
	sAzimuthal: {
		name: 'Azimuthal (south)',
		ratio: 1,
		toNormal: (lat, long) => {
			const radius = 0.5 + lat/180;
			const dx = sin(long)*radius;
			const dy = cos(long)*radius;
			return [ dx, dy ];
		},
		toCoord: (dx, dy) => {
			const radius = Math.sqrt(dx*dx + dy*dy);
			if (radius === 0) return [ -90, 0 ];
			const lat = radius*180 - 90;
			const ndx = dy/radius;
			const ndy = dx/radius;
			const long = fixAngle(getAngle(ndx, ndy));
			return [ lat, long ];
		},
	},
	cAzimuthal: {
		name: 'Azimuthal (custom)',
		ratio: 1,
		toNormal: (lat, long) => {
			let [x, y, z] = coordToXyz(lat, long);
			const cos_long = cos(- targeted[1]);
			const sin_long = sin(- targeted[1]);
			const cos_lat = cos(- targeted[0]);
			const sin_lat = sin(- targeted[0]);
			[x, z] = [
				cos_long*x + sin_long*z,
				cos_long*z - sin_long*x,
			];
			[y, z] = [
				cos_lat*y + sin_lat*z,
				cos_lat*z - sin_lat*y,
			];
			[y, z] = [z, -y];
			const coord = xyzToCoord(x, y, z);
			return maps.nAzimuthal.toNormal(...coord);
		},
		toCoord: (nx, ny) => {
			let [lat, long] = maps.nAzimuthal.toCoord(nx, ny);
			let [x, y, z] = coordToXyz(lat, long);
			const cos_long = cos(targeted[1]);
			const sin_long = sin(targeted[1]);
			const cos_lat = cos(targeted[0]);
			const sin_lat = sin(targeted[0]);
			[y, z] = [-z, y];
			[y, z] = [
				cos_lat*y + sin_lat*z,
				cos_lat*z - sin_lat*y,
			];
			[x, z] = [
				cos_long*x + sin_long*z,
				cos_long*z - sin_long*x,
			];
			return xyzToCoord(x, y, z);
		},
	},
	gallpeters: {
		name: 'Gall-Peters',
		ratio: Math.PI/2,
		toNormal: (lat, long) => {
			const x = long/180;
			const y = sin(lat);
			return [ x, y ];
		},
		toCoord: (x, y) => {
			const lat = fixAngle(asin(y));
			const long = x*180;
			return [ lat, long ];
		},
	},
	grid: {
		name: 'Grid',
		ratio: 2,
		toNormal: (lat, long) => {
			return [ long/180, lat/90 ];
		},
		toCoord: (x, y) => {
			return [ y*90, x*180 ];
		},
	},
};

const calcXyzMidPoint = (ax, ay, az, bx, by, bz) => {
	let x = (ax + bx)/2;
	let y = (ay + by)/2;
	let z = (az + bz)/2;
	const mul = 1/Math.sqrt(x*x + y*y + z*z);
	x *= mul;
	y *= mul;
	z *= mul;
	return [ x, y, z ];
};

const segmentLine = (ax, ay, az, bx, by, bz, maxDist) => {
	const dist = calcXyzDist(ax, ay, az, bx, by, bz);
	if (dist <= maxDist) {
		return [[ bx, by, bz ]];
	}
	const m = calcXyzMidPoint(ax, ay, az, bx, by, bz);
	const a = segmentLine(ax, ay, az, ...m, maxDist);
	const b = segmentLine(...m, bx, by, bz, maxDist);
	return [ ...a, ...b ];
};

const coordToXyz = (lat, long) => {
	const y = sin(lat);
	const rad = cos(lat);
	const x = sin(long)*rad;
	const z = cos(long)*rad;
	return [x, y, z];
};

const xyzToCoord = (x, y, z) => {
	const lat = asin(y);
	const rad = Math.sqrt(x*x + z*z);
	const long = rad === 0 ? 0 : (
		x >= 0? acos(z/rad) : -acos(z/rad)
	);
	return [ lat, long ];
};

const calcXyzDist = (ax, ay, az, bx, by, bz) => {
	const dx = bx - ax;
	const dy = by - ay;
	const dz = bz - az;
	return Math.sqrt(dx*dx + dy*dy + dz*dz);
};

const xyzDistToSurfDist = (xyzDist) => {
	const halfRadAngle = Math.asin(xyzDist/2);
	const radAngle = 2*halfRadAngle;
	return radAngle*EARTH_RADIUS;
};

const calcCoordSurfDist = (aLat, aLong, bLat, bLong) => {
	const [ax, ay, az] = coordToXyz(aLat, aLong);
	const [bx, by, bz] = coordToXyz(bLat, bLong);
	const xyzDist = calcXyzDist(ax, ay, az, bx, by, bz);
	return xyzDistToSurfDist(xyzDist);
};
