class ArcTimer {

	constructor(endTime) {
		this.endTime = endTime;
	}

	draw(ctx, now, cx, cy, maxRadius) {

		let end = this.endTime;
		if (end < now) {
			let aux = new Date(end);
			end = new Date(now);
			now = aux;
		}
		const lineWidth = maxRadius*0.1;
		const r1 = maxRadius - lineWidth*6.5;
		const r2 = maxRadius - lineWidth*5.0;
		const r3 = maxRadius - lineWidth*3.5;
		const r4 = maxRadius - lineWidth*2.0;
		const r5 = maxRadius - lineWidth*0.5;
		const iniDeg = Math.PI*1.5;
		const tau = Math.PI*2.0;
		
		const ms = (end - now) % 60000;
		now.setMilliseconds(now.getMilliseconds() + ms);
		const p1 = ms/60000;

		let aux1 = (p1*60)%1;
		let aux2 = p1 - aux1/60;
		aux1 = (1 - Math.cos(aux1*Math.PI))*0.5;
		aux1 = (1 - Math.cos(aux1*Math.PI))*0.5;
		aux1 = Math.pow(aux1, 2);
		const stairP1 = aux2 + aux1/60;

		const min = (end.getMinutes() - now.getMinutes() + 60)%60;
		now.setMinutes(now.getMinutes() + min);
		const p2 = (min + p1)/60;
		
		const hrs = (end.getHours() - now.getHours() + 24)%24;
		now.setHours(now.getHours() + hrs);
		const p3 = (hrs + p2)/24;

		let monthLength;
		if (now.getDate() > end.getDate()) {
			const tmp = new Date(now);
			tmp.setMonth(tmp.getMonth() + 1);
			monthLength = Math.round((tmp - now)/(1000*60*60*24));
		} else {
			const tmp = new Date(now);
			tmp.setMonth(tmp.getMonth() - 1);
			monthLength = Math.round((now - tmp)/(1000*60*60*24));
		}

		const dys = (end.getDate() - now.getDate() + monthLength)%monthLength;
		now.setDate(now.getDate() + dys);
		const p4 = (dys + p3)/monthLength;

		const mnt = (end.getMonth() - now.getMonth() + 12)%12;
		const p5 = (mnt + p4)/12;

		ctx.strokeStyle = "#fff";
		ctx.lineWidth = lineWidth;

		ctx.beginPath();
		ctx.arc(cx, cy, r1, iniDeg, iniDeg + tau*stairP1);
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(cx, cy, r2, iniDeg, iniDeg + tau*p2);
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(cx, cy, r3, iniDeg, iniDeg + tau*p3);
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(cx, cy, r4, iniDeg, iniDeg + tau*p4);
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(cx, cy, r5, iniDeg, iniDeg + tau*p5);
		ctx.stroke();

	}

}