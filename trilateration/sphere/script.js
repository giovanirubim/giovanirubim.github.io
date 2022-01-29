const E_RAD = 6371230;
const TO_RAD = Math.PI/180;
const TO_DEG = 180/Math.PI;
const MOUSE_DRAG_DIST = 5;
const LEFT_BUTTON = 1;
const mainLightDistance = 1;
const STAR_RADIUS = 0.005;
const STAR_HEIGHT = - STAR_RADIUS;

const worldX = new THREE.Vector3(1, 0, 0);
const worldY = new THREE.Vector3(0, 1, 0);
const worldZ = new THREE.Vector3(0, 0, 1);
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const scene = new THREE.Scene();
const textureLoader = new THREE.TextureLoader();
const camera = new THREE.PerspectiveCamera(
	45,
	1,
	0.1,
	1000,
);
const renderer = new THREE.WebGLRenderer();

let ariesGHA = 0;

const resize = (width, height) => {
	renderer.setSize(width, height);
	camera.aspect = width/height;
	camera.updateProjectionMatrix();
};

const textures = {
	earth: new THREE.TextureLoader().load('texture-hd.jpg'),
	stars: (() => {
		const texture = textureLoader.load('stars.jpg');
		texture.mapping = THREE.EquirectangularReflectionMapping;
		return texture;
	})(),
};
const materials = {
	earth: new THREE.MeshStandardMaterial({ map: textures.earth }),
	line: new THREE.LineBasicMaterial({ color: 0x77bbff }),
};
const geometries = {
	star: new THREE.SphereGeometry(STAR_RADIUS, 12, 6),
	smoothSphere: new THREE.SphereGeometry(1, 90, 45),
};

scene.background = textures.stars;
const preview = new THREE.Mesh(
	geometries.smoothSphere,
	new THREE.MeshBasicMaterial({
		map: textureLoader.load('stars.jpg'),
		transparent: true,
		opacity: 0.5,
	}),
);
preview.scale.x = -1.001;
preview.scale.y = 1.001;
preview.scale.z = 1.001;
preview.rotation.y = - Math.PI + 0.005;
scene.add(preview);

const circleOfEqualAltitudeMaterial = new THREE.LineBasicMaterial({ color: 0xffbb77 });
const circleGeometry = new THREE.BufferGeometry().setFromPoints(
	new Array(360).fill().map((_, i) => {
		const x = Math.cos(i/180*Math.PI);
		const y = Math.sin(i/180*Math.PI);
		return new THREE.Vector3(x, y, 0);
	}),
);

class Star {
	constructor(lat, long, color = 0xffffff) {
		const material = new THREE.MeshBasicMaterial({ color });
		const star = new THREE.Mesh(geometries.star, material);
		this.lat = lat;
		this.long = long;
		this.elements = [ star ];
		const [ x, y, z ] = coordToNormalXyz(lat, long - ariesGHA, STAR_HEIGHT + STAR_RADIUS);
		star.position.x = x;
		star.position.y = y;
		star.position.z = z;
	}
}

const xyzToCoord = ([ x, y, z ]) => {
	const len = Math.sqrt(x*x + y*y + z*z);
	const len2d = Math.sqrt(x*x + z*z);
	const lat = Math.asin(y/len);
	const long = x >= 0 ? Math.acos(z/len2d) : - Math.acos(z/len2d);
	return [ lat, long ];
};

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

const setCircle = (circle, lat, long, rad) => {
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

const addCircleAt = (material, lat, long, rad) => {
	const circle = new THREE.Line(circleGeometry, material);
	setCircle(circle, lat, long, rad);
};

const earth = new THREE.Mesh(geometries.smoothSphere, materials.earth);
scene.add(earth);

almanac.forEach(({ ra, dec }) => {
	const lat = dec;
	const long = (ra/24*360 + 180)%360 - 180;
	const star = new Star(lat, long);
	star.elements.forEach(element => scene.add(element));
});

const rayCast = (nx, ny) => {
	mouse.x = nx;
	mouse.y = ny;
	raycaster.setFromCamera(mouse, camera);
	return raycaster.intersectObject(earth);
};

scene.add(new THREE.AmbientLight(0x224466));

const mainLight = new THREE.PointLight(0xffeedd, 0.8, 100);
scene.add(mainLight);

const observer = { lat: 0, long: 0, height: E_RAD*3 };

const updateCamera = () => {
	let { lat, long, height } = observer;
	let currLong = long + ariesGHA;
	let [ x, y, z ] = coordToNormalXyz(lat, currLong, height, E_RAD);
	camera.position.x = x;
	camera.position.y = y;
	camera.position.z = z;
	camera.lookAt(0, 0, 0);
	camera.near = height/E_RAD/2;
	camera.far = height/E_RAD + 2;
	camera.updateProjectionMatrix();
	[ x, y, z ] = coordToNormalXyz(lat, currLong, mainLightDistance, 1);
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
	canvas.addEventListener('click', e => {
		if (startClick?.drag) {
			return;
		}
		const { x, y, nx, ny } = parseOffset(e);
		const point = rayCast(nx, ny)?.[0]?.point;
		if (!point) return;
		const coord = xyzToCoord(point);
		console.log(coord.map(x => x*TO_DEG));
	});
};

updateCamera();

resize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);
bindCanvas(renderer.domElement);

function animate() {
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}
animate();

const ghatxt = document.querySelector('#ghatxt');
document.querySelector('#ariesgha').oninput = function () {
	ariesGHA = this.value*1;
	ghatxt.innerText = ariesGHA.toFixed(1)*1 + '°';
	earth.rotation.y = ariesGHA*TO_RAD;
	updateCamera();
};

window.addEventListener('resize', () => resize(window.innerWidth, window.innerHeight));
goTo(0, 0);
