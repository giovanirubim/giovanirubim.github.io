// ========================<-------------------------------------------->======================== //
// Este módulo armazena os objetos contidos no projeto.
// Este módulo não deve acessar outros módulos, apenas ser utilizado como uma base de dados onde
// podem ser realizadas consultas e inserções

// ========================<-------------------------------------------->======================== //
// Constantes

const DEFAULT_NAME = 'Novo Projeto';

// ========================<-------------------------------------------->======================== //
// Estrutura da base de dados do modelo

export const database = {
	name: DEFAULT_NAME,
	axis: [],
	disk: [],
	mg: [],
	me: [],
	axis_instance: [],
	node: [],
	disk_instance: [],
	mg_instance: [],
	me_instance: [],
	last_id: 0
};

// ========================<-------------------------------------------->======================== //

// Mapa de id => objeto
let idMap = {};

// Mapa de id => tipo do objeto
let typeMap = {};

// Adiciona um objeto à base de dados
const insert = (obj, type) => {
	const array = database[type];
	let {id} = obj;
	if (idMap[id]) {
		throw 'Database id colision';
	}
	if (id == null) {
		id = obj.id = ++database.last_id;
	} else if (id > database.last_id) {
		database.last_id = id;
	}
	obj.id = id;
	idMap[id] = obj;
	typeMap[id] = type;
	array.push(obj);
	return obj;
};

// ========================<-------------------------------------------->======================== //
// Classes dos elementos do projeto

// Classe de eixo
// Contém as propriedades físicas de um eixo
class Axis {
	constructor() {
		this.id = null;
		this.name = 'Eixo sem nome';
		this.description = '';
		this.outer_diameter = 0;
		this.inner_diameter = 0;
		this.density = 0;
		this.mod_e = 0;
		this.mod_g = 0;
	}
}

// Classe de instância de eixo
// Representa o aparecimento de um eixo (descrito na classe Axis) no modelo com determinado
// comprimento
class AxisInstance {
	constructor() {
		this.id = null;
		this.axis_id = null;
		this.length = 0;
	}
}

// ========================<-------------------------------------------->======================== //
// Métodos públicos para a manipulação do projeto

// Mapeia o tipo do objeto com a classe correspondente
const typeToClass = {
	'axis': Axis,
	'axis_instance': AxisInstance,
};

// Ordem de dependência dos tipos, do menos dependente ao mais dependente
export const dependencyOrder = [
	'axis',
	'axis_instance'
];

// Busca um objeto na base de dados
// Se includeIndex for verdadeiro inclui no objeto resultante da busca o índice do objeto no vetor
// correspondente
export const find = (id, includeIndex) => {
	const type = typeMap[id] || null;
	const array = database[type] || [];
	const obj = idMap[id] || null;
	let index = null;
	if (includeIndex) {
		index = array.indexOf(obj);
	}
	return {obj, type, index};
};

export const getType = id => typeMap[id];

// Retorna o objeto e o tipo aceitando como parâmetro tanto o objeto como seu id ou um objeto de
// mesmo id
export const get = arg => {
	const id = arg instanceof Object? arg.id: arg;
	const obj = idMap[id];
	if (!obj) {
		throw 'Invalid argument';
	}
	return {obj, type: typeMap[id]};
};

// Remove um elemento da base de dados
export const remove = id => {
	const obj = idMap[id];
	if (obj === undefined) {
		throw `Id ${id} not found in project`;
	}
	const type = typeMap[id];
	const array = database[type];
	const index = array.indexOf(obj);
	array.splice(index, 1);
	delete idMap[id];
	delete typeMap[id];
};

// Retorna um array de todas as ocorrências do tipo 'type' onde o atributo 'attr' tem o valor
// 'value'
export const listByAttr = (type, attr, value) => {
	const array = database[type];
	if (!array) {
		throw 'Invalid type';
	}
	const result = [];
	array.forEach(obj => {
		if (obj[attr] == value) {
			result.push(obj);
		}
	});
	return result;
};

// Adiciona um objeto do tipo 'type' com os dados no objeto 'data'
// Retorna uma instância da classe correspondente ao tipo
export const add = (type, data) => {
	const constructor = typeToClass[type];
	if (!constructor) {
		throw 'Invalid type';
	}
	const obj = new constructor();
	for (let attr in obj) {
		const value = data[attr];
		if (value !== undefined) {
			obj[attr] = value;
		}
	}
	insert(obj, type);
	return obj;
};

// Esvazia o projeto
export const clear = () => {
	dependencyOrder.forEach(type => database[type].length = 0);
	database.name = DEFAULT_NAME;
	database.last_id = 0;
	idMap = {};
	typeMap = {};
};

// End of File
// ========================<-------------------------------------------->======================== //