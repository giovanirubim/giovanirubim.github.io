import Dataset from './modules/dataset.js';

const loadDataset = async (filename) => {
	let text = await $.get(`datasets/${filename}.csv`);
	let table = text
		.trim()
		.split(/\s*\n\s*/)
		.filter((row) => row)
		.map((row) => {
			const res = row
				.split(/\s*;\s*|\t/)
				.map((col) => {
					if (/^\d+(\.\d+)?$/.test(col)) {
						return Math.round(Number(col));
					}
					if (col == 'null' || col == null || col == '') {
						return null;
					}
					return col.replace(/^(\d+)\/(\d+)\/(\d+)$/, '$3-$2');
				})
			return res;
		});
	return Dataset.parseTable(table);
};

const addTaxaCrescimento = (dataset) => {
	dataset.each((item, i, array) => {
		let prev = array[i-1]?.casos_dengue;
		let next = array[i+1]?.casos_dengue;
		let curr = item.casos_dengue;
		let ant = prev != null? (curr/prev).toPrecision(2)*1: null;
		let seg = next != null? (next/curr).toPrecision(2)*1: null;
		// item.taxa_crescimento_ant = ant;
		item.taxa_crescimento_seg = seg;
		// item.taxa_crescimento_med = ant != null && seg != null? ((ant+seg)/2).toPrecision(2)*1: null;
	});
};

const toInnerHTML = (dataset) => dataset
	.toString()
	.replace(/&/g, '&amp;')
	.replace(/</g, '&lt;')
	.replace(/>/g, '&gt;')
	.replace(/\x20/g, '&nbsp;')
	.replace(/\bnull\b/g, '<span class="null">null</span>')
	.replace(/\n/g, '<br>');

const isValid = (x) => typeof x === 'number' && !isNaN(x);

const run = async(name) => {
	let dataset = await loadDataset(name);
	dataset.averageSingles([
		'precipitacao_total',
		'temperatura_media_compensada',
		'temperatura_maxima_media',
	], isValid);
	addTaxaCrescimento(dataset);
	dataset.removeEmptyCols();
	dataset.removeIncomplete();
	return dataset;
};

let cityId = 'goiania';
let movingAverage = 5;

const datasets = [];
const translate = {
	'goiania': 'Goiânia',
	'curitiba': 'Curitiba',
	'cuiaba': 'Cuiabá',
	'bh': 'Belo Horizotne',
	'rj': 'Rio de Janeiro',
	'data_medicao': 'Data',
	'precipitacao_total': 'Precipitação',
	'temperatura_maxima_media': 'Temp. máx.',
	'temperatura_media_compensada': 'Temp. med.',
	'temperatura_minima_media': 'Temp. min.',
	'umidade_relativa_do_ar': 'Umidade relativa',
	'casos_dengue': 'N. de casos',
	'meses_desde_a_ultima_campanha': 'Meses últ. camp.',
	'taxa_crescimento_seg': 'Taxa cresc. casos',
};
const fields = [
	'data_medicao',
	'precipitacao_total',
	'temperatura_maxima_media',
	'temperatura_media_compensada',
	'temperatura_minima_media',
	'umidade_relativa_do_ar',
	'casos_dengue',
	'meses_desde_a_ultima_campanha',
	'taxa_crescimento_seg',
];

const chartSetup = {
	x: 'taxa_crescimento_seg',
	y: [
		'precipitacao_total',
		'temperatura_media_compensada',
	]
};

const getDataset = () => datasets.find((dataset) => dataset.id === cityId).dataset;

const newCanvas = () => {
	const canvas = $(document.createElement('canvas'));
	$('#plot').html('').append(canvas);
	const ctx = $('canvas')[0].getContext('2d');
	return ctx;
};

const plotBars = () => {
	const ctx = newCanvas();
	// const DATA_COUNT = 7;
	// const NUMBER_CFG = {count: DATA_COUNT, min: 0, max: 7};
	// const labels = Utils.months({count: 7});
	// const data = {
	// 	labels: labels,
	// 	datasets: [
	// 		{
	// 			label: 'Dataset 1',
	// 			data: Utils.numbers(NUMBER_CFG),
	// 			borderColor: Utils.CHART_COLORS.red,
	// 			backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
	// 		},
	// 		{
	// 			label: 'Dataset 2',
	// 			data: Utils.numbers(NUMBER_CFG),
	// 			borderColor: Utils.CHART_COLORS.blue,
	// 			backgroundColor: Utils.transparentize(Utils.CHART_COLORS.blue, 0.5),
	// 		}
	// 	]
	// };
};

const plot = () => {
	const dataset = getDataset();
	const {x, y} = chartSetup;
	dataset.sortBy(x);
	const datasetArgs = [];
	const scales = {};
	const colors = [
		'rgba(41, 116, 191, 0.75)',
		'rgba(255, 127, 0, 0.8)'
	];
	for (let i=0; i<y.length; ++i) {
		const id = 'y' + i;
		const name = y[i];
		let values = dataset.getCol(name);
		if (movingAverage > 1) {
			const remove = {};
			values = values.map((_, i) => {
				if (i + 1 < movingAverage) {
					return null;
				}
				let sum = 0;
				let num = 0;
				for (let n=0; n<movingAverage; ++n) {
					const val = values[i - n];
					if (isValid(val)) {
						sum += val;
						++ num;
					}
				}
				return sum/num;
			}).slice(movingAverage - 1);
		}
		const title = translate[name];
		datasetArgs.push({
			label: title,
			borderColor: colors[i],
			data: values,
			yAxisID: id,
		});
		scales[id] = {
			type: 'linear',
			display: true,
			position: i? 'right': 'left',
		};
	}
	let title = translate[cityId];
	// let title = `${translate[cityId]} - ${translate[x]}`;
	if (movingAverage > 1) {
		title += ` (média móvel de ${movingAverage} meses)`;
	}
	const ctx = newCanvas();
	const chart = new Chart(ctx, {
		type: 'line',
		data: {
			labels: dataset.getCol(x).slice(movingAverage - 1),
			datasets: datasetArgs
		},
		options: {
			responsive: true,
			interaction: {mode: 'index', intersect: false},
			stacked: false,
			plugins: {
				title: {display: true, text: title}
			},
			scales,
			elements: {
				line: {
					borderJoinStyle: 'round',
					tension: 0.3,
				}
			}
		},
	});
};

let get = (name) => $(`[name="${name}"]`).val();
let lastConfig = '';
const getConfig = () => {
	let config = {};
	$('[name]').each(function(){
		let e = $(this);
		config[e.attr('name')] = e.val();
	});
	return config;
};
const updateDisplay = () => {
	let config = getConfig();
	let json = JSON.stringify(config);
	if (json === lastConfig) {
		return;
	}
	lastConfig = json;
	cityId = config.cityId;
	movingAverage = config.movingAverage;
	if (config.display.includes('chart')) {
		$('.plot').show();
		$('.table').hide();
		let y = [];
		for (let i=0; i<2; ++i) {
			let id = 'y' + (i+1);
			if (config[id]) {
				y.push(config[id]);
			}
		}
		chartSetup.x = config.x;
		chartSetup.y = y;
		if (config.display === 'line_chart') {
			plot();
			$('.bar-chart').hide();
			$('.line-chart').show();
		} else {
			$('.line-chart').hide();
			$('.bar-chart').show();
			plotBars();
		}
	} else {
		$('.plot').hide();
		$('.table').show();
		const dataset = getDataset();
		dataset.sortBy(config.orderBy, config.orderMode);
		$('#table').html(toInnerHTML(dataset));
	}
};

$(document).ready(async()=>{
	const ids = [
		'bh',
		'cuiaba',
		'curitiba',
		'goiania',
		'rj',
	];
	$('[name="cityId"]').append(ids.map((id)=>`<option value="${id}">${translate[id]}</option>`))
	$('[name="x"],[name="y1"],[name="y2"],[name="orderBy"]')
		.append(fields.map((field)=>`<option value="${field}">${translate[field]}</option>`))
	for (let id of ids) {
		const dataset = await run(id);
		datasets.push({
			id,
			dataset,
		});
	}
	let config = localStorage.getItem('config');
	if (config) {
		config = JSON.parse(config);
		for (let attr in config) {
			$(`[name="${attr}"]`).val(config[attr]);
		}
	}
	updateDisplay();
	$('[name]').on('change', () => {
		updateDisplay();
		localStorage.setItem('config', lastConfig);
	});
});
