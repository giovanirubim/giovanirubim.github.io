const nextColor = (rand) => {
	const channel = rand()%3;
	const rest = rand()%256;
	const a = rand()%(rest + 1);
	const b = rest - a;
	const rgb = [0, 0, 0];
	rgb[channel] = 255;
	rgb[(channel + 1)%3] = a;
	rgb[(channel + 2)%3] = b;
	return `rgb(${ rgb.join(', ') })`;
};
export const drawSticker = (ctx, cx, cy, radius, rand) => {
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	const lineWidth = radius/30;
	ctx.lineWidth = lineWidth;
	[
		[10, radius*.0833, radius*.3333],
		[15, radius*.3333, radius*.6667],
		[20, radius*.5000, radius - lineWidth*0.5],
	].forEach(([n, r0, r1]) => {
		ctx.strokeStyle = nextColor(rand);
		const deltaRad = r1 - r0;
		const deltaAng = Math.PI*2/n;
		const nSteps = Math.ceil(360/n);
		const stepAng = deltaAng/nSteps;
		ctx.beginPath();
		const values = [];
		for (let i=0; i<n; ++i) {
			values.push(rand());
		}
		for (let i=0; i<n; ++i) {
			const a = r0 + values[i]/0x100000000*deltaRad;
			const b = r0 + values[(i+1)%n]/0x100000000*deltaRad;
			const ang0 = deltaAng*i - Math.PI/2;
			for (let j=0; j<nSteps; ++j) {
				let t = j/nSteps;
				t = (1 - Math.cos(Math.PI*t))/2;
				const rad = b*t + a*(1 - t);
				const ang = ang0 + stepAng*j;
				const x = cx + Math.cos(ang)*rad;
				const y = cy + Math.sin(ang)*rad;
				if (i === 0 && j === 0) ctx.moveTo(x, y);
				else if (j !== 0) ctx.lineTo(x, y);
			}
		}
		ctx.closePath();
		ctx.stroke();
	});
};