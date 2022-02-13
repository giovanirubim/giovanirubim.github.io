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
const LINES_HEIGHT = 0.0005;
const GREAT_CIRCLE_MIN_STEP = 0.05;
const CONE_HEIGHT = 0.05;
const CONE_RAD = 0.01;
const CONE_GAP = 0.001;
const observer = { lat: null, long: null, height: null };

let canvasRatio;
let dragFactor;
let ariesGHA = 0;

const updateObserver = (lat, long, height, fov) => {
	if (lat != null) observer.lat = lat;
	if (long != null) observer.long = long;
	if (height == null && fov == null) return;
	if (height != null) {
		observer.height = height;
	}
	if (fov != null) {
		camera.fov = fov;
		camera.updateProjectionMatrix();
	}
	const theta = camera.fov/2*TO_RAD;
	const d = observer.height + 1;
	const sin = Math.sin(theta)*d;
	if (sin > 1) {
		dragFactor = Math.acos(1/d);
	} else {
		const asin = Math.asin(sin);
		const alpha = Math.max(asin, D180 - asin);
		const f = D180 - alpha - theta;
		dragFactor = f;
	}
};

const setRotationAndPositionFor = (lat, long, target) => {
	target.rotation.x = 0;
	target.rotation.y = 0;
	target.rotation.z = 0;
	target.rotateOnWorldAxis(WORLD_X, -lat);
	target.rotateOnWorldAxis(WORLD_Y, long);
	const [ x, y, z ] = coordToEuclidian(lat, long);
	target.position.x = x;
	target.position.y = y;
	target.position.z = z;
};

const setPositionFor = (lat, long, target) => {
	const [ x, y, z ] = coordToEuclidian(lat, long);
	target.position.x = x;
	target.position.y = y;
	target.position.z = z;
};

const setRotationFor = (lat, long, target) => {
	target.rotation.x = 0;
	target.rotation.y = 0;
	target.rotation.z = 0;
	target.rotateOnWorldAxis(WORLD_X, -lat);
	target.rotateOnWorldAxis(WORLD_Y, long);
};

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

// Model
class GpCircle {
	constructor(lat, long, radius = 1) {
		const circleMesh = new THREE.Line(
			geometries.circle,
			materials.circle,
		);
		const coneMesh = new THREE.Mesh(
			geometries.cone,
			materials.cone,
		);
		this.lat = lat;
		this.long = long;
		this.radius = radius;
		this.circleMesh = circleMesh;
		this.coneMesh = coneMesh;
		this.selected = false;
		this.update();
		circles.push(this);
		scene.add(circleMesh);
		scene.add(coneMesh);
	}
	select() {
		if (this.selected !== true) {
			this.circleMesh.material = materials.selectedCircle;
			this.coneMesh.material = materials.selectedCone;
			this.selected = true;
		}
		return this;
	}
	unselect() {
		if (this.selected !== false) {
			this.circleMesh.material = materials.circle;
			this.coneMesh.material = materials.cone;
			this.selected = false;
		}
		return this;
	}
	update() {
		const { circleMesh, coneMesh, lat, radius } = this;
		const long = this.long + ariesGHA;
		const len = 1 + LINES_HEIGHT;
		const scale = Math.sin(radius)*len;
		const [ x, y, z ] = coordToEuclidian(lat, long);
		const circleDist = Math.cos(radius)*len;
		const coneDist = 1 + CONE_GAP + CONE_HEIGHT/2;
		circleMesh.rotation.x = 0;
		circleMesh.rotation.y = 0;
		circleMesh.rotation.z = 0;
		circleMesh.rotateOnWorldAxis(WORLD_X, -lat);
		circleMesh.rotateOnWorldAxis(WORLD_Y, long);
		coneMesh.rotation.x = - D90;
		coneMesh.rotation.y = 0;
		coneMesh.rotation.z = 0;
		circleMesh.position.x = x*circleDist;
		circleMesh.position.y = y*circleDist;
		circleMesh.position.z = z*circleDist;
		coneMesh.rotateOnWorldAxis(WORLD_X, -lat);
		coneMesh.rotateOnWorldAxis(WORLD_Y, long);
		coneMesh.position.x = x*coneDist;
		coneMesh.position.y = y*coneDist;
		coneMesh.position.z = z*coneDist;
		circleMesh.scale.x = scale;
		circleMesh.scale.y = scale;
		return this;
	}
	set(lat, long, radius) {
		this.lat = lat ?? this.lat;
		this.long = long ?? this.long;
		this.radius = radius ?? this.radius;
		this.update();
		return this;
	}
	remove() {
		scene.remove(this.circleMesh);
		scene.remove(this.coneMesh);
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

// Uniforms
const ariesGHAUniform = new THREE.Uniform(new THREE.Vector2());

// Materials
const materials = {
	star: new THREE.MeshBasicMaterial({ color: 0xffffff }),
	earth: new THREE.ShaderMaterial({
		uniforms: {
			earth: {
				type: "t",
				value: (() => {
					const texture = new THREE.TextureLoader().load('texture-hd.jpg');
					texture.wrapS = THREE.RepeatWrapping;
					return texture;
				})(),
			},
			stars: { type: "t", value: textureLoader.load("stars.jpg") },
			ariesGHA: { value: 0 },
			starsOpacity: { value: 0.8 },
			gridOpacity: { value: 0.4 },
		},
		vertexShader: vertexShader,
		fragmentShader: earthFrag,
	}),
	text: new THREE.LineBasicMaterial({ color: 0xffeedd }),
	cone: new THREE.MeshBasicMaterial({ color: 0xffffff }),
	circle: new THREE.LineBasicMaterial({ color: 0xffffff }),
	selectedCircle: new THREE.LineBasicMaterial({ color: 0xFF7700 }),
	selectedCone: new THREE.MeshBasicMaterial({ color: 0xFF7700 }),
	plane: new THREE.MeshBasicMaterial({ color: 0x444444 }),
	vertical: new THREE.LineBasicMaterial({ color: 0x00cc44 }),
	starDirection: new THREE.LineBasicMaterial({ color: 0xffcc00 }),
};

const chars = {
	'A': [[1, -1], [0, 1], [-1, -1], [0.6, -0.2]],
	'B': [[-1, -1], [-1, 1], [1, 0.5], [-0.25, 0], [1, -0.5], [-1, -1]],
	'C': [[1, -1], [-1, 0], [1, 1]],
	'D': [[-1, -1], [-1, 1], [1, 0], [-1, -1]],
	'E': [[1, 1], [-1, 0], [1, 0], [-1, 0], [1, -1]],
	'F': [[1, 1], [-1, 0.5], [-1, -1], [-1, 0], [0, 0]],
	'G': [[1, -0], [1, -1], [-1, 0], [1, 1]],
	'H': [[-1, -1], [-1, 1], [-1, 0], [1, 0], [1, 1], [1, -1]],
	'I': [[0, -1], [0, 1]],
	'K': [[1, 1], [-1, 0], [-1, 0.85], [-1, -0.85], [-1, 0], [1, -1]],
	'L': [[1, -0.25], [-1, -1], [-1, 1]],
	'M': [[-1, -1], [-1, 1], [0, 0], [1, 1], [1, -1]],
	'N': [[-1, -1], [-1, 1], [-1, 0.5], [1, -1], [1, 1]],
	'O': [[0, -1], [-1, 0], [0, 1], [1, 0], [0, -1]],
	'P': [[-1, -1], [-1, 1], [1, 0.3], [-1, -0.4]],
	'R': [[-1, -1], [-1, 1], [1, 0.3], [-1, -0.4], [1, -1]],
	'S': [[0, 1], [-1, 0], [1, 0], [0, -1]],
	'T': [[0, -1], [0, 1], [-1, 1], [1, 1]],
	'U': [[-1, 1], [-1, -1], [1, -0.5], [1, -1], [1, 1]],
	'V': [[-1, 1], [0, -1], [1, 1]],
	'X': [[-1, -1], [1, 1], [0, 0], [-1, 1], [1, -1]],
	'Y': [[-1, 1], [0, 0], [0, -1], [0, 0], [1, 1]],
	'Z': [[-1, 1], [1, 1], [-1, -1], [1, -1]],
};

// Geometries
const geometries = {
	cone: new THREE.ConeGeometry(CONE_RAD, CONE_HEIGHT, 16),
	smoothSphere: new THREE.SphereGeometry(1, 180, 90),
	lowPloySphere: new THREE.SphereGeometry(1, 12, 6),
	circle: new THREE.BufferGeometry().setFromPoints(
		new Array(361).fill().map((_, i) => {
			const angle = i*TO_RAD;
			const x = Math.cos(angle);
			const y = Math.sin(angle);
			return new THREE.Vector3(x, y, 0);
		}),
	),
	... Object.fromEntries(
		Object.entries(chars).map(([ char, points ]) => {
			return [
				`char_${char}`,
				new THREE.BufferGeometry().setFromPoints(
					points.map(([ x, y ]) => new THREE.Vector3(x*0.5, y*0.5, 0)),
				),
			];
		}),
	),
	plane: new THREE.PlaneGeometry(1, 1),
	beacon: new THREE.BufferGeometry().setFromPoints([
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(0, 0, 10),
	]),
};

const createText = (text, lat, long) => {
	const charHeight = 0.01;
	const upOffset = charHeight;
	const charWidth = charHeight/2;
	const charSpace = charWidth/2;
	const n = text.length;
	const length = (n - 1)*charSpace + n*charWidth;
	let x = length*-0.5 + charWidth*0.5;
	const euler_lat = new THREE.Euler(-lat, 0, 0);
	const euler_long = new THREE.Euler(0, long, 0);
	const pos = new THREE.Vector3();
	const meshes = [];
	for (let char of text) {
		const geometry = geometries[`char_${char}`];
		if (!geometry) {
			x += charWidth + charSpace;
			continue;
		}
		const mesh = new THREE.Line(
			geometry,
			materials.text,
		);
		mesh.scale.x = charWidth;
		mesh.scale.y = charHeight;
		mesh.rotateOnWorldAxis(WORLD_X, -lat);
		mesh.rotateOnWorldAxis(WORLD_Y, long);
		pos.x = x;
		pos.y = upOffset;
		pos.z = 1.01;
		pos.applyEuler(euler_lat);
		pos.applyEuler(euler_long);
		mesh.position.x = pos.x;
		mesh.position.y = pos.y;
		mesh.position.z = pos.z;
		meshes.push(mesh);
		x += charWidth + charSpace;
	}
	return meshes;
};

// Main elements
const earth = new THREE.Mesh(
	geometries.smoothSphere,
	materials.earth,
);

const stars = almanac.map(({ name, ra, dec }) => {
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
	const label = name
		.toUpperCase()
		.replace(/[^A-Z]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
	return {
		x, y, z,
		lat, long,
		sphere: mesh,
		meshes: [ mesh, ...createText(label, lat, long) ]
	};
});

const circles = [];
let referenceStar = null;
const referenceDirection = new THREE.Line(
	geometries.beacon,
	materials.starDirection,
);
const horizon = {
	plane: (() => {
		const plane = new THREE.Mesh(
			geometries.plane,
			materials.plane,
		);
		plane.scale.x = 0.1;
		plane.scale.y = 0.1;
		plane.scale.z = 0.1;
		return plane;
	})(),
	vertical: new THREE.Line(
		geometries.beacon,
		materials.vertical,
	),
	sight: new THREE.Line(
		geometries.beacon,
		materials.starDirection,
	),
	visible: false,
	sightVisible: false,
	place: function(lat, long) {
		if (!this.visible) {
			return;
		}
		long += ariesGHA;
		setRotationAndPositionFor(lat, long, this.plane);
		setRotationFor(lat, long, this.vertical);
		if (referenceStar) {
			this.showSight();
			setPositionFor(lat, long, this.sight);
			setRotationFor(referenceStar.lat, referenceStar.long, this.sight);
		} else {
			this.hideSight();
		}
	},
	hide: function() {
		if (!this.visible) return;
		scene.remove(this.plane);
		scene.remove(this.sight);
		scene.remove(this.vertical);
		this.visible = false;
	},
	show: function() {
		if (this.visible) {
			return;
		}
		scene.add(this.plane);
		if (this.sightVisible) {
			scene.add(this.sight)
		}
		scene.add(this.vertical);
		this.visible = true;
	},
	showSight: function() {
		if (this.sightVisible) {
			return;
		}
		this.sightVisible = true;
		if (this.visible) {
			scene.add(this.sight);
		}
	},
	hideSight: function() {
		if (!this.sightVisible) {
			return;
		}
		this.sightVisible = false;
		if (this.visible) {
			scene.remove(this.sight);
		}
	},
};

// Scene
scene.add(new THREE.AmbientLight(0x224466));
scene.add(earth);
stars.forEach(star => star.meshes.forEach(mesh => scene.add(mesh)));
scene.background = (() => {
	const texture = textureLoader.load('stars.jpg');
	texture.mapping = THREE.EquirectangularReflectionMapping;
	return texture;
})();

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

const rayCastStar = (nx, ny) => {
	MOUSE_VEC_2.x = nx;
	MOUSE_VEC_2.y = ny;
	raycaster.setFromCamera(MOUSE_VEC_2, camera);
	const meshes = stars.map(({ sphere }) => sphere);
	const [ res ] = raycaster.intersectObjects(meshes);
	if (res === undefined) return null;
	return stars.find(star => res.object === star.sphere);
};

const goTo = (lat, long, height = observer.height) => {
	updateObserver(
		Math.min(D90, Math.max(-D90, lat)),
		(long%D360 + D360 + D180)%D360 - D180,
		height,
	);
	updateCamera();
};

const resize = (width, height) => {
	renderer.setSize(width, height);
	camera.aspect = width/height;
	camera.updateProjectionMatrix();
	canvasRatio = width/height;
};

const updateCamera = () => {
	const { lat, long, height } = observer;
	const [ x, y, z ] = coordToEuclidian(lat, long + ariesGHA, 1 + height);
	camera.position.x = x;
	camera.position.y = y;
	camera.position.z = z;
	camera.lookAt(0, 0, 0);
	camera.near = height/2;
	camera.far = height*2 + 2;
	camera.updateProjectionMatrix();
};

const bindCanvas = () => {
	const canvas = renderer.domElement;
	const parseMouseEvent = e => {
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
			updateObserver(null, null, observer.height/1.25);
			updateCamera();
		}
		if (e.deltaY > 0) {
			updateObserver(null, null, observer.height*1.25);
			updateCamera();
		}
	});
	canvas.addEventListener('mousedown', e => {
		if (e.button !== 0) return;
		const parsed = parseMouseEvent(e);
		const coord = rayCastEarth(...parsed.normal);
		startClick = {
			...parsed,
			drag: false,
			observer: { ...observer },
			coord,
		};
	});
	canvas.addEventListener('mousemove', e => {
		const parsed = parseMouseEvent(e);
		if (startClick === null || (e.buttons & LEFT_BUTTON) === 0) {
			startClick = null;
			if (!e.altKey) {
				return;
			}
			horizon.show();
			const coord = rayCastEarth(...parsed.normal);
			if (coord != null) {
				horizon.place(...coord);
			}
			return;
		}
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
			if (startClick.circle == null) {
				circles.forEach(circle => circle.unselect());
				startClick.circle = new GpCircle(...startClick.coord);
				startClick.circle.select();
				showGpCircleBox();
			}
			const circle = startClick.circle;
			circle.radius = coordDistance(...startClick.coord, ...coord);
			circle.update();
			updateGpCircleBox(circle);
			return;
		}
		const { normal: [ ax, ay ] } = parsed;
		const { normal: [ bx, by ] } = startClick;
		const dx = bx - ax;
		const dy = by - ay;
		goTo(
			startClick.observer.lat  + dy*dragFactor,
			startClick.observer.long + dx*dragFactor*canvasRatio,
		);
	});
	canvas.addEventListener('dblclick', e => {
		const { normal } = parseMouseEvent(e);
		const star = rayCastStar(...normal);
		if (!star) return;
		setReferenceStar(star);
	});
};

const setReferenceStar = (star) => {
	referenceStar = star;
	scene.add(referenceDirection);
	setRotationFor(star.lat, star.long, referenceDirection);
};

const domRangeTemplate = document.querySelector('.input-range');
domRangeTemplate.remove();

const domBoolTemplate = document.querySelector('.input-bool');
domBoolTemplate.remove();

let inputCount = 0;
let inputStride = 50;
const addRangeInput = ({ title, init, onchange, stringify, min, max, step }) => {
	const domElement = domRangeTemplate.cloneNode(true);
	domElement.querySelector('.title').innerText = title;
	const input = domElement.querySelector('input');
	const text = domElement.querySelector('.value');
	input.value = init;
	input.setAttribute('min', min);
	input.setAttribute('max', max);
	input.setAttribute('step', step);
	input.oninput = () => {
		const value = input.value*1;
		text.innerText = stringify(value);
		onchange(value);
	};
	text.innerText = stringify(init);
	domElement.style.top = 10 + inputStride*(inputCount++) + 'px';
	document.body.appendChild(domElement);
	onchange(init);
	return domElement;
};
const addBoolInput = ({ title, init, onchange }) => {
	const domElement = domBoolTemplate.cloneNode(true);
	domElement.querySelector('.title').innerText = title;
	const input = domElement.querySelector('input');
	const text = domElement.querySelector('.value');
	input.checked = init;
	input.oninput = () => {
		const value = input.checked;
		onchange(value);
	};
	domElement.style.top = 10 + inputStride*(inputCount++) + 'px';
	document.body.appendChild(domElement);
	onchange(init);
	return domElement;
};

const [ latInput, longInput, radInput ] = [ ...document.querySelectorAll('.gp-circle-box input') ];
const addInputs = () => {
	addRangeInput({
		title: 'Aries GHA',
		min: 0, max: 360, step: 0.1, init: 0,
		stringify: value => value.toFixed(1)*1 + '°',
		onchange: value => {
			ariesGHA = value*TO_RAD;
			materials.earth.uniforms.ariesGHA.value = ariesGHA/TAU;
			earth.rotation.y = ariesGHA;
			circles.forEach(it => it.update());
			updateCamera();
		},
	});
	addRangeInput({
		title: 'Sky reflex',
		min: 0, max: 100, step: 1,
		init: Math.round(materials.earth.uniforms.starsOpacity.value*100),
		stringify: value => value + '%',
		onchange: value => {
			materials.earth.uniforms.starsOpacity.value = value/100;
		},
	});
	addRangeInput({
		title: 'Grid',
		min: 0, max: 100, step: 1,
		init: Math.round(materials.earth.uniforms.gridOpacity.value*100),
		stringify: value => value + '%',
		onchange: value => {
			materials.earth.uniforms.gridOpacity.value = value/100;
		},
	});
	addBoolInput({
		title: 'Stars',
		init: true,
		onchange: enabled => {
			if (enabled) {
				stars.forEach(star => star.meshes.forEach(mesh => scene.add(mesh)));
			} else {
				stars.forEach(star => star.meshes.forEach(mesh => scene.remove(mesh)));
			}
		},
	});
	latInput.addEventListener('change', () => {
		getSelectedCircle()?.set(latInput.value*TO_RAD, null, null);
	});
	longInput.addEventListener('change', () => {
		getSelectedCircle()?.set(null, longInput.value*TO_RAD, null);
	});
	radInput.addEventListener('change', () => {
		getSelectedCircle()?.set(null, null, radInput.value*TO_RAD);
	});
};

window.addEventListener('resize', () => {
	resize(window.innerWidth, window.innerHeight);
});

const gpCircleBox = document.querySelector('.gp-circle-box');
const getSelectedCircle = () => circles.find(circle => circle.selected);
const hideGpCircleBox = () => gpCircleBox.style.display = 'none';
const showGpCircleBox = () => gpCircleBox.style.display = 'block';
const updateGpCircleBox = (circle = getSelectedCircle()) => {
	if (circle == null) return;
	latInput.value = (circle.lat*TO_DEG).toFixed(6)*1;
	longInput.value = (circle.long*TO_DEG).toFixed(6)*1;
	radInput.value = (circle.radius*TO_DEG).toFixed(6)*1;
};

const removeSelection = () => {
	const circle = getSelectedCircle();
	if (circle == null) {
		return;
	}
	const index = circles.indexOf(circle);
	circle.remove();
	circles.splice(index, 1);
	circles.at(-1)?.select();
	if (circles.length === 0) {
		hideGpCircleBox();
	} else {
		updateGpCircleBox();
	}
};

let inputsVisible = true;
const hideInputs = () => {
	inputsVisible = false;
	const selector = `.input-range,.input-bool,.gp-circle-box`;
	[...document.querySelectorAll(selector)].forEach(item => {
		item.style.display = 'none';
	});
};

const showInputs = () => {
	inputsVisible = true;
	const selector = `.input-range,.input-bool`;
	[...document.querySelectorAll(selector)].forEach(item => {
		item.style.display = 'block';
	});
	if (circles.length) {
		document.querySelector('.gp-circle-box').style.display = 'block';
	}
};

const toggleInputs = () => {
	if (inputsVisible) {
		hideInputs();
	} else {
		showInputs();
	}
};

const moveCircleSelection = (offset) => {
	const circle = getSelectedCircle();
	if (circle == null) {
		return;
	}
	let index = circles.indexOf(circle);
	index = (index + offset + circles.length)%circles.length;
	circle.unselect();
	const next = circles[index];
	next.select();
	updateGpCircleBox(next);
};

window.addEventListener('keydown', e => {
	const key = e.key.toLowerCase();
	if (document.activeElement.tagName === 'INPUT') return;
	if (key === 'del' || key === 'delete') removeSelection();
	if (key === 'left' || key === 'arrowleft') moveCircleSelection(-1);
	if (key === 'right' || key === 'arrowright') moveCircleSelection(+1);
	if (key === 's') toggleInputs();
});

window.addEventListener('load', () => {
	updateObserver(0, 0, 1, 45);
	updateCamera();
	resize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);
	function animate() {
		requestAnimationFrame(animate);
		renderer.render(scene, camera);
	}
	animate();
	addInputs();
	bindCanvas();
});
