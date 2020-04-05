// ========================<-------------------------------------------->======================== //
// Controls the 3D view of the editor

// ========================<-------------------------------------------->======================== //
// Módulos acessados

import Transform from './transform.js';

// ========================<-------------------------------------------->======================== //
// Constants

const canvas = document.createElement('canvas');
const canvasColorPicker = document.createElement('canvas');
const GL = WebGL2RenderingContext;
const PI = Math.PI;
const TAU = PI*2;
const TO_RAD = PI/180;
const TO_DEG = 180/PI;
const nSides = 60; // Number of sides in a "circle"
const step = TAU/nSides;
const totalRadius = 10;
const axisLength = totalRadius*2.5;
const defaultStripeSize = totalRadius*0.002;
const initialDistance = 50;

// ========================<-------------------------------------------->======================== //
// Canvas context variables

const gl = canvas.getContext('webgl2', {antialias: true});
const glPick = canvasColorPicker.getContext('webgl2', {antialias: false});

// Flag que indica se a visualização 3D está atualizada na tela
let viewUpdated = true;

// 3D view width (sx) and height (sy)
let sx = null;
let sy = null;

// Center of 3D view
let cx = null;
let cy = null;

// Flags
let cameraUpdated = false;
let cylinderMappingUpdated = false;

const highlightColor = new Float32Array([0, .5, 1]);
const bgColor = new Float32Array([.05, .05, .05]);
const colors = {
	solidCylinder: {
		cylinder: new Float32Array([.6, .6, .6]),
		stripe: new Float32Array([.35, .35, .35]),
	},
	hilightedSolidCylinder: {
		cylinder: new Float32Array([.4, .7, 1]),
		stripe: new Float32Array([.6, .8, 1]),
	}
};

const camera = {

	// applied to every vertex just before projection
	world: new Transform(),

	// Only scale vertices
	orthographic: new Transform(),

	// Projection from the camera
	perspective: new Transform(),

	// orthographic and perspective mixed, projects the vertices to the 1x1x1 cube
	projection: new Transform(),

	// Light coordinate considering that camera is at 0 looking at negative Z
	lightCoord: new Float32Array([0, 1, 1]),
	
	// mixes from (0) orthographic to (1) perspective
	perspectiveLevel: 1,

	// Projection info
	angle: 15*TO_RAD,
	near: .1,
	far: 500,
	
	// Camera moviment values
	shift: 0,
	rotation: 0*TO_RAD,
	orientation: 0*TO_RAD,
	distance: initialDistance,

};

const pixelCapture = new Transform();

const shaders = {
	vertex: {
		solidCylinder: null
	},
	fragment: {
		solid: null
	}
};
const programs = {
	solidCylinder: null
};
const geometries = {
	solidCylinder: null
};

const cylinders = [];

// Agendamento da renderização
let render_request = null;

// ========================<-------------------------------------------->======================== //
// Model mapping

// Total length of the model
let totalLength = null;

// Radius of the model
let modelRadius = null;

// Scaled applied to the model
let modelScale = null;

// Mapps a key to each cylinder
let keyToCylinder = {};

// Reset cylinder positions and scales acoording to the radius of the entire model
const mapCylinders = () => {

	// Finds the total length of the cylinders
	totalLength = 0;
	const n = cylinders.length;
	for (let i=0; i<n; ++i) {
		totalLength += cylinders[i].length;
	}

	// Finds the radius of the smallest sphere centered at the center of the model that the model
	// can fit in
	// In other words, finds the distance of the farest point of the model from the center of the
	// model
	modelRadius = 0;
	let z0 = -totalLength/2;
	for (let i=0; i<n; ++i) {
		const cylinder = cylinders[i];
		const {r1, length} = cylinder;
		
		// Z which is the farest from the origin
		const z1 = z0 + length;
		const zFar = Math.max(Math.abs(z1), Math.abs(z0));

		const dist = Math.sqrt(zFar*zFar + r1*r1);
		modelRadius = Math.max(modelRadius, dist);

		z0 += length;
	}

	modelScale = modelRadius? totalRadius/modelRadius: 1;
	let z = - totalLength*modelScale*0.5;

	for (let i=0; i<n; ++i) {
		const cylinder = cylinders[i];
		cylinder.set(z, modelScale, i);
		z += cylinder.length*modelScale;
	}

	cylinderMappingUpdated = true;

};

// ========================<-------------------------------------------->======================== //
// Auxiliar methods

// Número de bits armazenado em cada canal de cor
const nBits = 8;
const indexToColor = (index, color) => {
	const mask = (1 << nBits) - 1;
	for (let i=3; i--;) {
		color[i] = ((index >> (i*nBits)) & mask)/mask;
	}
	return color;
};
const colorToIndex = (color) => {
	const max = (1 << nBits) - 1;
	let index = 0;
	for (let i=3; i--;) {
		const byte = Math.round(color[i]/255*max);
		index |= byte << (i*nBits);
	}
	if (index === (1 << (nBits*3)) - 1) return -1;
	return index;
};

const toFloatString = x => Math.floor(x) === x? x + '.0': x.toString();
const toVec3String = array => {
	const [a, b, c] = array;
	return `vec3(${toFloatString(a)}, ${toFloatString(b)}, ${toFloatString(c)})`;
};

// Considers a vector (dir_x, dir_y) at the origin and a point (dx, dy)
// Returns a value which multiplied by the vector will result in a point in the vector's direction
// that is the closest to the point
const valInLine = (dir_x, dir_y, dx, dy) => {
	if (Math.abs(dir_y) > Math.abs(dir_x)) {
		const c = dir_x/dir_y;
		return (dy + dx*c)/(dir_x*c + dir_y);
	}
	const c = dir_y/dir_x;
	return (dx + dy*c)/(dir_x + dir_y*c);
};

const angularCut = x => (x%TAU+TAU)%TAU;

// Expected to be normalized
const getAngle = (dx, dy) => dy >= 0? Math.acos(dx): TAU - Math.acos(dx);

const getLength = (dx, dy) => Math.sqrt(dx*dx + dy*dy);

// ========================<-------------------------------------------->======================== //
// WebGL Elements

const createShader = (gl, src, type) => {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, src.trim());
	gl.compileShader(shader);
	const log = gl.getShaderInfoLog(shader);
	if (log) throw log;
	return shader;
}

class Program {
	constructor(gl, vShader, fShader) {
		const ref = gl.createProgram();
		gl.attachShader(ref, vShader);
		gl.attachShader(ref, fShader);
		gl.linkProgram(ref);
		if (!gl.getProgramParameter(ref, GL.LINK_STATUS)) {
			throw gl.getProgramInfoLog(ref);
		}
		this.gl = gl;
		this.ref = ref;
		this.locations = {};
		for (let i=2; i<arguments.length; ++i) {
			this.locate(arguments[i]);
		}
	}
	locate(name) {
		const {gl, locations, ref} = this;
		locations[name] = gl.getUniformLocation(ref, name);
		return this;
	}
	setMat4(name, value) {
		const {gl, locations} = this;
		gl.uniformMatrix4fv(locations[name], true, value);
		return this;
	}
	setVec3(name, value) {
		const {gl, locations} = this;
		gl.uniform3fv(locations[name], value);
		return this;
	}
	setVec4(name, value) {
		const {gl, locations} = this;
		gl.uniform4fv(locations[name], value);
		return this;
	}
	setFloat(name, value) {
		const {gl, locations} = this;
		gl.uniform1f(locations[name], value);
		return this;
	}
}

class Geometry {
	constructor(gl, attrArray, element, layout, drawType) {

		const array = new Float32Array(attrArray);

		const bpe = array.BYTES_PER_ELEMENT;
		let stride = 0;
		layout.forEach(size => stride += size*bpe);

		const ref = gl.createVertexArray();
		const vbo = gl.createBuffer();
		const ebo = gl.createBuffer();
		gl.bindVertexArray(ref);
		gl.bindBuffer(GL.ARRAY_BUFFER, vbo);
		gl.bufferData(GL.ARRAY_BUFFER, array, GL.STATIC_DRAW);

		let offset = 0;
		layout.forEach((size, i) => {
			gl.vertexAttribPointer(i, size, GL.FLOAT, false, stride, offset);
			gl.enableVertexAttribArray(i);
			offset += size*bpe;
		});
		
		gl.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, ebo);
		gl.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint32Array(element), GL.STATIC_DRAW);

		this.gl = gl;
		this.ref = ref;
		this.vbo = vbo;
		this.ebo = ebo;
		this.drawType = drawType;
		this.length = element.length;
	}
	draw() {
		const {gl, ref, drawType, length} = this;
		gl.bindVertexArray(ref);
		gl.drawElements(drawType, length, GL.UNSIGNED_INT, 0);
		return this;
	}
	delete() {
		const {gl, ref, vbo, ebo} = this;
		gl.deleteBuffer(vbo);
		gl.deleteBuffer(ebo);
		gl.deleteVertexArray(ref);
		return this;
	}
}

class Cylinder {
	constructor(key, r0, r1, length) {
		this.key = key !== undefined? key: null;
		this.r0 = r0;
		this.r1 = r1;
		this.length = length;
		this.rVals = new Float32Array(4);
		this.zVals = new Float32Array(4);
		this.pickColor = new Float32Array(3);
		this.highlighted = false;
	}
	set(z, scale, pickId) {
		indexToColor(pickId, this.pickColor);
		const {rVals, zVals} = this;
		const r0 = this.r0*scale;
		const r1 = this.r1*scale;
		const z0 = z;
		const z1 = z0 + this.length*scale;
		let s = defaultStripeSize;
		const dr = r1 - r0;
		const dz = z1 - z0;
		s = Math.min(s, dr/3);
		s = Math.min(s, dz/3);
		rVals[0] = r0;
		rVals[1] = r0 + s;
		rVals[2] = r1 - s;
		rVals[3] = r1;
		zVals[0] = z0;
		zVals[1] = z0 + s;
		zVals[2] = z1 - s;
		zVals[3] = z1;
		return this;
	}
}

// ========================<-------------------------------------------->======================== //
// 3D internal methods

// Recalcula as informações da câmera utilizadas na renderização
const updateCamera = () => {

	const {
		world,
		orthographic,
		perspective,
		projection,
		perspectiveLevel,
		angle,
		near,
		far,
		shift,
		orientation,
		distance,
	} = camera;

	const rotation = angularCut(camera.rotation + 90*TO_RAD);
	
	world.clear();
	world.translate(0, 0, shift);
	world.rotateX(rotation);
	world.rotateZ(orientation);
	world.translate(0, 0, -distance);

	const n = near;
	const f = far;

	const pLvl = Math.pow(perspectiveLevel, 4);
	const tan = Math.tan(angle);

	if (pLvl < 1) {
		const mY = 1/(tan*distance);
		const mX = mY/sx*sy;
		let z0 = - distance + totalRadius*3;
		let z1 = - distance - totalRadius*3;
		let r0 = -1;
		let r1 = 1;
		const a = (r1 - r0)/(z1 - z0);
		const b = r0 - z0*a;
		orthographic.set(
			mX,  0, 0, 0,
			 0, mY, 0, 0,
			 0,  0, a, b,
			 0,  0, 0, 1
		);
	}
	if (pLvl > 0) {
		const h = tan*n;
		const w = h/sy*sx;
		perspective.set(
			n/w, 0, 0, 0,
			0, n/h, 0, 0,
			0, 0, (n+f)/(n-f), 2*n*f/(n-f),
			0, 0, -1, 0
		);
	}

	if (pLvl <= 0) {
		projection.set(orthographic);
	} else if (pLvl >= 1) {
		projection.set(perspective);
	} else {
		orthographic.mix(perspective, pLvl, projection);
	}

	cameraUpdated = true;
};

// Renderiza os cilindros coloridos sem iluminação
const renderCylinderColors = () => {
	const prog = programs.colorCylinder;
	glPick.useProgram(prog.ref);
	prog.setMat4('projection', camera.projection);
	prog.setMat4('world', camera.world);
	prog.setMat4('pixelCapture', pixelCapture);
	const geometry = geometries.colorCylinder;
	cylinders.forEach(cylinder => {
		prog.setVec4('rVals', cylinder.rVals);
		prog.setVec4('zVals', cylinder.zVals);
		prog.setVec3('color', cylinder.pickColor);
		geometry.draw();
	});
};

// Renderiza os cilindros
const renderCylinders = () => {
	const prog = programs.solidCylinder;
	gl.useProgram(prog.ref);
	prog.setMat4('projection', camera.projection);
	prog.setMat4('world', camera.world);
	const geometry = geometries.solidCylinder;
	let prevHighlight = null;
	cylinders.forEach(cylinder => {
		const {highlighted} = cylinder;
		if (highlighted !== prevHighlight) {
			if (highlighted) {
				prog.setVec3('cylinder_color', colors.hilightedSolidCylinder.cylinder);
				prog.setVec3('stripe_color', colors.hilightedSolidCylinder.stripe);
			} else {
				prog.setVec3('cylinder_color', colors.solidCylinder.cylinder);
				prog.setVec3('stripe_color', colors.solidCylinder.stripe);
			}
			prevHighlight = highlighted;
		}
		prog.setVec4('rVals', cylinder.rVals);
		prog.setVec4('zVals', cylinder.zVals);
		geometry.draw();
	});
};

const renderAxis = () => {
	const prog = programs.line;
	gl.useProgram(prog.ref);
	prog.setMat4('projection', camera.projection);
	prog.setMat4('world', camera.world);
	geometries.xAxis.draw();
	geometries.yAxis.draw();
	geometries.zAxis.draw();
};

// Busca o ponto mais próximo entre o ponto [x,y] e a linha tangente ao vetor vec
// Retorna um valor que multiplicado pelo vetor vec resulta neste ponto mais próximo, ou seja,
// retorna o valor de [x,y] ao longo do vetor vec.
const getAxisValue = (vec_x, vec_y, x, y) => {
	if (vec_x === 0 && vec_y === 0) {
		return null;
	}
	const mul = sy/Math.sqrt(vec_x*vec_x + vec_y*vec_y);
	vec_x *= mul;
	vec_y *= mul;
	let dx = x - cx;
	let dy = cy - y;
	return valInLine(vec_x, vec_y, dx, dy);
};

// Renderiza o modelo
const render = () => {
	if (viewUpdated === true) return;
	if (!cylinderMappingUpdated) mapCylinders();
	if (!cameraUpdated) updateCamera();
	gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
	renderCylinders();
	renderAxis();
	viewUpdated = true;
};

// ========================<-------------------------------------------->======================== //
// 3D public methods

export const getCanvas = () => canvas;

// Atualiza as dimensões do canvas
export const resize = (width, height) => {
	sx = width;
	sy = height;
	cx = sx*0.5;
	cy = sy*0.5;
	canvas.width = sx;
	canvas.height = sy;
	gl.viewport(0, 0, sx, sy);
	cameraUpdated = false;
	viewUpdated = false;
};

// key: Identificação do cilindro
export const addCylinder = (key, innerRadius, outerRadius, length) => {
	if (key in keyToCylinder) {
		throw 'Cylinder key colision';
	}
	const cylinder = new Cylinder(key, innerRadius, outerRadius, length);
	cylinders.push(cylinder);
	cylinderMappingUpdated = false;
	keyToCylinder[key] = cylinder;
	viewUpdated = false;
	return cylinder;
};

// Remove um cilindro
export const removeCylinder = (key) => {
	const cylinder = keyToCylinder[key];
	if (cylinder === undefined) {
		throw 'Cylinder key not found';
	}
	const index = cylinders.indexOf(cylinder);
	delete keyToCylinder[key];
	cylinders.splice(index, 1);
	cylinderMappingUpdated = false;
	viewUpdated = false;
};

// Atualiza um cilindro
// Campos nulos não serão alterados
export const updateCylinder = (key, innerRadius, outerRadius, length) => {
	const cylinder = keyToCylinder[key];
	if (cylinder === undefined) {
		throw 'Cylinder key not found';
	}
	if (innerRadius != null) {
		cylinder.r0 = innerRadius;
	}
	if (outerRadius != null) {
		cylinder.r1 = outerRadius;
	}
	if (length != null) {
		cylinder.length = length;
	}
	cylinderMappingUpdated = false;
	viewUpdated = false;
};

// Define o valor de destaque de um cilindro
export const highlightCylinder = (key, value = true) => {
	const cylinder = keyToCylinder[key];
	if (cylinder === undefined) {
		throw 'Cylinder key not found';
	}
	cylinder.highlighted = value;
	viewUpdated = false;
};

// Exclui todos os cilindros
export const clearCylinders = () => {
	if (cylinders.length === 0) return;
	cylinders.length = 0;
	cylinderMappingUpdated = false;
	keyToCylinder = {};
	viewUpdated = false;
};

// Retorna a identificação do elemento que aparecem no canvas nas coordenadas x e y
export const elementAt = (x, y) => {
	const dx = (x - cx + 0.5)*2;
	const dy = (cy - y - 0.5)*2;
	pixelCapture.set(
		sx, 0, 0, -dx,
		0, sy, 0, -dy,
		0, 0, 1, 0,
		0, 0, 0, 1
	);
	glPick.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
	renderCylinderColors();
	glPick.finish();
	const pixel = new Uint8Array(4);
	glPick.readPixels(0, 0, 1, 1, GL.RGBA, GL.UNSIGNED_BYTE, pixel);
	const [r, g, b] = pixel;
	const index = colorToIndex(pixel);
	if (index === -1) return null;
	return cylinders[index].key;
};

// Retorna o valor de deslocamento do modelo nas coordenadas x e y do canvas
export const getShiftAt = (x, y) => {
	let dir_x = camera.world[2];
	let dir_y = camera.world[6];
	const res = getAxisValue(dir_x, dir_y, x, y);
	return res === null? null: res*(Math.tan(camera.angle)*camera.distance*2);
};

// Retorna o valor de rotação do modelo nas coordenadas x e y do canvas
export const getRotationAt = (x, y) => {
	let dir_x = camera.world[4];
	let dir_y = - camera.world[0];
	const res = getAxisValue(dir_x, dir_y, x, y);
	return res === null? null: res*TAU;
};

// Retorna o valor de orientação da câmera nas coordenadas x e y do canvas
export const getOrientationAt = (x, y) => {
	let dx = x - cx;
	let dy = cy - y;
	let length = getLength(dx, dy);
	if (length === 0) return null;
	dx /= length;
	dy /= length;
	const res = getAngle(dx, dy);
	return res;
};

// Retorna o valor atual de deslocamento do modelo
export const getShift = () => camera.shift;

// Retorna o valor atual de rotação do modelo
export const getRotation = () => camera.rotation;

// Retorna o valor atual da orientação da câmera
export const getOrientation = () => camera.orientation;

// Retorna a distância atual da câmera
export const getDistance = () => camera.distance;

// Retorna o nível atual de perspectiva da câmera
export const getPerspective = () => camera.perspectiveLevel;

// Retorna a distância inicial da câmera
export const getInitialDistance = () => initialDistance;

// Altera o valor de deslocamento do modelo
export const setShift = shift => {
	camera.shift = shift;
	cameraUpdated = false;
	viewUpdated = false;
};
// Altera o valor de rotação do modelo
export const setRotation = rotation => {
	camera.rotation = angularCut(rotation);
	cameraUpdated = false;
	viewUpdated = false;
};
// Altera o valor da orientação da câmera
export const setOrientation = orientation => {
	camera.orientation = angularCut(orientation);
	cameraUpdated = false;
	viewUpdated = false;
};
// Altera a distância da câmera
export const setDistance = distance => {
	camera.distance = distance;
	cameraUpdated = false;
	viewUpdated = false;
};
// Altera o nível de perspectiva da câmera
export const setPerspective = val => {
	camera.perspectiveLevel = val;
	cameraUpdated = false;
	viewUpdated = false;
};

// Calcula a escala que transforma uma medida em pixels para metros
export const getScale = () => {
	const height = Math.tan(camera.angle)*camera.distance*2;
	return modelScale*sy/height;
	viewUpdated = false;
};

// Inicia o loop de renderização
export const start = () => {
	if (render_request !== null) return;
	const frame = () => {
		render();
		render_request = requestAnimationFrame(frame);
	};
	render_request = requestAnimationFrame(frame);
};

// Para o loop de renderização
export const stop = () => {
	if (render_request !== null) {
		cancelAnimationFrame(render_request);
		render_request = null;
	}
};

// ========================<-------------------------------------------->======================== //
// Fixed geometries

const buildSolidCylinderGeometry = () => {
	const attrArray = [];
	const element = [];
	let length = 0;
	const add = (r0, r1, z0, z1, color, nMul, nZ) => {
		const rMask0 = [0, 0, 0, 0];
		const zMask0 = [0, 0, 0, 0];
		const rMask1 = [0, 0, 0, 0];
		const zMask1 = [0, 0, 0, 0];
		rMask0[r0] = 1;
		zMask0[z0] = 1;
		rMask1[r1] = 1;
		zMask1[z1] = 1;
		for (let i=0; i<nSides; ++i) {
			const angle = step*i;
			const x = Math.cos(angle);
			const y = Math.sin(angle);
			attrArray.push(x, y, ...rMask0, ...zMask0, color, x*nMul, y*nMul, nZ);
			attrArray.push(x, y, ...rMask1, ...zMask1, color, x*nMul, y*nMul, nZ);
			const a = length + i*2;
			const b = a + 1;
			const c = length + ((i+1)%nSides)*2;
			const d = c + 1;
			element.push(a, b, c);
			element.push(b, c, d);
		}
		length += nSides*2;
	};

	// lower face
	add(2, 3, 0, 0, 1, 0, -1);
	add(0, 1, 0, 0, 1, 0, -1);
	add(1, 2, 0, 0, 0, 0, -1);

	// // outer
	add(3, 3, 0, 1, 1, 1, 0);
	add(3, 3, 1, 2, 0, 1, 0);
	add(3, 3, 2, 3, 1, 1, 0);

	// upper face
	add(0, 1, 3, 3, 1, 0, 1);
	add(1, 2, 3, 3, 0, 0, 1);
	add(2, 3, 3, 3, 1, 0, 1);

	// inner
	add(0, 0, 0, 1, 1, -1, 0);
	add(0, 0, 1, 2, 0, -1, 0);
	add(0, 0, 2, 3, 1, -1, 0);

	return new Geometry(gl, attrArray, element, [2, 4, 4, 1, 3], GL.TRIANGLES);
};

const buildClickCylinderGeometry = () => {

	const attrArray = [];
	const element = [];
	let length = 0;
	const add = (r0, r1, z0, z1) => {
		for (let i=0; i<nSides; ++i) {
			const angle = step*i;
			const x = Math.cos(angle);
			const y = Math.sin(angle);
			attrArray.push(x, y, r0, z0);
			attrArray.push(x, y, r1, z1);
			const a = length + i*2;
			const b = a + 1;
			const c = length + ((i+1)%nSides)*2;
			const d = c + 1;
			element.push(a, b, c);
			element.push(b, c, d);
		}
		length += nSides*2;
	};

	add(1, 1, 0, 1);
	add(0, 0, 0, 1);
	add(0, 1, 1, 1);
	add(0, 1, 0, 0);

	return new Geometry(glPick, attrArray, element, [2, 1, 1], GL.TRIANGLES);
};

const buildCenterLine = (dx, dy, dz, r, g, b) => {

	const attrArray = [];
	const element = [];

	const vecLength = Math.sqrt(dx*dx + dy*dy + dz*dz);
	const mul = axisLength*0.5/vecLength;
	dx *= mul;
	dy *= mul;
	dz *= mul;

	attrArray.push(-dx, -dy, -dz, r, g, b);
	attrArray.push(+dx, +dy, +dz, r, g, b);
	element.push(0, 1);

	return new Geometry(gl, attrArray, element, [3, 3], GL.LINES);

};

// ========================<-------------------------------------------->======================== //
// WebGL initialization (1)

canvasColorPicker.width = 1;
canvasColorPicker.height = 1;

gl.clearColor(...bgColor, 1);
gl.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
gl.enable(GL.DEPTH_TEST);

glPick.clearColor(1, 1, 1, 1);
glPick.viewport(0, 0, 1, 1);
glPick.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
glPick.enable(GL.DEPTH_TEST);

// ========================<-------------------------------------------->======================== //
// WebGL initialization (2) - Shaders

// Vertex shader for solid cylinders
shaders.vertex.solidCylinder = createShader(gl, `
	#version 300 es
	precision highp float;
	
	layout (location = 0) in vec2 coord;
	layout (location = 1) in vec4 rMask;
	layout (location = 2) in vec4 zMask;
	layout (location = 3) in float cVal;
	layout (location = 4) in vec3 normal;
	
	uniform vec3 cylinder_color;
	uniform vec3 stripe_color;
	uniform vec4 rVals;
	uniform vec4 zVals;
	uniform mat4 world;
	uniform mat4 projection;
	
	out vec3 vCoord;
	out vec3 vColor;
	out vec3 vNormal;
	
	void main() {
		
		float r = dot(rMask, rVals);
		float z = dot(zMask, zVals);
		
		vCoord = (world*vec4(vec3(coord*r, z), 1.0)).xyz;
		vColor = mix(cylinder_color, stripe_color, cVal);
		vNormal = mat3(world)*normal;
		
		gl_Position = projection*vec4(vCoord, 1.0);
	}
`, GL.VERTEX_SHADER);

shaders.vertex.colorCylinder = createShader(glPick, `

	#version 300 es
	precision highp float;
	
	layout (location = 0) in vec2 coord;
	layout (location = 1) in float rVal;
	layout (location = 2) in float zVal;
	
	uniform vec4 rVals;
	uniform vec4 zVals;

	uniform mat4 world;
	uniform mat4 projection;
	uniform mat4 pixelCapture;
	
	void main() {
		
		float r = mix(rVals[0], rVals[3], rVal);
		float z = mix(zVals[0], zVals[3], zVal);
		gl_Position = pixelCapture*(projection*world*vec4(vec3(coord*r, z), 1.0));
	}

`, GL.VERTEX_SHADER);

shaders.vertex.line = createShader(gl, `

	#version 300 es
	precision highp float;
	
	layout (location = 0) in vec3 vCoord;
	layout (location = 1) in vec3 vColor;

	out vec3 color;
	
	uniform mat4 world;
	uniform mat4 projection;
	
	void main() {
		color = vColor;
		gl_Position = projection*world*vec4(vCoord, 1.0);
	}

`, GL.VERTEX_SHADER);

// Fragment shader for solid geometries
shaders.fragment.solid = createShader(gl, `

	#version 300 es
	precision highp float;
	
	in vec3 vCoord;
	in vec3 vColor;
	in vec3 vNormal;

	out vec4 FragColor;
	
	void main() {

		float brightness = length(vColor);
		vec3 lightCoord = vec3(50.0, 25.0, 100.0);
		vec3 lightRay = lightCoord - vCoord;
		vec3 lightDir = normalize(lightRay);
		float angle = dot(lightDir, vNormal)*0.6 + 0.5;

		FragColor = vec4(vColor*angle, 1.0);
	}

`, GL.FRAGMENT_SHADER);

shaders.fragment.color = createShader(glPick, `

	#version 300 es
	precision highp float;
	
	out vec4 FragColor;
	uniform vec3 color;
	
	void main() {
		FragColor = vec4(color, 1.0);
	}

`, GL.FRAGMENT_SHADER);

shaders.fragment.line = createShader(gl, `

	#version 300 es
	precision highp float;
	
	in vec3 color;
	out vec4 FragColor;
	
	void main() {
		FragColor = vec4(color, 1.0);
	}

`, GL.FRAGMENT_SHADER);

// ========================<-------------------------------------------->======================== //
// WebGL initialization (2) - Programs

// Program for solid objects seen by the camera
programs.solidCylinder = new Program(gl, shaders.vertex.solidCylinder, shaders.fragment.solid,
	'projection', 'world', 'rVals', 'zVals', 'cylinder_color', 'stripe_color');

programs.colorCylinder = new Program(glPick, shaders.vertex.colorCylinder, shaders.fragment.color,
	'projection', 'world', 'rVals', 'zVals', 'color', 'pixelCapture');

programs.line = new Program(gl, shaders.vertex.line, shaders.fragment.line, 'projection', 'world');

// ========================<-------------------------------------------->======================== //
// WebGL initialization (3) - Geometries

geometries.solidCylinder = buildSolidCylinderGeometry();
geometries.colorCylinder = buildClickCylinderGeometry();
geometries.xAxis = buildCenterLine(1, 0, 0, 0.9, 0.15, 0.15);
geometries.yAxis = buildCenterLine(0, 1, 0, 0.0, 0.6, 0.2);
geometries.zAxis = buildCenterLine(0, 0, 1, 0.2, 0.2, 0.9);

// End of file
// ========================<-------------------------------------------->======================== //