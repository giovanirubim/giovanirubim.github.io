const E_RAD = 6371230;
const TO_RAD = Math.PI/180;
const MOUSE_DRAG_DIST = 5;
const LEFT_BUTTON = 1;
const mainLightDistance = 1;

const worldX = new THREE.Vector3(1, 0, 0);
const worldY = new THREE.Vector3(0, 1, 0);
const worldZ = new THREE.Vector3(0, 0, 1);
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
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
const circleGeometry = new THREE.BufferGeometry().setFromPoints(
	new Array(360).fill().map((_, i) => {
		const x = Math.cos(i/180*Math.PI);
		const y = Math.sin(i/180*Math.PI);
		return new THREE.Vector3(x, y, 0);
	}),
);
const circleHeight = 0.1;

const coordToNormalXyz = (lat, long, height = 0, radius = 1) => {
	lat = lat/180*Math.PI;
	long = long/180*Math.PI;
	const xzRad = Math.cos(lat);
	const scale = (radius + height)/radius;
	const x = Math.sin(long)*xzRad*scale;
	const y = Math.sin(lat)*scale;
	const z = Math.cos(long)*xzRad*scale;
	return [ x, y, z ];
};

const putCircleAt = (lat, long, rad) => {
	const circle = new THREE.Line(
		circleGeometry,
		new THREE.LineBasicMaterial({
			color: 0xffbb77,
		}),
	);
	const [ x, y, z ] = coordToNormalXyz(lat, long);
	const dist = Math.cos(rad*TO_RAD);
	const scale = Math.sin(rad*TO_RAD);
	circle.rotation.x = 0;
	circle.rotation.y = 0;
	circle.rotation.z = 0;
	circle.scale.x = scale;
	circle.scale.y = scale;
	circle.rotateOnWorldAxis(worldX, -lat*TO_RAD);
	circle.rotateOnWorldAxis(worldY, long*TO_RAD);
	circle.position.x = x*dist;
	circle.position.y = y*dist;
	circle.position.z = z*dist;
	scene.add(circle);
};

putCircleAt(-16.7479, 144.0345, 19.6166);
putCircleAt(-8.1782, 121.4034, 31.4601);
putCircleAt(5.1676, 157.618, 44.7216);

let ariesGHA = 0;
let earth;
const rayCast = (nx, ny) => {
	mouse.x = nx;
	mouse.y = ny;
	raycaster.setFromCamera(mouse, camera);
	return raycaster.intersectObject(earth);
};

scene.add(new THREE.AmbientLight(0x224466));

const mainLight = new THREE.PointLight(0xffeedd, 1, 100);
scene.add(mainLight);

const starRadius = 0.01;
const starHeight = 0.25;
const starLineGap = 0.03;
const starLineEnd = 1 + starHeight - starRadius - starLineGap;

const observer = { lat: 0, long: 0, height: E_RAD*3 };

class Star {
	constructor(lat, long, color = 0xffffff) {
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
		this.elements = [ star, line ];
		this.update();
	}
	update() {
		const { lat, long, elements } = this;
		const [ star, line ] = elements;
		const [ x, y, z ] = coordToNormalXyz(lat, long - ariesGHA, starHeight);
		line.rotation.x = 0;
		line.rotation.y = 0;
		line.rotation.z = 0;
		line.rotateX(- lat/180*Math.PI);
		line.rotateOnWorldAxis(worldY, (long - ariesGHA)/180*Math.PI);
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
	let [ x, y, z ] = coordToNormalXyz(lat, long, height, E_RAD);
	camera.position.x = x;
	camera.position.y = y;
	camera.position.z = z;
	camera.lookAt(0, 0, 0);
	camera.near = height/E_RAD/2;
	camera.far = height/E_RAD + 2;
	camera.updateProjectionMatrix();
	[ x, y, z ] = coordToNormalXyz(lat, long, mainLightDistance, 1);
	mainLight.position.x = x;
	mainLight.position.y = y;
	mainLight.position.z = z;
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
	observer.lat = Math.max(-90, Math.min(90, lat));
	observer.long = (long%360 + 360 + 180)%360 - 180;
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
			viewCoord: [ observer.lat, observer.long ],
			mouseCoord: [ x, y ],
			mouseNormal: [ nx, ny ],
			drag: false,
			earthCast: rayCast(nx, ny)[0]?.point ?? null,
		};
	});
	canvas.addEventListener('mousemove', e => {
		if ((e.buttons & LEFT_BUTTON) === 0) {
			startClick = null;
			return;
		}
		if (startClick === null) return;
		const { x, y, nx, ny } = parseOffset(e);
		const dx = x - startClick.mouseCoord[0];
		const dy = y - startClick.mouseCoord[1];
		if (startClick.drag === false) {
			const dist = Math.sqrt(dx*dx + dy*dy);
			if (dist >= MOUSE_DRAG_DIST) {
				startClick.drag = true;
			}
		}
		if (startClick.drag === false) {
			return;
		}
		const dnx = nx - startClick.mouseNormal[0];
		const dny = ny - startClick.mouseNormal[1];
		goTo(startClick.viewCoord[0] - dny*90, startClick.viewCoord[1] - dnx*180);
	});
};

const init = async () => {

	updateCamera();

	const renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	
	document.body.appendChild(renderer.domElement);
	bindCanvas(renderer.domElement);
	
	await Promise.all(resourcePromises);
	
	onload();
	
	function animate() {
		requestAnimationFrame(animate);
		renderer.render(scene, camera);
	}
	animate();
};

const createEarthMash = () => {
	const texture = new THREE.TextureLoader().load('texture-hd.jpg');
	const material = new THREE.MeshStandardMaterial({ map: texture });
	const geometry = resources.sphere_geometry;
	const mesh = new THREE.Mesh(geometry, material);
	return mesh;
};

const onload = () => {
	earth = createEarthMash();
	scene.add(earth);
	stars.forEach(star => star.elements.forEach(element => scene.add(element)));
};

init();

const ghatxt = document.querySelector('#ghatxt');
document.querySelector('#ariesgha').oninput = function () {
	ariesGHA = this.value*1;
	stars.forEach(star => star.update());
	ghatxt.innerText = ariesGHA.toFixed(1)*1 + '°';
};
