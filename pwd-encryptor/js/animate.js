const duration = 250;

export const animate = (fn) => new Promise((done) => {
	const start = Date.now();
	const next = () => {
		const now = Date.now();
		const normal = (now - start)/duration;
		const dt = Math.min(1, normal);
		const smooth = (1 - Math.cos(dt*Math.PI))/2;
		fn(smooth);
		if (dt < 1) {
			requestAnimationFrame(next);
		} else {
			done();
		}
	};
	next();
});
