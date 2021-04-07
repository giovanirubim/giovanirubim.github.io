import Dataset from './dataset.js';

export const load = async (name) => {

	let text = await $.get(`csv/${name}.csv`);
	let table = text
		.replace(/(^|\n)\s+(\n|$)/, '')
		.split(/\s*\n\s*/)
		.map((record) => record.split(/\s*,\s*|\x20*\t\x20*/));

	// Remove registros só com uma coluna
	table = table.filter((record) => record.length > 1);

	// Separa os nomes dos campos das demais linhas
	const fields = table.splice(0, 1)[0];

	return new Dataset({
		name,
		fields,
		table
	});

};
