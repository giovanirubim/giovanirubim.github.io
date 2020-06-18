// Tipos
// 1 - Assintomático
// 2 - Sintomático

// Estados
// 1 (sem sintomas)
// 2 (sintomático)
// 3 (hospitalizado)
// 4 (internado)
// 5 (morto)
// 6 (recuperado)

const rand = (a, b) => {
	let min, max;
	if (b == null) {
		min = 1;
		max = a;
	} else {
		min = a;
		max = b;
	}
	return Math.floor(Math.random()*(max - min + 1)) + min;
};

class Case {
	constructor() {
		this.time0 = timestamp;
		this.type = rand(2);
		this.state = 1;
	}
}