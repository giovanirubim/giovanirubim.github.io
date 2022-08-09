const endTime = new Date('2022-08-09T20:35:00.000-04:00');
window.onload = _ => {
		
	const canvas = document.querySelector("canvas");
	const ctx = canvas.getContext("2d");
	const screenSize = {x: null, y: null};

	const timer = new ArcTimer(endTime);
	window.timer = timer;

	const screenSizeUpdated = _ => {
		const {innerWidth, innerHeight} = window;
		const {x, y} = screenSize;
		if (innerWidth === x && innerHeight === y) {
			return false;
		}
		screenSize.x = innerWidth;
		screenSize.y = innerHeight;
		return true;
	};

	const updateCanvasSize = _ => {
		if (screenSizeUpdated()) {
			canvas.width  = screenSize.x;
			canvas.height = screenSize.y;
		}
	};

	const calcMul = x => {
		if (x >= 1) {
			return Math.pow(3, x - 1);
		}
		if (x <= -1) {
			return - Math.pow(3, - 1 - x);
		}
		return x;
	};

	let mul = 1;
	let baseTime = new Date();
	let flagTime = new Date();

	const getTime = _ => {
		let now = new Date();
		let dif = (now - flagTime)*calcMul(mul);
		return new Date(baseTime*1 + dif);
	};

	const storeTime = now => {
		baseTime = getTime();
		flagTime = now;
	};

	this.onwheel = event => {
		storeTime(new Date());
		if (event.shiftKey) {
			mul -= event.deltaY*0.005;
		} else {
			mul -= event.deltaY*0.001;
		}
	};

	this.onkeydown = event => {
		const key = event.key.toLowerCase();
		if (key === " ") {
			storeTime(new Date());
			if (mul === 0) {
				mul = 1;
			} else {
				mul = 0;
			}
		} else if (key === "esc" || key === "escape") {
			baseTime = new Date();
			flagTime = new Date();
		}
	};

	setInterval(_ => {
		updateCanvasSize();
		const maxRadius = Math.min(screenSize.x, screenSize.y)*0.45;
		const x = screenSize.x*0.5;
		const y = screenSize.y*0.5;
		ctx.fillStyle = '#222'
		ctx.fillRect(0, 0, screenSize.x, screenSize.y);
		ctx.textAlign = "left";
		ctx.textBaseline = "top";
		ctx.font = "16px monospace";
		ctx.fillStyle = "#777";
		timer.draw(ctx, getTime(), x, y, maxRadius);
	}, 0);

};
