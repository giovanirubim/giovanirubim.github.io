import * as csv from './csv.js';
import log from './log.js';

const steps = [];
const datasets = [];
const cityNames = [
	'curitiba',
	'irati',
	'ivai',
	'londrina',
	'maringa',
	'paranagua',
];

const validTemperature = (value) => {
	return value != null && value != '' && value <= 55;
};
const filters = {
	umidade_relativa_do_ar: (item) => {
		const value = item.umidade_relativa_do_ar;
		return value != null && value != '' && value <= 100;
	},
	precipitacao_total: (item) => {
		const value = item.precipitacao_total;
		return value != null && value != '';
	},
	temperatura_media_compensada: (item) => {
		return validTemperature(item.temperatura_media_compensada);
	},
	temperatura_maxima_media: (item) => {
		return validTemperature(item.temperatura_maxima_media);
	},
	temperatura_minima_media: (item) => {
		return validTemperature(item.temperatura_minima_media);
	},
};
const averageAttribute = (list, attribute) => {
	const {length} = list;
	const filter = filters[attribute];
	const result = list.map((item) => item[attribute]);
	let count = 0;
	for (let i=1; i<length-1; ++i) {
		let item = list[i];
		let prev = list[i-1];
		let next = list[i+1];
		if (filter(item)) {
			continue;
		}
		if (filter(prev) && filter(next)) {
			prev = prev[attribute];
			next = next[attribute];
			result[i] = (prev + next)/2;
			++ count;
		}
	}
	list.forEach((item, i) => {
		item[attribute] = result[i];
	});
	return count;
};
const dropDataset = (name) => {
	const temp = datasets.filter((dataset) => dataset.name != name);
	datasets.length = 0;
	datasets.push(...temp);
};
const getDataset = (name) => {
	return datasets.find((dataset) => dataset.name === name);
};
const getDatasets = (...names) => {
	return names.map(getDataset);
};

function replaceValues(dataset, attributes) {
	const result = {};
	for (let attribute in attributes) {
		const {test, replaceBy} = attributes[attribute];
		let count = 0;
		for (let item of dataset.list) {
			const value = item[attribute];
			if (test(value)) {
				item[attribute] = replaceBy;
				++ count;
			}
		}
		result[attribute] = count;
	}
	return result;
}

function calcCorrelation(array, getPair) {
	let n = array.length;
	let sx = 0;
	let sy = 0;
	let sxy = 0;
	let sx2 = 0;
	let sy2 = 0;
	array.forEach((item) => {
		const {x, y} = getPair(item);
		sx += x;
		sy += y;
		sxy += x*y;
		sx2 += x*x;
		sy2 += y*y;
	});
	return (n*sxy - sx*sy)/Math.sqrt((n*sx2 - sx*sx)*(n*sy2 - sy*sy));
}

const formatDate = (date) => {
	return date.replace(/^(\d+)-(\d+)-(\d+)$/, '$2/$1');
}

const plotAttr = {
	temperatura_media_compensada: {
		base: 0,
		top: 60,
		step: 5,
		sufix: ' °C'
	},
	temperatura_minima_media: {
		base: 0,
		top: 60,
		step: 5,
		sufix: ' °C'
	},
	temperatura_maxima_media: {
		base: 0,
		top: 60,
		step: 5,
		sufix: ' °C'
	},
	umidade_relativa_do_ar: {
		base: 0,
		top: 100,
		step: 10,
		sufix: '%'
	},
	precipitacao_total: {
		base: 0,
		top: 900,
		step: 100,
		sufix: 'mm'
	},
};

function comparePlot(dataset, attribute) {
	const filter = filters[attribute];
	const array = dataset.list.filter(filter);
	let maxCases = array.map(item => item.casos_dengue).reduce((a, b) => Math.max(a, b));
	let minCases = array.map(item => item.casos_dengue).reduce((a, b) => Math.max(a, b));
	let base = 0;
	let top = 100;
	let step = 10;
	if (maxCases > 100) {
		step = Math.ceil(maxCases/15);
		top = base + step*15;
	}
	const chart = log.chart()
		.plot({
			array,
			title: `${dataset.name} (${attribute.replace(/_/g, ' ')})`,
			a: {
				get: (item) => item.casos_dengue,
				base, top, step,
				sufix: ' casos'
			},
			b: {
				get: (item) => item[attribute],
				...plotAttr[attribute],
			}
		})
}

steps.push(async function() {
	log('Loading datasets');
	for (name of cityNames) {
		const dataset = await csv.load(name);
		datasets.push(dataset);
		log(dataset);
	}
}, async function() {
	log('Parsing values');
	for (let dataset of datasets) {
		dataset.list.forEach((item) => {
			for (let field in item) {
				const value = item[field];
				if (value === 'null') {
					item[field] = null;
				} else if (/^\d+$/.test(value)) {
					item[field] = parseInt(value);
				}
			}
		});
		log(dataset);
	}
}, async function() {
	log('Imputando casos de dengue');
	for (let dataset of datasets) {
		const res = replaceValues(dataset, {
			casos_dengue: {
				test: (value) => value == '',
				replaceBy: 0,
			}
		});
		log(dataset.name + ': ' + res.casos_dengue);
		// log(dataset);
	}
}, async function() {
	log('Imputando usando média');
	for (let dataset of datasets) {
		let res = {};
		for (let attribute in filters) {
			const filter = filters[attribute];
			res[attribute] = averageAttribute(dataset.list, attribute);
		}
		log(dataset.name, res);
	}
}, async function() {
	const invalidTemperature = (x) => {
		return (x == null || x == '' || x > 60 || x < -20)|0
	};
	const attrs = [
		'temperatura_maxima_media',
		'temperatura_media_compensada',
		'temperatura_minima_media',
	];
	datasets.forEach(dataset => {
		const result = {};
		attrs.forEach(attr => {
			const values = dataset.list.map((item) => item[attr]);
			result[attr] = values.map(invalidTemperature).reduce((a, b) => a + b);
		})
		log('Invalid temperature values of ' + dataset.name, result);
	});
}, async function() {
	log('Removendo Ivaí')
	dropDataset('ivai');
	datasets.forEach(log);
}, async function() {
	log('Índices de correlação (%)');
	const fields = [
		{
			name: 'precipitacao_total',
			filter: filters.precipitacao_total,
		},
		{
			name: 'temperatura_media_compensada',
			filter: filters.temperatura_media_compensada,
		},
		{
			name: 'umidade_relativa_do_ar',
			filter: filters.umidade_relativa_do_ar,
		},
	];
	for (let dataset of datasets) {
		const res = {};
		for (let {name, filter} of fields) {
			const val = calcCorrelation(dataset.list.filter(filter), (item) => {
				const x = item[name];
				const y = item.casos_dengue;
				return {x, y};
			});
			res[name] = Math.round(val*100);
		}
		log(dataset.name, res);
	}
}, async function() {
	for (let dataset of datasets) {
		comparePlot(dataset, 'precipitacao_total');
	}
}, async function() {
	for (let dataset of datasets) {
		comparePlot(dataset, 'temperatura_media_compensada');
	}
}, async function() {
	for (let dataset of datasets) {
		comparePlot(dataset, 'umidade_relativa_do_ar');
	}
}, async function() {
	const target = 40;
	log(`Índices de correlação de temperatura média com alvo (${target}°C)`);
	for (let dataset of datasets) {
		const val = calcCorrelation(dataset.list, (item) => {
			const x = - Math.abs(item.temperatura_media_compensada - target);
			const y = item.casos_dengue;
			return {x, y};
		});
		log(dataset.name + ': ' + Math.round(val*100));
	}
	log('Total casos');
	let res = {};
	datasets.forEach((dataset) => {
		let sum = 0;
		dataset.list.forEach(item => sum += item.casos_dengue);
		res[dataset.name] = sum;
	})
	log(res);
});

$(document).ready(async () => {
	log.disable();
	// let logIndex = 9;
	for (let i=0; i<steps.length; ++i) {
		const step = steps[i];
		// if (i == logIndex) {
		// 	log.enable()
		// } else {
		// 	log.disable()
		// }
		await step()
	}
});
