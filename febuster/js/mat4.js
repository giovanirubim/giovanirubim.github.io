class Mat4 extends Array {
	constructor() {
		super(16);
	}
}

export default function mat4(...args) {
	const mat = new Mat4();
	args.forEach((val, i) => mat[i] = val);
	return mat;
}

