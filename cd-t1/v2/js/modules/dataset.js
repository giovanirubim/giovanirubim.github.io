const compare = (a, b) => a === b? 0: a > b? 1: -1;

const normalizeAttr = (attr) => attr
    .normalize('NFD')
    .replace(/[^\s\w]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\x20/g, '_')
    .toLowerCase();

class Dataset {
	constructor(array = []) {
		this.array = [...array];
	}
	get length() {
		return this.array.length;
	}
	get attributes() {
		return Object.keys(this.array[0])
	}
	averageSingles(attr, isValid) {
		const {length, array} = this;
		for (let i=1; i<length-1; ++i) {
			let item = array[i];
			if (isValid(item[attr])) {
				continue;
			}
			let prev = array[i-1][attr];
			let next = array[i+1][attr];
			if (isValid(prev) && isValid(next)) {
				item[attr] = (prev + next)/2;
			}
		}
		return this;
	}
	removeCol(col) {
		this.each((item) => delete item[col]);
		return this;
	}
	filter(fn) {
		this.array = this.array.filter(fn);
		return this;
	}
	map(fn) {
		this.array = this.array.map(fn);
		return this;
	}
	each(fn) {
		this.array.forEach(fn);
		return this;
	}
	clone() {
		return new Dataset(this.array);
	}
	sortBy(field, mode = 'ASC') {
		const desc = !!mode.match(/^desc$/i);
		const sign = 2*desc - 1;
		this.array.sort((a, b) => compare(b[field], a[field])*sign);
		return this;
	}
	getCol(attr) {
		return this.array.map((item) => item[attr]);
	}
	removeIncomplete(attrs = this.attributes) {
		this.filter((item) => {
			for (let attr of attrs) {
				if (item[attr] == null || item[attr] === '') {
					return false;
				}
			}
			return true;
		});
		return this;
	}
	removeEmptyCols() {
		const {array} = this;
		const remove = new Set(this.attributes);
		for (let item of array) {
			for (let attr of remove) {
				const value = item[attr];
				if (value != '' && value != null) {
					remove.delete(attr);
				}
			}
		}
		this.each((item) => {
			for (let attr of remove) {
				delete item[attr];
			}
		});
		return this;
	}
	shiftCol(attr, rows) {
		const {length, array} = this;
		this.map((item, i) => {
			return {
				...item,
				[attr]: array[i - rows]?.[attr] ?? null
			};
		})
		return this;
	}
	toString() {
		let {attributes: attrs, array} = this;
		let colWidth = attrs.map((attr) => attr.length);
		let rows = array.map((item) => {
			const row = attrs.map((attr, i) => {
				const str = JSON.stringify(item[attr] ?? null);
				colWidth[i] = Math.max(colWidth[i], str.length);
				return str;
			});
			return row;
		});
		rows.forEach((row) => {
			row.forEach((col, i) => {
				row[i] = col.padStart(colWidth[i], '\x20');
			});
		});
		attrs.forEach((attr, i) => {
			attrs[i] = attr.padEnd(colWidth[i], '\x20');
		});
		let ln = `+${
			colWidth.map((len) => '-'.repeat(len + 2)).join('+')
		}+`;
		let lines = [attrs]
			.concat(rows)
			.map((row) => `| ${row.join(' | ')} |`);
		return `${ln}\n${lines.join(`\n${ln}\n`)}\n${ln}`;
	}
	static parseTable(table) {
		const attrs = table[0].map(normalizeAttr);
		const {length} = table;
		const array = [];
		for (let i=1; i<length; ++i) {
			const row = table[i];
			const obj = {};
			for (let j=0; j<attrs.length; ++j) {
				const attr = attrs[j];
				obj[attr] = row[j] ?? null;
			}
			array.push(obj);
		}
		return new Dataset(array);
	}
}

export default Dataset;
