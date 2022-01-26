const E_RAD = 6371230;
const MOUSE_DRAG_DIST = 5;
const LEFT_BUTTON = 1;

const worldY = new THREE.Vector3(0, 1, 0);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
	45,
	window.innerWidth/window.innerHeight,
	0.1,
	1000,
);
const lineMaterial = new THREE.LineBasicMaterial({
	color: 0xffffff,
	transparent: true,
	opacity: 0.25,
});

const starRadius = 0.01;
const starHeight = 0.25;
const starLineGap = 0.05;
const starLineEnd = 1 + starHeight - starRadius - starLineGap;

const observer = { lat: 0, long: 0, height: E_RAD*4 };
const coordToNormalXyz = (lat, long, height, radius = 1) => {
	lat = lat/180*Math.PI;
	long = long/180*Math.PI;
	const xzRad = Math.cos(lat);
	const scale = (radius + height)/radius;
	const x = Math.sin(long)*xzRad*scale;
	const y = Math.sin(lat)*scale;
	const z = Math.cos(long)*xzRad*scale;
	return [ x, y, z ];
};

class Star {
	constructor(lat, long, color = 0xffffff, longShift = 0) {
		const material = new THREE.MeshBasicMaterial({ color });
		const geometry = new THREE.SphereGeometry(starRadius, 12, 6);
		const star = new THREE.Mesh(geometry, material);
		const line = new THREE.Line(
			new THREE.BufferGeometry().setFromPoints([
				new THREE.Vector3(0, 0, 0),
				new THREE.Vector3(0, 0, starLineEnd),
			]),
			lineMaterial,
		);
		this.lat = lat;
		this.long = long;
		this.longShift = 0;
		this.meshes = [ star, line ];
		this.update();
	}
	update() {
		const { lat, long, meshes, longShift } = this;
		const [ star, line ] = meshes;
		const [ x, y, z ] = coordToNormalXyz(lat, long + longShift, starHeight);
		line.rotation.x = 0;
		line.rotation.y = 0;
		line.rotation.z = 0;
		line.rotateX(- lat/180*Math.PI);
		line.rotateOnWorldAxis(worldY, (long + longShift)/180*Math.PI);
		star.position.x = x;
		star.position.y = y;
		star.position.z = z;
		return this;
	}
}

const stars = almanac.map(star => {
	let lat = star.dec;
	let long = (star.ra/24*360 + 180)%360 - 180;
	return new Star(lat, long);
});

const updateCamera = () => {
	let { lat, long, height } = observer;
	const [ x, y, z ] = coordToNormalXyz(lat, long, height, E_RAD);
	camera.position.x = x;
	camera.position.y = y;
	camera.position.z = z;
	camera.lookAt(0, 0, 0);
	camera.near = height/E_RAD/2;
	camera.far = height/E_RAD + 2;
	camera.updateProjectionMatrix();
};

const moveDown = () => {
	observer.height /= 1.2;
	updateCamera();
};

const moveUp = () => {
	observer.height *= 1.2;
	updateCamera();
};

const goTo = (lat, long) => {
	observer.lat = lat;
	observer.long = long;
	updateCamera();
};

const objectLoader = new THREE.ObjectLoader(); 
const resources = {};
const resourcePromises = [];

const addResource = (name, fn) => resourcePromises.push(new Promise(done => fn(
	resource => {
		resources[name] = resource;
		done();
	},
)));

addResource(
	'sphere_geometry',
	callback => {
		const loader = new THREE.BufferGeometryLoader();
		loader.load('sphere_geometry.json', callback);
	},
);

const addLight = () => {
	scene.add(new THREE.AmbientLight(0x112244));
	const light = new THREE.PointLight(0xffeedd, 2, 100);
	light.position.set(0, 0, 55);
	scene.add(light);
};

const bindCanvas = (canvas) => {
	canvas.addEventListener('wheel', e => {
		if (e.deltaY > 0) moveUp();
		if (e.deltaY < 0) moveDown();
	});
	let startClick = null;
	const parseOffset = e => {
		const x = e.offsetX;
		const y = e.offsetY;
		const nx = x/canvas.width*2 - 1;
		const ny = 1 - y/canvas.height*2;
		return { x, y, nx, ny };
	};
	canvas.addEventListener('mousedown', e => {
		if (e.button !== 0) return;
		const { x, y, nx, ny } = parseOffset(e);
		startClick = {
			lat: observer.lat,
			long: observer.long,
			x, y,
			nx, ny,
			drag: false,
		};
	});
	canvas.addEventListener('mousemove', e => {
		if ((e.buttons & LEFT_BUTTON) === 0) {
			startClick = null;
			return;
		}
		if (startClick === null) return;
		const { x, y, nx, ny } = parseOffset(e);
		const dx = x - startClick.x;
		const dy = y - startClick.y;
		if (startClick.drag === false) {
			const dist = Math.sqrt(dx*dx + dy*dy);
			if (dist >= MOUSE_DRAG_DIST) {
				startClick.drag = true;
			}
		}
		if (startClick.drag === false) {
			return;
		}
		const dnx = nx - startClick.nx;
		const dny = ny - startClick.ny;
		goTo(startClick.lat - dny*90, startClick.long - dnx*180);
	});
};

const init = async () => {

	addLight();
	updateCamera();

	const renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	
	document.body.appendChild(renderer.domElement);
	bindCanvas(renderer.domElement);
	
	await Promise.all(resourcePromises);
	
	onload();
	
	function animate() {
		requestAnimationFrame(animate);
		step();
		renderer.render(scene, camera);
	}
	animate();
};

const createEarthMash = () => {
	const texture = new THREE.TextureLoader().load('texture.jpg');
	const material = new THREE.MeshStandardMaterial({ map: texture });
	const geometry = resources.sphere_geometry;
	const mesh = new THREE.Mesh(geometry, material);
	return mesh;
};

const onload = () => {
	scene.add(createEarthMash());
	stars.forEach(star => star.meshes.forEach(mesh => scene.add(mesh)));
};

const step = () => {
};

init();
