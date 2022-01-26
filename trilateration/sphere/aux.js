const { PI, sin, cos } = Math;
const TAU = PI*2;

// const width = 800;
// const height = 400;
// const border = 100;
// const canvas = document.createElement('canvas');
// canvas.width = width + border*2;
// canvas.height = height + border*2;
// document.body.appendChild(canvas);

// const ctx = canvas.getContext('2d');
// ctx.fillStyle = '#222';
// ctx.fillRect(0, 0, border*2 + width, border*2 + height);
// ctx.font = '12px monospace';
// ctx.textAlign = 'center'
// ctx.textBaseline = 'bottom'

// const round = arr => arr.map(val => val.toFixed(1)*1).join(', ');
// const getCanvasXy = ({ lat, long }) => [
// 	(long/PI*180 + 180)/360*width + border,
// 	(90 - lat/PI*180)/180*height + border,
// ];

const drawVertex = (vertex) => {
	let { lat, long, x, y, z, uvx, uvy } = vertex;
	let text = [
		// 'LL: ' + round([ lat, long ].map(val => (val/PI*180))),
		// 'V: ' + round([ x, y, z ]),
		round([ uvx, uvy ]),
	];
	ctx.beginPath();
	const pos = getCanvasXy(vertex);
	ctx.arc(...pos, 4, 0, TAU);
	ctx.fillStyle = '#fff';
	ctx.fill();
	for (let i=0; i<text.length; ++i) {
		ctx.fillText(text[i], pos[0], pos[1] - (i + 0.5)*12);
	}
};
const drawTriangle = (vertices) => {
	ctx.beginPath();
	vertices.forEach((v, i) => {
		if (i == 0) {
			ctx.moveTo(...getCanvasXy(v));
		} else {
			ctx.lineTo(...getCanvasXy(v));
		}
	});
	ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
	ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
};

const createSphere = (segments, rings) => {
	const normals = [];
	const vertices = [];
	const normalMap = {};
	const triangles = [];
	const normalToKey = (...args) => args.map(x => x.toFixed(8)*1).join('/');
	const addNormal = (...args) => {
		const key = normalToKey(...args);
		const id = normalMap[key];
		if (id !== undefined) return id;
		return normalMap[key] = normals.push(args);
	};
	const vertex = (lat, long) => {
		const uvx = long/TAU + 0.5;
		const uvy = lat/PI + 0.5;
		const rad = cos(lat);
		const x = sin(long)*rad;
		const y = sin(lat);
		const z = cos(long)*rad;
		const vertex = {
			lat, long,
			x, y, z,
			uvx,
			uvy,
			normal: addNormal(x, y, z),
		};
		vertices.push(vertex);
	};
	const triangle = (...args) => {
		triangles.push(args.map(i => i + 1));
	};
	for (let i=0; i<=segments; ++i) {
		for (let j=0; j<=rings; ++j) {
			const end = j%rings === 0;
			if (end && i === segments) continue;
			const lat = (0.5 - j/rings)*PI;
			const long = ((i + end*0.5)/segments*2 - 1)*PI;
			vertex(lat, long);
		}
		if (i === 0) continue;
		const last = i === segments;
		const prev = (i - 1)*(rings + 1);
		const curr = i*(rings + 1);
		const mid = curr + 1 - last;
		triangle(prev, prev + 1, mid);
		for (let j=1; j<rings-1; ++j) {
			triangle(prev + j, prev + j + 1, mid + j - 1);
			triangle(mid - 1 + j, prev + j + 1, mid + j);
		}
		triangle(prev + rings - 1, prev + rings, mid + rings - 2);
	}
	// triangles.forEach(triangle => {
	// 	const v = triangle.map(i => vertices[i - 1]);
	// 	drawTriangle(v);
	// });
	// vertices.forEach(drawVertex);
	return { vertices, triangles, normals };
};

const toWavefrontObj = ({ vertices, triangles, normals }) => {
	let output = '';
	for (let { x, y, z, uvx, uvy } of vertices) {
		output += `v ${
			x.toFixed(10)
		} ${
			y.toFixed(10)
		} ${
			z.toFixed(10)
		}\n`;
		output += `vt ${
			uvx.toFixed(10)
		} ${
			uvy.toFixed(10)
		}\n`;
	}
	for (let [ x, y, z ] of normals) {
		output += `vn ${
			x.toFixed(10)
		} ${
			y.toFixed(10)
		} ${
			z.toFixed(10)
		}\n`;
	}
	for (let triangle of triangles) {
		const [ a, b, c ] = triangle;
		const [ na, nb, nc ] = triangle.map(i => vertices[i - 1].normal);
		output += `f ${a}/${a}/${na} ${b}/${b}/${nb} ${c}/${c}/${nc}\n`;
	}
	return output;
};

const loadImage = src => new Promise((done, fail) => {
	const image = new Image();
	image.onload = () => done(image);
	image.onerror = error => fail(error);
	image.src = src;
});

window.onload = async () => {
	// img = await loadImage('texture.jpg');
	// ctx.globalAlpha = 0.4;
	// ctx.drawImage(img, border, border, width, height);
	// ctx.globalAlpha = 1;
	const sphere = createSphere(90, 45);
	const obj = toWavefrontObj(sphere);
	const link = document.createElement('a');
	link.innerText = 'Download OBJ';
	link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(obj));
	link.setAttribute('download', 'sphere.obj');
	document.body.appendChild(link);
};
