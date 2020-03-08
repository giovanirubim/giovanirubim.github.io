const database = {
	axis: [],
	disk: [],
	mg: [],
	me: [],
	node: [],
	axis_instance: [],
	disk_instance: [],
	mg_instance: [],
	me_instance: [],
	last_id: 0
};

let idMap = {};
let typeMap = {};

export const add = (obj, type) => {
	const array = database[type];
	const id = obj.id || (obj.id = ++database.last_id);
	obj.id = id;
	idMap[id] = obj;
	typeMap[id] = type;
	array.push(obj);
	return obj;
};

export const find = (id, includeIndex) => {
	const type = typeMap[id] || null;
	const array = database[type] || [];
	const result = idMap[id] || null;
	let index = null;
	if (includeIndex) index = array.indexOf(result);
	return {type, array, result};
};

export const remove = arg => {
	if (!arg) return false;
	let id, obj;
	if (typeof arg === 'number') {
		id = arg;
	}
	obj = idMap[id];
	if (!obj) return false;
	const type = typeMap[id];
	const array = database[type];
	const index = array.indexOf(obj);
	array.splice(index, 1);
	delete idMap[id];
	delete typeMap[id];
};