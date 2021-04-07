const parseField = (field) => field
	.toLowerCase()
	.trim()
	.replace(/\s+/g, '_');

const createObjectList = (fields, table) => {
	return table.map((line) => {
		const item = {};
		line.forEach((value, index) => {
			const field = parseField(fields[index]);
			item[field] = value;
		});
		return item;
	});
};

export default class Dataset {
	constructor({ name, fields, table }) {
		this.name = name;
		this.fields = fields;
		this.list = createObjectList(fields, table);
	}
	generateTable() {
		const { fields, list } = this;
		return list.map((item) => {
			const line = [];
			for (let field of fields) {
				line.push(item[parseField(field)]);
			}
			return line;
		});
	}
}
