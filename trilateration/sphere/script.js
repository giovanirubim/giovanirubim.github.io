// Global values
const { PI } = Math;
const TAU = PI*2;
const TO_RAD = PI/180;
const TO_DEG = 180/PI;
const D180 = PI;
const D360 = TAU;
const D540 = PI*3;
const D90 = PI/2;
const D45 = PI/4;
const MIN_DRAG_DIST = 5;
const LEFT_BUTTON = 1;
const MAIN_LIGHT_DIST = 5;
const STAR_RADIUS = 0.005;
const LINES_HEIGHT = 0.001;
const GREAT_CIRCLE_MIN_STEP = 0.05;
let ariesGHA = 0;
let observer = { lat: 0, long: 0, height: 4 };

// Math methods
const fixLong = (long) => (long%D360 + D540)%D360 - D180;
const coordToEuclidian = (lat, long, radius = 1) => {
	const rad2d = Math.cos(lat)*radius;
	const x = Math.sin(long)*rad2d;
	const y = Math.sin(lat)*radius;
	const z = Math.cos(long)*rad2d;
	return [ x, y, z ];
};
const euclidianToCoord = (x, y, z) => {
	const len = Math.sqrt(x*x + y*y + z*z);
	const rad2d = Math.sqrt(x*x + z*z);
	const lat = Math.asin(y/len);
	const long = x >= 0 ? Math.acos(z/rad2d) : - Math.acos(z/rad2d);
	return [ lat, long ];
};
const chordToArc = (chord) => Math.asin(chord/2)*2;
const coordDistance = (aLat, aLong, bLat, bLong) => {
	const [ ax, ay, az ] = coordToEuclidian(aLat, aLong);
	const [ bx, by, bz ] = coordToEuclidian(bLat, bLong);
	const dx = bx - ax;
	const dy = by - ay;
	const dz = bz - az;
	const chord = Math.sqrt(dx*dx + dy*dy + dz*dz);
	return chordToArc(chord);
};

class GreatCircle {
	constructor(aCoord, bCoord) {
		const radius = 1 + LINES_HEIGHT;
		const first = new THREE.Vector3(...coordToEuclidian(...aCoord, radius));
		const last = new THREE.Vector3(...coordToEuclidian(...bCoord, radius));
		const points = [];
		const fn = (ax, ay, az, bx, by, bz) => {
			const dx = ax - bx;
			const dy = ay - by;
			const dz = az - bz;
			const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
			if (dist <= GREAT_CIRCLE_MIN_STEP) {
				return;
			}
			let mx = (ax + bx)*0.5;
			let my = (ay + by)*0.5;
			let mz = (az + bz)*0.5;
			const len = Math.sqrt(mx*mx + my*my + mz*mz);
			const scale = radius/len;
			mx *= scale;
			my *= scale;
			mz *= scale;
			fn(ax, ay, az, mx, my, mz);
			points.push(new THREE.Vector3(mx, my, mz));
			fn(mx, my, mz, bx, by, bz);
		};
		points.push(first);
		fn(first.x, first.y, first.z, last.x, last.y, last.z);
		points.push(last);
		const geometry = new THREE.BufferGeometry().setFromPoints(points);
		const mesh = new THREE.Line(
			geometry,
			materials.markLine,
		);
		this.mesh = mesh;
		this.geometry = geometry;
		this.update();
		scene.add(mesh);
		surfaceGreatCircles.push(this);
	}
	remove() {
		scene.remove(this.mesh);
		this.mesh.geometry.dispose();
		const index = surfaceGreatCircles.indexOf(this);
		surfaceGreatCircles.splice(index, 1);
	}
	update() {
		this.mesh.rotation.y = ariesGHA;
	}
}

// Model
class SurfaceCircle {
	constructor(lat, long, radius = 1) {
		const mesh = new THREE.Line(
			geometries.circle,
			materials.markLine,
		);
		this.lat = lat;
		this.long = long;
		this.radius = radius;
		this.mesh = mesh;
		this.update();
		surfaceCircles.push(this);
		scene.add(mesh);
	}
	update() {
		const { mesh, lat, radius } = this;
		const long = this.long + ariesGHA;
		const len = 1 + LINES_HEIGHT;
		const scale = Math.sin(radius)*len;
		const [ x, y, z ] = coordToEuclidian(lat, long);
		const dist = Math.cos(radius)*len;
		mesh.rotation.x = 0;
		mesh.rotation.y = 0;
		mesh.rotation.z = 0;
		mesh.position.x = x*dist;
		mesh.position.y = y*dist;
		mesh.position.z = z*dist;
		mesh.scale.x = scale;
		mesh.scale.y = scale;
		mesh.rotateOnWorldAxis(WORLD_X, -lat);
		mesh.rotateOnWorldAxis(WORLD_Y, long);
		return this;
	}
}

// Auxiliar
const WORLD_X = new THREE.Vector3(1, 0, 0);
const WORLD_Y = new THREE.Vector3(0, 1, 0);
const WORLD_Z = new THREE.Vector3(0, 0, 1);
const MOUSE_VEC_2 = new THREE.Vector2();
const textureLoader = new THREE.TextureLoader();
const raycaster = new THREE.Raycaster();

// Basic elements
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);

// Textures
const textures = {
	// earth: (() => {
	// 	const texture = new THREE.TextureLoader().load('texture-hd.jpg');
	// 	texture.wrapS = THREE.RepeatWrapping;
	// 	texture.offset.x = 0.25;
	// 	return texture;
	// })(),
};

// Uniforms
const ariesGHAUniform = new THREE.Uniform(new THREE.Vector2());

// Materials
const materials = {
	star: new THREE.MeshBasicMaterial({ color: 0xffffff }),
	earth: new THREE.ShaderMaterial({
		uniforms: {
			earth: { type: "t", value: textureLoader.load("texture-hd.jpg") },
			stars: { type: "t", value: textureLoader.load("stars.jpg") },
			ariesGHA: { value: 0 },
		},
		vertexShader: vertexShader,
		fragmentShader: earthFrag,
	}),
	// earth: new THREE.MeshStandardMaterial({ map: textures.earth }),
	markLine: new THREE.LineBasicMaterial({ color: 0xffbb00 }),
};

// Geometries
const geometries = {
	smoothSphere: new THREE.SphereGeometry(1, 90, 45),
	lowPloySphere: new THREE.SphereGeometry(1, 12, 6),
	circle: new THREE.BufferGeometry().setFromPoints(
		new Array(361).fill().map((_, i) => {
			const angle = i*TO_RAD;
			const x = Math.cos(angle);
			const y = Math.sin(angle);
			return new THREE.Vector3(x, y, 0);
		}),
	),
};

// Main elements
const mainLight = new THREE.PointLight(0xffeedd, 0.8, 100);
const earth = new THREE.Mesh(
	geometries.smoothSphere,
	materials.earth,
);
const stars = almanac.map(({ ra, dec }) => {
	const lat = dec*TO_RAD;
	const long = ra/24*TAU;
	const [ x, y, z ] = coordToEuclidian(lat, long);
	const mesh = new THREE.Mesh(
		geometries.lowPloySphere,
		materials.star,
	);
	mesh.scale.x = mesh.scale.y = mesh.scale.z = STAR_RADIUS;
	mesh.position.x = x;
	mesh.position.y = y;
	mesh.position.z = z;
	return { meshes: [ mesh ] };
});
const surfaceCircles = [];
const surfaceGreatCircles = [];

// Scene
scene.add(new THREE.AmbientLight(0x224466));
scene.add(mainLight);
scene.add(earth);
stars.forEach(star => star.meshes.forEach(mesh => scene.add(mesh)));

const rayCastEarth = (nx, ny) => {
	MOUSE_VEC_2.x = nx;
	MOUSE_VEC_2.y = ny;
	raycaster.setFromCamera(MOUSE_VEC_2, camera);
	const [{ point } = {}] = raycaster.intersectObjects([ earth ]) ?? [];
	if (point === undefined) {
		return null;
	}
	const { x, y, z } = point;
	const [ lat, long ] = euclidianToCoord(x, y, z);
	return [
		lat,
		fixLong(long - ariesGHA),
	];
};

const goTo = (lat, long, height = observer.height) => {
	observer.lat    = Math.min(D90, Math.max(-D90, lat));
	observer.long   = (long%D360 + D360 + D180)%D360 - D180;
	observer.height = height;
	updateCamera();
};

const resize = (width, height) => {
	renderer.setSize(width, height);
	camera.aspect = width/height;
	camera.updateProjectionMatrix();
};

const updateCamera = () => {
	const { lat, long, height } = observer;
	const [ x, y, z ] = coordToEuclidian(lat, long + ariesGHA, 1 + height);
	camera.position.x = x;
	camera.position.y = y;
	camera.position.z = z;
	camera.lookAt(0, 0, 0);
	camera.near = height/2;
	camera.far = height + 2;
	mainLight.position.x = x;
	mainLight.position.y = y;
	mainLight.position.z = z;
	camera.updateProjectionMatrix();
};

const bindCanvas = () => {
	const canvas = renderer.domElement;
	const parseOffset = e => {
		const x = e.offsetX;
		const y = e.offsetY;
		const nx = x/canvas.width*2 - 1;
		const ny = 1 - y/canvas.height*2;
		return {
			mouse: [ x, y ],
			normal: [ nx, ny ],
			ctrl: e.ctrlKey,
		};
	};
	let startClick = null;
	canvas.addEventListener('wheel', e => {
		if (e.deltaY < 0) {
			observer.height /= 1.25;
			updateCamera();
		}
		if (e.deltaY > 0) {
			observer.height *= 1.25;
			updateCamera();
		}
	});
	canvas.addEventListener('mousedown', e => {
		if (e.button !== 0) return;
		const parsed = parseOffset(e);
		const coord = rayCastEarth(...parsed.normal);
		startClick = {
			...parsed,
			drag: false,
			observer: { ...observer },
			coord,
		};
	});
	canvas.addEventListener('mousemove', e => {
		if (startClick === null || (e.buttons & LEFT_BUTTON) === 0) {
			startClick = null;
			return;
		}
		const parsed = parseOffset(e);
		if (startClick.drag === false) {
			const { mouse: [ ax, ay ] } = parsed;
			const { mouse: [ bx, by ] } = startClick;
			const dx = bx - ax;
			const dy = by - ay;
			const dist = Math.sqrt(dx*dx + dy*dy);
			if (dist < MIN_DRAG_DIST) {
				return;
			}
			startClick.drag = true;
		}
		if (startClick.ctrl) {
			if (startClick.coord === null) {
				return;
			}
			const coord = rayCastEarth(...parsed.normal);
			if (coord === null) return;
			if (startClick.greatCircle) {
				startClick.greatCircle.remove();
			} else {
				startClick.circle = new SurfaceCircle(...startClick.coord);
			}
			startClick.circle.radius = coordDistance(...startClick.coord, ...coord);
			startClick.circle.update();
			const greatCircle = new GreatCircle(startClick.coord, coord);
			startClick.greatCircle = greatCircle;
			return;
		}
		const { normal: [ ax, ay ] } = parsed;
		const { normal: [ bx, by ] } = startClick;
		const dx = bx - ax;
		const dy = by - ay;
		goTo(
			startClick.observer.lat  + dy*D90,
			startClick.observer.long + dx*D180,
		);
	});
	canvas.addEventListener('dblclick', e => {
		const coord = rayCastEarth(...parseOffset(e).normal);
		goTo(...coord);
	});
};

const bindInputs = () => {
	const ghaText = document.querySelector('#ghatxt');
	const ariesGHAInput = document.querySelector('#ariesgha');
	ariesGHAInput.addEventListener('input', () => {
		const { value } = ariesGHAInput;
		ariesGHA = value*TO_RAD;
		ghaText.innerText = (value*1).toFixed(1)*1 + '°';
		earth.rotation.y = ariesGHA;
		materials.earth.uniforms.ariesGHA.value = ariesGHA;
		surfaceCircles.forEach(it => it.update());
		surfaceGreatCircles.forEach(it => it.update());
		updateCamera();
	});
};

window.addEventListener('resize', () => {
	resize(window.innerWidth, window.innerHeight);
});

window.addEventListener('load', () => {
	updateCamera();
	resize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);
	function animate() {
		requestAnimationFrame(animate);
		renderer.render(scene, camera);
	}
	animate();
	bindInputs();
	bindCanvas();
});
