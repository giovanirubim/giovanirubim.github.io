// ========================<-------------------------------------------->======================== //
// Módulos acessados

import * as forms from './forms.js';
import * as shell from './shell.js';

// ========================<-------------------------------------------->======================== //

// Formulário para criar/editar eixo
const axisForm = (title, onsubmit) => {
	const form = forms.create().title(title);
	form.addInput({title: 'Nome do eixo', type: 'text', name: 'name', col: 2});
	form.addInput({title: 'Descrição', type: 'text', name: 'desc', col: 4});
	form.endl();
	form.addInput({title: 'Diâmetro interno (m)', type: 'text', name: 'inner_diameter', col: 2});
	form.addInput({title: 'Diâmetro externo (m)', type: 'text', name: 'outer_diameter', col: 2});
	form.endl();
	form.addInput({title: 'Densidade (kg/m3)', type: 'text', name: 'density', col: 2});
	form.addInput({title: 'Módulo E (MPa)', type: 'text', name: 'mod_e', col: 2});
	form.addInput({title: 'Módulo G (MPa)', type: 'text', name: 'mod_g', col: 2});
	form.addButton({label: 'Enviar', col: 1, bg: 'submit', click: (button, form) => {
		const data = form.data();
		for (let name in data) {
			if (name !== 'name' && name !== 'desc') {
				data[name] = parseFloat(data[name]);
			}
		}
		form.close();
		onsubmit && onsubmit(data);
	}});
	form.addButton({label: 'Cancelar', col: 1, click: (button, form) => {
		form.close();
	}});
	return form;
};

// Formulário de adição de eixo
export const newAxis = () => {
	axisForm('Novo eixo', obj => {
		shell.addAxis(obj);
		shell.storeLocal();
	});
};

// Formulário de edição de eixo
export const editAxis = (axis) => {
	const {id} = axis;
	const form = axisForm('Editar eixo', obj => {
		if (shell.updateAxis({id, ...obj})) {
			shell.storeLocal();
		}
	});
	form.find('[name]').each(function(){
		const input = $(this);
		const name = input.attr('name');
		input.val(axis[name]);
	});
};

// Formulário para criar/editar instância de eixo
const axisInstanceForm = (title, onsubmit) => {
	const form = forms.create().title(title);
	form.addInput({title: 'Comprimento (m)', type: 'text', name: 'length', col: 2});
	form.addButton({label: 'Enviar', col: 1, bg: 'submit', click: (button, form) => {
		const data = form.data();
		data.length = parseFloat(data.length);
		form.close();
		onsubmit && onsubmit(data);
	}});
	form.addButton({label: 'Cancelar', col: 1, click: (button, form) => {
		form.close();
	}});
	return form;
};

// Formulário de adição de instância de eixo
export const newAxisInstance = (axis_id) => {
	axisInstanceForm('Nova instância', obj => {
		shell.addAxisInstance({...obj, axis_id});
		shell.storeLocal();
	});
};

// Formulário de adição de instância de eixo
export const editAxisInstance = (axis_instance) => {
	const form = axisInstanceForm('Nova instância', data => {
		if (shell.updateAxisInstance({id: axis_instance.id, ...data})) {
			shell.storeLocal();
		}
	});
	form.find('[name]').each(function(){
		const input = $(this);
		const name = input.attr('name');
		input.val(axis_instance[name]);
	});
};

// Mapeia o tipo de um objeto com o método de edição correspondente
const mapTypeEdit = {
	axis: editAxis,
	axis_instance: editAxisInstance,
};

// Chamada genérica para edição de objetos
export const edit = arg => {
	const {obj, type} = shell.get(arg);
	const method = mapTypeEdit[type];
	if (method) {
		method(arg);
	}
};

// End of File
// ========================<-------------------------------------------->======================== //