// ========================<-------------------------------------------->======================== //
// Cria uma animação

// step: função executada a cada passo da animação
// duration: duração da animação
// finish: função executada ao final da animação
// retorna um objeto contendo os métodos stop (para a animação, não chama o finish) e finish
// (pula para o final da animação), e as flags booleanas finished e running

const createInterval = step => {
	const obj = {running: true};
	const tic = () => {
		if (obj.running === false) {
			return;
		}
		step();
		requestAnimationFrame(tic);
	};
	tic();
	return obj;
};

const stopInterval = value => {
	value && (value.running = false);
};

const animate = (step, a, b) => {
	let config, finish;
	if (b !== undefined) {
		config = a;
		finish = b;
	} else if (a !== undefined) {
		if (a instanceof Object) {
			config = a;
		} else {
			finish = a;
		}
	}
	const {duration = 750} = config ?? {};
	const ini = new Date();
	let interval = null;
	interval = createInterval(() => {
		if (interval === null) return;
		const t = Math.min(1, (new Date() - ini)/duration);
		step(t);
		if (t === 1 && interval !== null) {
			stopInterval(null);
			result.running = false;
			interval = null;
			finish?.();
			result.finished = true;
		}
	}, 0);
	const result = {
		stop: () => {
			if (interval === null) {
				return false;
			}
			stopInterval(interval);
			result.running = false;
			interval = null;
			return true;
		},
		finish: () => {
			if (interval === null) {
				return false;
			}
			step(1);
			if (interval === null) {
				return false;
			}
			stopInterval(interval);
			result.running = false;
			interval = null;
			finish?.();
			result.finished = true;
			return true;
		},
		finished: false,
		running: true
	}
	return result;
};
export default animate;

// End of File
// ========================<-------------------------------------------->======================== //