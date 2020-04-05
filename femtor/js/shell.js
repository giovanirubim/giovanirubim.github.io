// ========================<-------------------------------------------->======================== //
// Núcleo do editor (shell)
// Todas as alterações realizadas no projeto devem ser executadas por este módulo
// Este módulo fará as alterações necessárias na base de dados no módulo project e as alterações
// necessárias na visualização do editor e na barra lateral através dos módulos view3d e leftbar

// ========================<-------------------------------------------->======================== //
// Módulos acessados

import * as project from './project.js';
import * as leftbar from './leftbar.js';
import * as view3d from './view3d.js';
import * as ri from './ri-format.js';
import * as selection from './selection.js';

// ========================<-------------------------------------------->======================== //
// Métodos públicos de manipulação do projeto

// Busca um objeto e seu tipo a partir do objeto ou de seu id
export const get = arg => project.get(arg);

// Insere um eixo a partir dos dados contidos no objeto data
export const addAxis = data => {
	const obj = project.add('axis', data);
	leftbar.add('axis', obj);
	return obj;
};

// Insere uma instância de eixo a partir dos dados contidos no objeto data
export const addAxisInstance = data => {
	const axis = project.find(data.axis_id).obj;
	if (!axis) {
		throw 'Axis not found';
	}
	const obj = project.add('axis_instance', data);
	const {inner_diameter, outer_diameter} = axis;
	view3d.addCylinder(obj.id, inner_diameter/2, outer_diameter/2, obj.length);
	leftbar.add('axis_instance', obj);
	return obj;
};

// Remove um eixo
// O argumento pode ser o id, o próprio objeto, ou um objeto de mesmo id
const removeAxis = (axis) => {
	__unselect(axis, 'axis');
	const {id} = axis;
	project.remove(id);
	leftbar.remove(id);
	const instances = project.listByAttr('axis_instance', 'axis_id', id);
	instances.forEach(removeAxisInstance);
};

// Remove uma instância de eixo
// O argumento pode ser o id, o próprio objeto, ou um objeto de mesmo id
export const removeAxisInstance = (axis_instance, updateIndexes = true) => {

	const {id} = axis_instance;
	const array = project.database.axis_instance;
	const index = array.indexOf(axis_instance);
	const {length} = array;

	// Atualiza o índice das instâncias consecutivas na barra lateral
	for (let i=index + 1; i<length; ++i) {
		leftbar.updateText(array[i].id, {index: i});
	}
	
	__unselect(axis_instance, 'axis_instance');
	leftbar.remove(id);
	project.remove(id);
	view3d.removeCylinder(id);

};

// Altera uma instância de eixo
export const updateAxisInstance = data => {
	const {id, length} = data;
	const instance = project.find(id).obj;
	if (length == null || length == instance.length) {
		return false;
	}
	instance.length = length;
	view3d.updateCylinder(id, null, null, length);
	return true;
};

// Atualiza um eixo
export const updateAxis = data => {
	const {id} = data;
	const axis = project.find(id).obj;
	const changed = {};
	let updated = false;
	for (let attr in axis) {
		const newVal = data[attr];
		if (newVal !== undefined && newVal !== axis[attr]) {
			axis[attr] = newVal;
			changed[attr] = true;
			updated = true;
		}
	}
	if (updated === false) {
		return false;
	}
	const r0 = axis.inner_diameter/2;
	const r1 = axis.outer_diameter/2;
	let instances = null;
	if (changed['inner_diameter'] || changed['outer_diameter']) {
		if (!instances) {
			instances = project.listByAttr('axis_instance', 'axis_id', id);
		}
		instances.forEach(instance => {
			const {id} = instance;
			view3d.updateCylinder(id, r0, r1, null);
		});
	}
	if (changed['name']) {
		if (!instances) {
			instances = project.listByAttr('axis_instance', 'axis_id', id);
		}
		instances.forEach(instance => {
			const {id} = instance;
			leftbar.updateText(id, {'axis-name': axis.name});
		});
		leftbar.updateText(axis.id, {'title': axis.name});
	}
	return true;
};

// Limpa o projeto
export const clear = () => {
	leftbar.clear();
	project.clear();
	view3d.clearCylinders();
};

// Mapea o tipo com a função de add
const addMap = {
	'axis': addAxis,
	'axis_instance': addAxisInstance
};

// Mapea o tipo com a função de remover
const removeMap = {
	'axis': removeAxis,
	'axis_instance': removeAxisInstance
};

// Remove um elemento do projeto
export const remove = arg => {
	const {obj, type} = project.get(arg);
	removeMap[type](obj);
};

// Armazena localmente o projeto
export const storeLocal = () => {
	if (!localStorage) {
		return false;
	}
	const {database} = project;
	const json = JSON.stringify(database);
	localStorage.setItem('json', json);
	return true;
};

// Carrega localmente o projeto
export const loadLocal = () => {
	if (!localStorage) {
		return false;
	}
	const json = localStorage.getItem('json');
	if (!json) {
		return false;
	}
	loadJSON(json);
	return true;
};

// Carrega uma string com o conteúdo de um arquivo RI
export const loadRI = (src, config) => {
	ri.load(src, config);
};

// Carrega uma string com um JSON contendo o projeto
export const loadJSON = json => {
	clear();
	const database = JSON.parse(json);
	projectName(database.name);
	project.dependencyOrder.forEach(type => {
		const add = addMap[type];
		database[type].forEach(add);
	});
	return true;
};

// Retorna uma string contendo um JSON com os dados do projeto
export const generateJson = () => JSON.stringify(project.database);

// Retorna ou Atribui o nome do projeto
export const projectName = arg => {
	if (arg === undefined) {
		return project.database.name;
	}
	if (arg != null) {
		$('head title').html($.txt('ROTMef - ' + arg));
		project.database.name = arg;
	}
};

// ========================<-------------------------------------------->======================== //
// Internal version of public methods with more arguments and less overhead

const __select = (obj, type) => {
	if (selection.add(obj, type)) {
		leftbar.select(obj.id);
		return true;
	}
	return false;
};

const __unselect = (obj, type) => {
	if (selection.remove(obj, type)) {
		leftbar.unselect(obj.id);
		return true;
	}
	return false;
};

// ========================<-------------------------------------------->======================== //

export const select = arg => {
	const {obj, type} = project.get(arg);
	if (!obj) {
		throw 'Invalid argument';
	}
	return __select(obj, type);
};

export const unselect = arg => {
	const {obj, type} = project.get(arg);
	if (!obj) {
		throw 'Invalid argument';
	}
	return __unselect(obj, type);
};

export const toggleSelection = arg => {
	const {obj, type} = project.get(arg);
	if (!obj) {
		throw 'Invalid argument';
	}
	if (selection.hasId(obj.id)) {
		__unselect(obj, type);
	} else {
		__select(obj, type);
	}
};

export const clearSelection = () => {
	selection.each(obj => {
		__unselect(obj, project.getType(obj.id));
	});
};

selection.onselect('axis_instance', instance => {
	view3d.highlightCylinder(instance.id);
});

selection.onunselect('axis_instance', instance => {
	view3d.highlightCylinder(instance.id, false);
});

// End of File
// ========================<-------------------------------------------->======================== //