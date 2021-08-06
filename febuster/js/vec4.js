class Vec4 extends Array {
	constructor() {
		super(4);
	}
	get x() { return this[0]; }
	get y() { return this[1]; }
	get z() { return this[2]; }
	get w() { return this[3]; }
	set x(value) { this[0] = value; }
	set y(value) { this[1] = value; }
	set z(value) { this[2] = value; }
	set w(value) { this[3] = value; }
}
