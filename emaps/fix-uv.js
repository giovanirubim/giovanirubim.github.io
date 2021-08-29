const parseText = (text) => text.trim()
	.split(/\s*\n\s*/)
	.map((line) => {
		const [, type = '?', values = null ] = line.match(/^(v\w?|f|l)\s(.*)$/) ?? [];
		return { type, values, line };
	});

const vertexToUV = ([x, y, z], toNormal) => {
	const [ lat, long ] = xyzToCoord(x, y, z);
	const [ nx, ny ] = toNormal(lat, long);
	return [(nx + 1)*0.5, (ny + 1)*0.5];
};

const chunkify = (array) => {
	let chunk = [array[0]];
	let chunks = [chunk];
	let currentType = array[0].type;
	let chunkMap = {[currentType]: chunk};
	for (let i=1; i<array.length; ++i) {
		const item = array[i];
		if (item.type === currentType) {
			chunk.push(item);
		} else {
			chunk = [item];
			chunks.push(chunk);
			currentType = item.type;
			chunkMap[currentType] = chunk;
		}
	}
	return { chunks, chunkMap };
};

const replaceArray = (old, array) => {
	old.splice(0, old.length, ...array);
};

function updateUV(vertices, oldUv, toNormal) {
	const newUv = vertices
		.map((item, index) => {
			const id = index + 1;
			return item.values.split('\x20').map(Number);
		})
		.map((vertex) => vertexToUV(vertex, toNormal))
		.map((uv) => ({
			line: `vt ${uv.map(x => x.toFixed(6)).join('\x20')}`
		}));
	replaceArray(oldUv, newUv);
}

const updateFaces = (faces) => {
	faces.forEach((item) => {
		const values = item.values.split(/\s/).map((val) => {
			val = val.split('/');
			val[1] = val[0];
			return val.join('/');
		});
		item.line = `f ${values.join('\x20')}`;
	});
};

const fixUv = (text, toNormal) => {
	const parsed = parseText(text);
	const { chunks, chunkMap } = chunkify(parsed);
	updateUV(chunkMap.v, chunkMap.vt, toNormal);
	updateFaces(chunkMap.f);
	return chunks.map(
		(chunk) => chunk.map(item => item.line).join('\n'),
	).join('\n') + '\n';
};