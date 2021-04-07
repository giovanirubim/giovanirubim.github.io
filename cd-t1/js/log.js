import Dataset from './dataset.js';
import Chart from './chart.js';

let enabled = true;
const stringifyDataset = (dataset) => {
	let table = dataset.generateTable();
	const { name, fields } = dataset;
	table = table.map((line) => {
		return line.map((cell) => {
			return JSON.stringify(cell);
		});
	});
	table = [fields].concat(table);
	const colSize = new Array(table[0].length).fill(0);
	table.forEach((line) => {
		line.forEach((cell = '', col) => {
			colSize[col] = Math.max(colSize[col], cell.length);
		});
	});
	const join = `+${colSize.map(n => '-'.repeat(n+2)).join('+')}+`;
	table = table.map((line) => {
		line = line.map((cell = '', index) => {
			return cell.padEnd(colSize[index], ' ');
		}).join(' | ');
		return `| ${line} |`;
	});
	const title = 'Dataset: ' + name.toUpperCase();
	return (
		join.replace(/-\+-/g, '---') + '\n' +
		'| ' + title.padEnd(join.length - 3, ' ') + '|\n' +
		join + '\n' + table.slice(0, 1) + '\n' +
		join + '\n' +
		table.slice(1).join('\n') + '\n' + join
	);
};
const log = (...args) => {
	if (!enabled) {
		return;
	}
	if (args[0] instanceof Dataset) {
		log(stringifyDataset(args[0]));
		return;
	}
	if (args[0] instanceof HTMLElement || args[0] instanceof jQuery) {
		const div = $(document.createElement('div')).addClass('log');
		div.append(args[0]);
		$('body').append(div.wrap('<div></div>').parent());
		return;
	}
	let output = [];
	for (let arg of args) {
		const type = typeof arg;
		if (type === 'string' || type === 'number' || arg == null) {
			output.push('' + arg);
		} else if (arg instanceof Object) {
			output.push(JSON.stringify(arg, null, '  '));
		} else {
			throw new Error('Invalid argument');
		}
	}
	const div = $(document.createElement('div')).addClass('log');
	div.html('<div></div>')
	div.children()[0].innerHTML = output.join(' ')
		.replace(/\n/g, '<br>')
		.replace(/\x20/g, '&nbsp;');
	$('body').append(div.wrap('<div></div>').parent());
};
log.enable = () => {
	enabled = true;
};
log.disable = () => {
	enabled = false;
};
log.chart = () => {
	const chart = new Chart();
	log(chart.canvas);
	return chart;
};
export default log;
