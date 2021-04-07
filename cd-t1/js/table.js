// import Log from './log.js';
// const dom = (tagName) => $(document.createElement(tagName));
// export default class Table {
// 	constructor({ name, fields, table: lines }) {
// 		const table = dom('table');
// 		this.table = table;
// 		table.append(
// 			dom('tr').append(
// 				dom('th').text(name).attr({
// 					colspan: lines[0].length
// 				})
// 			)
// 		);
// 		this.addRow(fields, 'th');
// 		lines.forEach((line) => {
// 			this.addRow(line, 'td');
// 		});
// 		$('body').append(table);
// 	}
// 	addRow(row, tagName) {
// 		const {table} = this;
// 		const tr = dom('tr');
// 		row.forEach((cell) => {
// 			const td = dom(tagName);
// 			td.text(cell);
// 			tr.append(td);
// 		});
// 		table.append(tr);
// 		return this;
// 	}
// }
