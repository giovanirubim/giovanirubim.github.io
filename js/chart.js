const PI = Math.PI;
const Q0 = PI*0.0;
const Q1 = PI*0.5;
const Q2 = PI*1.0;
const Q3 = PI*1.5;
const Q4 = PI*2.0;

const getLimit = array => {
	let max = -Infinity;
	let min = +Infinity;
	array.forEach(value => {
		min = Math.min(min, value);
		max = Math.max(max, value);
	});
	return [min, max];
};

const addLimits = ([aMin, aMax], [bMin, bMax]) => {
	return [ Math.min(aMin, bMin), Math.max(aMax, bMax) ];
};

const calcDistance = (ax, ay, bx, by) => {
	const dx = bx - ax;
	const dy = by - ay;
	return Math.sqrt(dx*dx + dy*dy);
};

const roundedRect = (ctx, x, y, sx, sy, radius) => {
	const x0 = x;
	const x1 = x + radius;
	const x3 = x + sx;
	const x2 = x3 - radius;
	const y0 = y;
	const y1 = y + radius;
	const y3 = y + sy;
	const y2 = y3 - radius;
	ctx.arc(x2, y2, radius, Q0, Q1);
	ctx.lineTo(x1, y3);
	ctx.arc(x1, y2, radius, Q1, Q2);
	ctx.lineTo(x0, y1);
	ctx.arc(x1, y1, radius, Q2, Q3);
	ctx.lineTo(x2, y0);
	ctx.arc(x2, y1, radius, Q3, Q4);
};

const scinot = value => {
	if (!value) return 0;
	let nValid = 4;
	let sign = '';
	if (value < 0) {
		value = -value;
		sign = '-';
	}
	let shift = - Math.floor(Math.log10(value));
	if (Math.abs(shift) > 3) {
		let pow = Math.pow(10, nValid + shift - 1);
		value = Math.round(pow*value);
		value /= Math.pow(10, nValid - 1);
		return sign + value + 'e' + (-shift);
	}
	let roundShift = (nValid + shift - 1);
	pow = Math.pow(10, roundShift);
	return sign + Math.round(value*pow)/pow;
};

class Plotter {

	constructor(config = {}) {

		// Creates attribute with default value
		const addAttr = (name, def) => {
			const val = config[name];
			this[name] = val === undefined? def: val;
		};

		// Creates the attributes with default values
		addAttr('width', 600);
		addAttr('height', 450);
		addAttr('paddingT', 36.5);
		addAttr('paddingL', 66.5);
		addAttr('paddingB', 36.5);
		addAttr('paddingR', 36.5);
		addAttr('lineWidth', 3);
		addAttr('baseAxis', 'x');
		addAttr('x0', null);
		addAttr('x1', null);
		addAttr('y0', null);
		addAttr('y1', null);
		addAttr('xAxisFontSize', 16);
		addAttr('xAxisLabel', '<x axis>');
		addAttr('xAxisMargin', 5);
		addAttr('xValuesFontSize', 10);
		addAttr('yAxisFontSize', 16);
		addAttr('yAxisLabel', '<y axis>');
		addAttr('yAxisMargin', 10);
		addAttr('yValuesFontSize', 10);
		addAttr('background', '#111');
		addAttr('color', '#fff');
		addAttr('mouseRadius', 15);
		addAttr('spotRadius', 5);
		addAttr('targetSize', 20);
		addAttr('targetMargin', 12);
		addAttr('targetBorderRadius', 4);
		addAttr('axisLineWidth', 1);
		addAttr('xMinDistance', 100);
		addAttr('yMinDistance', 50);

		if (config.canvas) {
			this.setCanvas(config.canvas);
		}

		this.min_x = null;
		this.max_x = null;
		this.min_y = null;
		this.max_y = null;

		this.pairs = [];
		this.measures = null;

	}

	// Updates canvas size
	resize(width, height) {
		const {canvas, ctx} = this;
		this.width = width;
		this.height = height;
		if (canvas) {
			canvas.width = this.width;
			canvas.height = this.height;
		}
		return this;
	}

	drawTarget(val_x, val_y, color) {
		const {ctx} = this;
		const {
			mul_x, sum_x,
			mul_y, sum_y,
			content_x0, content_y0
		} = this.measures;
		const x = val_x*mul_x + sum_x;
		const y = val_y*mul_y + sum_y;
		ctx.lineWidth = this.axisLineWidth;
		ctx.strokeStyle = this.color;
		ctx.setLineDash([5, 5]);
		ctx.moveTo(content_x0, y);
		ctx.lineTo(x, y);
		ctx.lineTo(x, content_y0);
		ctx.stroke();
		ctx.setLineDash([]);
		const text = scinot(val_y);
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.arc(x, y, this.spotRadius, 0, Q4);
		ctx.fill();
		const targetSy = this.targetSize;
		const y1 = y - this.targetMargin;
		const y0 = y1 - targetSy;
		const fontSize = targetSy*0.6;
		ctx.font = 'bold ' + fontSize + 'px arial';
		const targetSx = ctx.measureText(text).width + (targetSy - fontSize);
		const x0 = x - targetSx/2;
		const x1 = x + targetSx/2;
		ctx.beginPath();
		roundedRect(ctx, x0, y0, x1 - x0, y1 - y0, this.targetBorderRadius);
		ctx.fill();
		const tipSize = targetSy*0.25;
		ctx.beginPath();
		ctx.moveTo(x - tipSize, y1 - 0.5);
		ctx.lineTo(x + tipSize, y1 - 0.5);
		ctx.lineTo(x, y1 + tipSize - 0.5);
		ctx.fill();
		ctx.textBaseline = 'middle';
		ctx.textAlign = 'center';
		ctx.fillStyle = this.background;
		ctx.fillText(text, (x0 + x1)/2, (y0 + y1)/2);
		return this;
	}

	// Adds the event listeners
	bindCanvas() {
		this.canvas.addEventListener('mousemove', e => {
			this.plot();
			const {pair, index, distance} = this.nearestDot(e.offsetX, e.offsetY);
			if (distance > this.mouseRadius) {
				return;
			}
			const x = pair.x[index];
			const y = pair.y[index];
			this.drawTarget(x, y, pair.color || this.color);
		});
		return this;
	}

	// Sets the canvas DOM element
	setCanvas(canvas) {
		if (this.canvas === canvas) {
			return this;
		}
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
		this.resize(this.width, this.height);
		this.bindCanvas(canvas);
		return this;
	}

	setLimits([min_x, max_x], [min_y, max_y]) {
		this.min_x = min_x;
		this.max_x = max_x;
		this.min_y = min_y;
		this.max_y = max_y;
		return this;
	}

	autoLimit() {
		let min_x = Infinity, max_x = -Infinity;
		let min_y = Infinity, max_y = -Infinity;
		this.pairs.forEach(pair => {
			let [min, max] = getLimit(pair.x);
			min_x = Math.min(min_x, min);
			max_x = Math.max(max_x, max);
			[min, max] = getLimit(pair.y);
			min_y = Math.min(min_y, min);
			max_y = Math.max(max_y, max);
		});
		console.log({
			min_x, max_x,
			min_y, max_y,
		})
		this.min_x = min_x;
		this.max_x = max_x;
		this.min_y = min_y;
		this.max_y = max_y;
		return this;
	}

	// Calculate the values required to draw the chart
	measure() {

		const size_x = this.width;
		const size_y = this.height;

		if (this.min_x === null) this.autoLimit();
		const {min_x, max_x, min_y, max_y} = this;
		
		// Chart data limits (pixels)
		const content_x0 = this.paddingL;
		const content_x1 = size_x - this.paddingR;
		const content_y0 = size_y - this.paddingB;
		const content_y1 = this.paddingT;
		const center_x = (content_x0 + content_x1)*0.5;
		const center_y = (content_y0 + content_y1)*0.5;

		// Variables to convert char value into pixels
		const mul_x = (content_x1 - content_x0)/(max_x - min_x);
		const sum_x = content_x1 - mul_x*max_x;
		const mul_y = (content_y1 - content_y0)/(max_y - min_y);
		const sum_y = content_y1 - mul_y*max_y;

		const { xMinDistance, yMinDistance } = this;
		const delta_x = xMinDistance/mul_x;
		const delta_y = yMinDistance/mul_y;

		this.measures = {
			size_x, size_y,
			content_x0, content_x1,
			content_y0, content_y1,
			center_x, center_y,
			mul_x, sum_x,
			mul_y, sum_y,
			delta_x, delta_y
		};

		return this;
	}

	clearCanvas() {

		const {measures, ctx} = this;
		const {
			size_x, size_y
		} = measures;

		ctx.fillStyle = this.background;
		ctx.fillRect(0, 0, size_x, size_y);

		return this;
	}

	drawAxes() {
		
		const {
			measures, ctx,
			color,
			xAxisLabel, xAxisFontSize, xAxisMargin,
			yAxisLabel, yAxisFontSize, yAxisMargin,
			axisLineWidth,
		} = this;
		const {
			size_y,
			content_x0, content_x1,
			content_y0, content_y1,
			center_x, center_y,
		} = measures;
		
		ctx.lineWidth = axisLineWidth;

		// Draw axes lines
		ctx.strokeStyle = color;
		ctx.beginPath();
		ctx.moveTo(content_x0, content_y1);
		ctx.lineTo(content_x0, content_y0);
		ctx.lineTo(content_x1, content_y0);
		ctx.stroke();

		// Draw x axis label
		ctx.fillStyle = color;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'bottom';
		ctx.font = xAxisFontSize + 'px arial';
		ctx.fillText(xAxisLabel, center_x, size_y - xAxisMargin);

		// Draw y axis label
		ctx.textBaseline = 'top';
		ctx.font = yAxisFontSize + 'px arial';
		ctx.setTransform(0, -1, 1, 0, 0, center_y);
		ctx.fillText(yAxisLabel, 0, yAxisMargin);
		ctx.setTransform(1, 0, 0, 1, 0, 0);

		return this;
	}

	drawRuler() {
		const {ctx, measures} = this;
		const {
			mul_x, sum_x,
			mul_y, sum_y,
			delta_x, delta_y,
			content_x0, content_x1,
			content_y0, content_y1,
		} = measures;
		let x = content_x0;
		let dx = delta_x*mul_x;
		let dy = delta_y*mul_y;
		let margin = 5;

		ctx.lineWidth = this.axisLineWidth;

		ctx.font = this.xValuesFontSize + 'px arial';
		ctx.textBaseline = 'top';
		ctx.textAlign = 'center';
		ctx.beginPath();
		const y0 = content_y0;
		const y1 = y0 + margin*(2/3);
		const y2 = y0 + margin;
		while (x <= content_x1) {
			ctx.moveTo(x, y0);
			ctx.lineTo(x, y1);	
			let xVal = (x - sum_x)/mul_x;
			ctx.fillText(scinot(xVal), x, y2);
			x += dx;
		}

		ctx.font = this.yValuesFontSize + 'px arial';
		ctx.textBaseline = 'middle';
		ctx.textAlign = 'right';
		let y = content_y0;
		const x0 = content_x0;
		const x1 = x0 - margin*(2/3);
		const x2 = x0 - margin;
		while (y >= content_y1) {
			ctx.moveTo(x0, y);
			ctx.lineTo(x1, y);
			let yVal = (y - sum_y)/mul_y;
			ctx.fillText(scinot(yVal), x2, y);
			y -= dy;
		}
		ctx.stroke();
	}

	addLine(pair) {
		this.pairs.push(pair);
		return this;
	}

	// TODO: optimize with 
	nearestDot(x, y) {
		const {
			mul_x, sum_x,
			mul_y, sum_y,
		} = this.measures;
		let dist = Infinity;
		let res = {pair: null, index: -1, distance: null};
		this.pairs.forEach(pair => {
			const array_x = pair.x;
			const array_y = pair.y;
			const length = Math.min(array_x.length, array_y.length);
			for (let i=0; i<length; ++i) {
				const temp_x = array_x[i]*mul_x + sum_x;
				const temp_y = array_y[i]*mul_y + sum_y;
				const tempDir = calcDistance(x, y, temp_x, temp_y);
				if (tempDir < dist) {
					dist = tempDir;
					res.pair = pair;
					res.index = i;
					res.distance = tempDir;
				}
			}
		});
		return res;
	}

	plotPair(pair) {
	
		const {ctx, measures} = this;		
		const array_x = pair.x;
		const array_y = pair.y;
		const {mul_x, sum_x, mul_y, sum_y} = measures;
		const length = Math.min(array_x.length, array_y.length);

		if (length < 2) {
			throw 'Invalid array length';
		}

		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctx.lineWidth = this.lineWidth;
		ctx.strokeStyle = pair.color || this.color;
		ctx.beginPath();
		for (let i=0; i<length; ++i) {
			const x = array_x[i]*mul_x + sum_x;
			const y = array_y[i]*mul_y + sum_y;
			if (i === 0) {
				ctx.moveTo(x, y);
			} else {
				ctx.lineTo(x, y);
			}
		}
		ctx.stroke();
	}

	plot() {
		if (!this.measures) {
			this.measure();
		}
		this.clearCanvas();
		const {ctx, measures} = this;
		const {content_x0, content_x1, content_y0, content_y1} = measures;
		ctx.save();
		ctx.beginPath();
		ctx.rect(content_x0, content_y1, content_x1 - content_x0, content_y0 - content_y1);
		ctx.clip();
		this.pairs.forEach(pair => this.plotPair(pair));
		ctx.restore();
		this.drawAxes();
		this.drawRuler();
		return this;
	}

}