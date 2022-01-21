const parseAngle = (arg) => {
	const src = ('' + arg).trim();
	let str = src;
	let signal = 1;
	const nsew = /(^[NSEWnsew])|([NSEWnew]$)/g;
	const sw = /(^[SWsw])|([SWw]$)/g;
	if (nsew.test(str)) {
		if (sw.test(str)) {
			signal = -1;
		}
		str = str.replace(nsew).trim();
	}
	if (str.startsWith('-')) {
		str = str.substring(1);
		signal = -1;
	}
	const split = str.split(/['"°]|\s*[a-z]+\s*|\s+/).map(x => x || '0');
	const parsed = split.map((x, i) => x*Math.pow(60, -i));
	const rawValue = parsed.reduce((a, b) => a + b);
	if (/^\d+\s*h/i.test(src)) {
		let angle = rawValue/24*360;
		const res = (angle*signal%360 + 180)%360 - 180;
		if (res === -180) return 180;
		return res;
	}
	return rawValue*signal;
};
