const { PI, sqrt } = Math;
const TAU = PI*2;
const R = 6371e3;
const C = R*TAU;
const sqr = (x) => x*x;

/*

HdToH1

	Hd^2 + R^2 = (R + H)^2
	Hd^2 + R^2 = R^2 + 2*R*H + H^2
	Hd^2 + R^2 - R^2 - 2*R*H - H^2 = 0
	Hd^2 - 2*R*H - H^2 = 0
	Hd^2 - 2*R*x - x^2 = 0
	- Hd^2 + 2*R*x + x^2 = 0
	2*R*x + x^2 - Hd^2 = 0
	x^2 + 2*R*x - Hd^2 = 0
	(1)*x^2 + (2*R)*x + (- Hd^2) = 0
	a = 1
	b = 2*R
	c = -Hd^2
	Delta = b^2 - 4*a*c
	Delta = b^2 - 4*c
	Delta = (2*R)^2 - 4*c
	Delta = 4*R^2 - 4*c
	Delta = 4*(R^2 - c)
	Delta = 4*(R^2 - (-Hd^2))
	Delta = 4*(R^2 + Hd^2)
	H1 = (-b + Delta^0.5)/(2*a)
	H1 = (Delta^0.5 - b)/(2*a)
	H1 = (Delta^0.5 - b)/2
	H1 = ((4*(R^2 + Hd^2))^0.5 - 2*R)/2
	H1 = ((4*(R^2 + Hd^2))^0.5)/2 - 2*R/2
	H1 = ((4*(R^2 + Hd^2))^0.5)/2 - R

SdToH1
	
	angle (radians) = Sd/R
	Hd = tan(angle)*R
	Hd = tan(Sd/R)*R
	H1 = HdToH1(Hd)
	H1 = ((4*(R^2 + Hd^2))^0.5)/2 - R
	H1 = ((4*(R^2 + (tan(Sd/R)*R)^2))^0.5)/2 - R

SdToH2
	
	angle (radians) = Sd/R
	H2 = R*(1 - cos(angle))
	H2 = R*(1 - cos(Sd/R))

HdToH2

	sin(angle)*R = Hd
	sin(angle) = Hd/R
	angle = asin(Hd/R)
	H2 = R*(1 - cos(angle))
	H2 = R*(1 - cos(asin(Hd/R)))

*/

const inToM = 0.0254;
const mToIn = 1/inToM;
const miToM = 1609.344;
const mToMi = 1/miToM;
const mToFt = 3.28084;
const ftToM = 1/mToFt;

const HdToH1 = (Hd) => (sqrt(4*(R*R + Hd*Hd)))/2 - R;
const SdToH1 = (Sd) => HdToH1(Math.tan(Sd/R)*R);
const HdToH2 = (Hd) => R*(1 - Math.cos(Math.asin(Hd/R)));
const SdToH2 = (Sd) => R*(1 - Math.cos(Sd/R));
const funFE = (x) => sqr(x*mToMi)*8*inToM;
const sagitta = (sd) => (1 - Math.cos(sd/R/2))*R;

const units = [

	[1e3, 'km'],
	[1, 'm'],
	[1e-2, 'cm'],
	[1e-3, 'mm'],

	// [1609.34, 'mi'],
	// [0.9144, 'yd'],
	// [0.3048, 'ft'],
	// [0.0254, 'in'],

];
const toStr = (x) => {
	let selected;
	for (let pair of units) {
		selected = pair;
		if (x >= pair[0]) break;
	}
	const [ scale, name ] = selected;
	return ((x/scale).toPrecision(6)*1) + name;
};
// testValues.forEach(x => {
// 	console.log(`${toStr(x)}:`);
// 	for (let name in formulas) {
// 		const fn = formulas[name];
// 		console.log(` - ${name}: ${toStr(fn(x))}`);
// 	}
// });
// for (let name in formulas) {
// 	const fn = formulas[name];
// 	console.log(`${name}:`);
// 	testValues.forEach(x => {
// 		console.log(` - ${toStr(x)}: ${toStr(fn(x))}`);
// 	});
// }
