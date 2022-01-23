const ALIGN_TIME = new Date(`2022-07-01 05:23:00 +0`);
const SID_DAY = 86164.09053820801;
const MS_TO_DEGREE = 360/1000/SID_DAY;
const HOUR_TO_DEGREE = 360/24;

const nameToId = (string) => string
	.toLowerCase()
	.replace(/[^a-zA-Z]/g, '');

const stars = `

	Acamar:
	Achernar: 1h38m32.15s/-57°07'08.9"
	Acrux: 12h27m50.41s/-63°06'13.3"
	Adhara:
	Al Na'ir:
	Aldebaran: 4h37m11.35s/+16°33'09.3"
	Alioth:
	Alkaid:
	Alnilam:
	Alphard:
	Alphecca:
	Alpheratz:
	Altair: 19h51h53.39/+8°55'38.5"
	Ankaa:
	Antares: 16h30m47.76s/-26°28'54.6"
	Arcturus: 14h16m41.50s/+19°04'01.8"
	Atria:
	Avior:
	Bellatrix: 5h26m18.25s/+6°22'11.0"
	Betelgeuse: 5h56m22.35s/+7°24'35.6"
	Canopus:
	Capella: 5h18m19.80s/+46°01'13.7"
	Deneb:
	Denebola:
	Diphda:
	Dubhe:
	Elnath:
	Eltanin:
	Enif:
	Fomalhaut:
	Gacrux:
	Gienah:
	Hadar:
	Hamal:
	Kaus Aust.:
	Kochab:
	Markab:
	Menkar:
	Menkent:
	Miaplacidus:
	Mirfak:
	Nunki:
	Peacock:
	Polaris: 2h58m45.93s/+89°21'13.5"
	Pollux: 7h46m40.33s/+27°58'16.3"
	Procyon: 7h40m27.80s/+5°10'03.1"
	Rasalhague:
	Regulus: 10h09m32.52s/+11°51'35.7"
	Rigel: 5h15m35.24s/-8°10'31.6"
	Rigil Kent.:
	Sabik:
	Scheat:
	Schedar:
	Shaula:
	Sirius: 6h46m06.19s/-16°44'48.8"
	Spica:
	Suhail:
	Vega: 18h37m43.03s/+38°48'16.8"
	Zuben'ubi:

`.trim().split(/\s*\n\s*/).map(star => {
	const [ name, radec ] = star.split(/\s*:\s*/);
	const id = nameToId(name);
	return { name, id, radec };
});

export const calcAriesGHA = (time) => {
	const angle = (ALIGN_TIME - time)*MS_TO_DEGREE;
	return (angle%360 + 360)%360;
};

export const findRaDec = (name) => {
	const id = nameToId(name);
	return stars.find(star => star.id === id)?.radec ?? null;
};
