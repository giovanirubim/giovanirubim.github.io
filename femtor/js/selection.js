// ========================<-------------------------------------------->======================== //
// Módulo que gerencia elementos selecionados no modelo

// ========================<-------------------------------------------->======================== //
// Variáveis globais

// Mapa que id's de objetos que estão selecionados
const idMap = {};

// Mapa de tratamento de eventos de seleção
// A chave indica o tipo e o valor o handler
const onAddHandlers = {};

// Mapa de tratamento de eventos de remoção de seleção
// A chave indica o tipo e o valor o handler
const onRemoveHandlers = {};

// Vetor com todos os elementos selecionados
export const all = [];

// Vetores dos elementos selecionados separados por tipo
export const types = {
	axis_instance: [],
	disk_instance: [],
	mg_instance: [],
	me_instance: [],
	node: [],
};

// ========================<-------------------------------------------->======================== //
// Métodos auxiliares

// Remove um objeto de um array
const arrayRemove = (array, obj) => array.splice(array.indexOf(obj), 1);

// ========================<-------------------------------------------->======================== //
// Métodos públicos

export const add = (obj, type) => {
	const {id} = obj;
	if (idMap[id] !== undefined) {
		return false;
	}
	all.push(obj);
	types[type].push(obj);
	idMap[id] = true;
	const handler = onAddHandlers[type];
	if (handler !== undefined) {
		handler(obj);
	}
	return true;
};

export const remove = (obj, type) => {
	const {id} = obj;
	if (idMap[id] === undefined) {
		return false;
	}
	arrayRemove(all, obj);
	arrayRemove(types[type], obj);
	delete idMap[id];
	const handler = onRemoveHandlers[type];
	if (handler !== undefined) {
		handler(obj);
	}
	return true;
};

export const hasId = id => id in idMap;
export const has = arg => hasId(arg instanceof Object? arg.id: arg);
export const hasType = type => types[type].length !== 0;
export const numberOf = type => types[type].length;
export const length = () => all.length;
export const first = () => all[0];
export const toggle = (obj, type) => has(obj)? remove(obj, type): add(obj, type);

export const each = (a, b) => {
	let array, iteration;
	if (b === undefined) {
		array = all;
		iteration = a;
	} else {
		array = types[a];
		iteration = b;
	}
	array.slice().forEach(obj => hasId(obj.id) && iteration(obj));
};

export const onselect = (type, handler) => {
	onAddHandlers[type] = handler;
};

export const onunselect = (type, handler) => {
	onRemoveHandlers[type] = handler;
};

// End of File
// ========================<-------------------------------------------->======================== //