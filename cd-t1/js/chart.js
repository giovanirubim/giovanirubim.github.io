const area = {};

const calcArea = () => {
	const width = 800;
	const height = 600;
	const mTop = 50;
	const mLeft = 100;
	const mRight = 80;
	const mBottom = 30;
	const left = mLeft;
	const top = mTop;
	area.canvasWidth = width + mLeft + mRight;
	area.canvasHeight = height + mTop + mBottom;
	area.width = width;
	area.height = height;
	area.left = left;
	area.top = top;
	area.right = left + width;
	area.bottom = top + height;
	area.center = left + width*0.5;
	area.middle = top + height*0.5;
	area.a = [left, top];
	area.b = [left, area.bottom];
	area.c = [area.right, area.bottom];
	area.d = [area.right, top];
	area.size = [width, height];
};

calcArea();

const lineFunction = (x0, y0, x1, y1) => {
	const scale = (y1 - y0)/(x1 - x0);
	const base = y0 - x0*scale;
	return (x) => x*scale + base;
};

export default class Chart {
	constructor() {
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		canvas.width = area.canvasWidth;
		canvas.height = area.canvasHeight;
		this.canvas = canvas;
		this.ctx = ctx;
		ctx.fillStyle = '#fff';
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 1;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.beginPath();
		ctx.moveTo(...area.a);
		ctx.lineTo(...area.b);
		ctx.lineTo(...area.c);
		ctx.lineTo(...area.d);
		ctx.stroke();
	}
	plot({ title, array, a, b }) {
		const {ctx} = this;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'bottom';
		ctx.font = '36px arial';
		ctx.fillStyle = '#000';
		ctx.fillText(title, area.center, area.top);
		ctx.lineJoin = 'round';
		ctx.lineCap = 'round';
		const colors = ['#000', '#f70'];
		ctx.textBaseline = 'middle';
		let textSpace = 20;
		[a, b].forEach((line, index) => {
			ctx.lineWidth = 3;
			ctx.strokeStyle = colors[index];
			const {base, top, step, get, sufix} = line;
			const fy = lineFunction(base, area.bottom, top, area.top);
			const fx = lineFunction(0, area.left, array.length - 1, area.right);
			ctx.beginPath();
			array.forEach((item, index) => {
				const x = fx(index);
				const y = fy(get(item));
				if (index) {
					ctx.lineTo(x, y);
				} else {
					ctx.moveTo(x, y);
				}
			})
			ctx.stroke();
			ctx.fillStyle = '#000';
			ctx.strokeStyle = '#000';
			ctx.textAlign = index? 'left': 'right';
			const x = index? area.right: area.left;
			const lineEnd = index? x + 10: x - 10;
			const wordEnd = index? lineEnd + 10: lineEnd - 10;
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.font = '14px arial';
			for (let val=base; val<=top; val+=step) {
				const y = fy(val);
				const text = val.toPrecision(3)*1 + sufix;
				ctx.fillText(text, wordEnd, y);
				ctx.moveTo(lineEnd, y);
				ctx.lineTo(x, y);
			}
			ctx.stroke();
		});
		return this;
	}
}
