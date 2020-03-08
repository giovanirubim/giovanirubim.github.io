const mulMatMat = (m1, m2, r) => {
	const r0 = m1[0x0]*m2[0x0] + m1[0x1]*m2[0x4] + m1[0x2]*m2[0x8] + m1[0x3]*m2[0xc];
	const r1 = m1[0x0]*m2[0x1] + m1[0x1]*m2[0x5] + m1[0x2]*m2[0x9] + m1[0x3]*m2[0xd];
	const r2 = m1[0x0]*m2[0x2] + m1[0x1]*m2[0x6] + m1[0x2]*m2[0xa] + m1[0x3]*m2[0xe];
	const r3 = m1[0x0]*m2[0x3] + m1[0x1]*m2[0x7] + m1[0x2]*m2[0xb] + m1[0x3]*m2[0xf];
	const r4 = m1[0x4]*m2[0x0] + m1[0x5]*m2[0x4] + m1[0x6]*m2[0x8] + m1[0x7]*m2[0xc];
	const r5 = m1[0x4]*m2[0x1] + m1[0x5]*m2[0x5] + m1[0x6]*m2[0x9] + m1[0x7]*m2[0xd];
	const r6 = m1[0x4]*m2[0x2] + m1[0x5]*m2[0x6] + m1[0x6]*m2[0xa] + m1[0x7]*m2[0xe];
	const r7 = m1[0x4]*m2[0x3] + m1[0x5]*m2[0x7] + m1[0x6]*m2[0xb] + m1[0x7]*m2[0xf];
	const r8 = m1[0x8]*m2[0x0] + m1[0x9]*m2[0x4] + m1[0xa]*m2[0x8] + m1[0xb]*m2[0xc];
	const r9 = m1[0x8]*m2[0x1] + m1[0x9]*m2[0x5] + m1[0xa]*m2[0x9] + m1[0xb]*m2[0xd];
	const ra = m1[0x8]*m2[0x2] + m1[0x9]*m2[0x6] + m1[0xa]*m2[0xa] + m1[0xb]*m2[0xe];
	const rb = m1[0x8]*m2[0x3] + m1[0x9]*m2[0x7] + m1[0xa]*m2[0xb] + m1[0xb]*m2[0xf];
	const rc = m1[0xc]*m2[0x0] + m1[0xd]*m2[0x4] + m1[0xe]*m2[0x8] + m1[0xf]*m2[0xc];
	const rd = m1[0xc]*m2[0x1] + m1[0xd]*m2[0x5] + m1[0xe]*m2[0x9] + m1[0xf]*m2[0xd];
	const re = m1[0xc]*m2[0x2] + m1[0xd]*m2[0x6] + m1[0xe]*m2[0xa] + m1[0xf]*m2[0xe];
	r[0xf] = m1[0xc]*m2[0x3] + m1[0xd]*m2[0x7] + m1[0xe]*m2[0xb] + m1[0xf]*m2[0xf];
	r[0xe] = re;
	r[0xd] = rd;
	r[0xc] = rc;
	r[0xb] = rb;
	r[0xa] = ra;
	r[0x9] = r9;
	r[0x8] = r8;
	r[0x7] = r7;
	r[0x6] = r6;
	r[0x5] = r5;
	r[0x4] = r4;
	r[0x3] = r3;
	r[0x2] = r2;
	r[0x1] = r1;
	r[0x0] = r0;
};

const mulMatVec = (m, v, r) => {
	const r0 = m[0x0]*v[0] + m[0x1]*v[1] + m[0x2]*v[2] + m[0x3]*v[3];
	const r1 = m[0x4]*v[0] + m[0x5]*v[1] + m[0x6]*v[2] + m[0x7]*v[3];
	const r2 = m[0x8]*v[0] + m[0x9]*v[1] + m[0xa]*v[2] + m[0xb]*v[3];
	r[3] = m[0xc]*v[0] + m[0xd]*v[1] + m[0xe]*v[2] + m[0xf]*v[3];
	r[2] = r2;
	r[1] = r1;
	r[0] = r0;
};

const mixMatMat = (m1, m2, value, r) => {
	value = Math.max(Math.min(value, 1), 0);
	const inv = 1 - value;
	for (let i=16; i--; r[i] = m1[i]*inv + m2[i]*value);
};

const rotateX = (m, angle, r) => {
	const cos = Math.cos(angle);
	const sin = Math.sin(angle);
	const aux = [
		1,  0 ,   0,  0,
		0, cos, -sin, 0,
		0, sin,  cos, 0,
		0,  0 ,   0 , 1
	];
	mulMatMat(aux, m, r);
};

const rotateY = (m, angle, r) => {
	const cos = Math.cos(angle);
	const sin = Math.sin(angle);
	const aux = [
		 cos, 0, sin, 0,
		  0 , 1,  0 , 0,
		-sin, 0, cos, 0,
		  0 , 0,  0 , 1
	];
	mulMatMat(aux, m, r);
};

const rotateZ = (m, angle, r) => {
	const cos = Math.cos(angle);
	const sin = Math.sin(angle);
	const aux = [
		cos, -sin, 0, 0,
		sin,  cos, 0, 0,
		 0 ,   0 , 1, 0,
		 0 ,   0 , 0, 1
	];
	mulMatMat(aux, m, r);
};

const scale = (m, x, y, z, r) => {
	const aux = [
		x, 0, 0, 0,
		0, y, 0, 0,
		0, 0, z, 0,
		0, 0, 0, 1
	];
	mulMatMat(aux, m, r);
};

export default class Transform extends Float32Array {
	constructor() {
		super(16);
		this[0x0] = 1;
		this[0x5] = 1;
		this[0xa] = 1;
		this[0xf] = 1;
	}
	clear() {
		this.fill(0);
		this[0x0] = 1;
		this[0x5] = 1;
		this[0xa] = 1;
		this[0xf] = 1;
		return this;
	}
	clone() {
		return new Transform().set(...this);
	}
	set() {
		if (arguments.length === 1) return this.set(...arguments[0]);
		for (let i=16; i--;) this[i] = arguments[i];
		return this;
	}
	apply(other, dst) {
		if (!dst) dst = this;
		mulMatMat(other, this, dst);
		return dst;
	}
	rotateX(angle, dst) {
		if (!dst) dst = this;
		rotateX(this, angle, dst);
		return dst;
	}
	rotateY(angle, dst) {
		if (!dst) dst = this;
		rotateY(this, angle, dst);
		return dst;
	}
	rotateZ(angle, dst) {
		if (!dst) dst = this;
		rotateZ(this, angle, dst);
		return dst;
	}
	rotateXYZ(x, y, z, dst) {
		if (!dst) dst = this;
		this.rotateX(x, dst);
		dst.rotateY(y);
		dst.rotateZ(z);
		return dst;
	}
	translate(x, y, z, dst) {
		if (!dst) dst = this;
		else dst.set(...this);
		dst[0x3] += x;
		dst[0x7] += y;
		dst[0xb] += z;
		return dst;
	}
	scale(x, y, z, dst) {
		if (!dst) dst = this;
		scale(this, x, y, z, dst);
		return dst;
	}
	mix(other, value, dst) {
		if (!dst) dst = this;
		mixMatMat(this, other, value, dst);
		return dst;
	}
	applyTo(vec, dst) {
		if (!dst) dst = vec;
		mulMatVec(this, vec, dst);
		return dst;
	}
}