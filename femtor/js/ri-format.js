// ========================<-------------------------------------------->======================== //
// Módulo responsável pela importação de projetos no formato RI

// ========================<-------------------------------------------->======================== //
// Módulos acessados

import * as shell from './shell.js';

// Carrega um projeto de uma string 'src' no formato RI
export const load = (src, {mergeAxisInstances = true} = {}) => {

	shell.clear();

	const axisMap = {};

	// Insere/Busca no projeto um eixo compatível com determinada linha da tabela
	const rowToAxis = row => {
		const key = row.slice(0, 5).join('/');
		let axis = axisMap[key];
		if (axis) {
			return axis;
		}
		axis = shell.addAxis({
			outer_diameter: row[0],
			inner_diameter: row[1],
			density: row[2],
			mod_e: row[3],
			mod_g: row[4],
		});
		axisMap[key] = axis;
		return axis;
	};
	const getRowCoord = line => line[5];

	// Monta a tabela a partir da string src
	const table = [];
	src.split('\n').forEach((line, index) => {
		line = line.trim();
		if (!line) return;
		const row = line.split('\t');
		if (row.length !== 32) {
			throw 'Invalid RI format. At line ' + (index + 1);
		}
		row.forEach((str, i) => row[i] = parseFloat(str));
		table.push(row);
	});

	// Insere os eixos e instâncias de eixo
	let lastCoord = 0;
	let lastInstance = null;
	table.forEach(row => {
		const axis = rowToAxis(row);
		const coord = getRowCoord(row);
		if (coord === lastCoord) {
			return;
		}
		const length = coord - lastCoord;
		if (mergeAxisInstances && lastInstance && lastInstance.axis_id === axis.id) {
			shell.updateAxisInstance({id: lastInstance.id, length: lastInstance.length + length});
		} else {
			lastInstance = shell.addAxisInstance({ axis_id: axis.id, length });
		}
		lastCoord = coord;
	});

};

// End of File
// ========================<-------------------------------------------->======================== //