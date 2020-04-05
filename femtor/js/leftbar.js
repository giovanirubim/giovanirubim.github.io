// ========================<-------------------------------------------->======================== //
// Responsável pelos eventos e elementos da barra lateral

// ========================<-------------------------------------------->======================== //
// Módulos acessados

import * as project from './project.js';
import * as shell from './shell.js';
import * as view3d from './view3d.js';
import * as views from './views.js';
import * as scinot from './scinot.js';

// ========================<-------------------------------------------->======================== //
// Global variables

let leftbar;

// ========================<-------------------------------------------->======================== //
// Public methods

// Calcula a largura da barra lateral
export const getWidth = () => {
	return parseInt((leftbar.css('width')).replace('px',''));
};

// Gera o download de um arquivo de conteúdo textual
const downloadTextFile = (fileName, content) => {
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
	element.setAttribute('download', fileName);
	element.style.display = 'none';
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
};

// Gera uma string correspondente a um id para ser utilizada como id no elemento dom correspondente
const getIdAttr = id => 'pid' + id;

// Extrai o id numérico da string utilizada como id de um elemento dom
const getIdFrom = attr => parseInt(attr.substr(3));

const bindExportJSON = () => {
	// Exporta o projeto utilizando o formato JSON
	$('#exportJson').bind('click', () => {
		const json = shell.generateJson();
		downloadTextFile(shell.projectName() + '.json', json);
	});
};

const bindLoadFile = () => {
	const input = $('#loadFile');
	input.bind('change', () => {
		const {files} = input[0];
		const [file] = files;
		if (!file) {
			return;
		}
		const reader = new FileReader();
		reader.onload = () => {
			const {name} = file;
			input[0].value = '';
			const {result} = reader;
			const index = name.lastIndexOf('.');
			const ext = name.substr(index + 1).toLowerCase();
			if (ext === 'ri') {
				shell.loadRI(result);
				shell.projectName(name.substr(0, index));
			} else if (ext === 'json') {
				shell.loadJSON(result);
			} else {
				throw 'Invalid file extension';
			}
			shell.storeLocal();
		};
		reader.readAsText(file);
	});
	input.closest('.option').bind('click', e => {
		const target = e.target || e.srcElement;
		if (target !== input[0]) {
			input.trigger('click');
		}
	});
};

const bindButtons = () => {

	// Evento de adição de eixos
	$('#add_axis').bind('click', () => {
		views.newAxis();
		shell.storeLocal();
	});

	// Evento de remoção
	leftbar.on('click', '.remove', function(){
		const element = $(this).closest('.item');
		const id = getIdFrom(element.attr('id'));
		shell.remove(id);
		shell.storeLocal();
	});
	
	// Evento de edição
	leftbar.on('click', '.duplicate', function(){
		const item = $(this).closest('.item');
		const id = getIdFrom(item.attr('id'));
		const {obj, type} = project.find(id);
		if (type === 'axis') {
			const newAxis = shell.addAxis({...obj, id: null});
			views.editAxis(newAxis);
		}
	});
	
	// Evento de edição
	leftbar.on('click', '.edit', function(){
		const item = $(this).closest('.item');
		const id = getIdFrom(item.attr('id'));
		const {obj, type} = project.find(id);
		if (type === 'axis') {
			views.editAxis(obj);
		} else if (type === 'axis_instance') {
			views.editAxisInstance(obj);
		}
	});

	// Evento de instanciação
	leftbar.on('click', '.instanciate', function(){
		const item = $(this).closest('.item');
		const axis_id = getIdFrom(item.attr('id'));
		views.newAxisInstance(axis_id);
	});

};

const bindItemSelections = () => {

	leftbar.on('click', '[object-type="axis_instance"] .item', function(e) {
		const target = $(e.srcElement || e.target);
		if (target.is('.button,.button *')) {
			return;
		}
		const item = $(this);
		const id = getIdFrom(item.attr('id'));
		const many = e.ctrlKey || e.shiftKey;
		if (many) {
			if (item.is('.selected')) {
				shell.unselect(id);
			} else {
				shell.select(id);
			}
		} else {
			shell.clearSelection();
			shell.select(id);
		}
	});

};

// Adiciona os eventos de abrir e fechar um container da barra lateral
const bindContainers = () => {
	$('#leftbar .open-close .button').bind('click', function(){
		const container = $(this).closest('.container');
		container.toggleClass('closed');
		if (container.hasClass('closed')) {
			container.children('.content').finish().slideUp(250);
		} else {
			container.children('.content').finish().slideDown(250);
		}
	});
};

// Função que deve ser chamada apenas uma vez quando a página já está carregada
export const init = () => {
	leftbar = $('#leftbar');
	bindContainers();
	bindExportJSON();
	bindLoadFile();
	bindButtons();
	bindItemSelections();
};

// Insere um objeto 'obj' do tipo 'type' na barra lateral
export const add = (type, obj) => {
	if (type === 'axis') {
		const template = $('[object-type="axis"] .item.template');
		const parent = template.parent();
		const item = template.clone();
		item.removeClass('template');
		parent.append(item);
		item.find('.title').html($.txt(obj.name));
		item.attr('id', getIdAttr(obj.id));
	}
	if (type === 'axis_instance') {
		const template = $('[object-type="axis_instance"] .item.template');
		const parent = template.parent();
		const item = template.clone();
		item.removeClass('template');
		parent.append(item);
		const {index} = project.find(obj.id, true);
		const axis = project.find(obj.axis_id).obj;
		item.attr('id', getIdAttr(obj.id));
		item.find('.axis-name').html($.txt(axis.name));
		item.find('.length').html($.txt(scinot.dump(obj.length)));
		item.find('.index').html($.txt(index + 1));
	}
};

// Remove um item da barra lateral
// O argumento pode ser o objeto correspondente ou seu id
export const remove = arg => {
	const id = arg instanceof Object? arg.id: arg;
	const item = getItem(id);
	if (!item.length) {
		throw `Id ${id} not found in #leftbar`;
	}
	item.remove();
};

export const getItem = id => $('#' + getIdAttr(id));

export const select = id => getItem(id).addClass('selected');
export const unselect = id => getItem(id).removeClass('selected');

// Atualiza o título textual de um item na barra lateral a partir do id do objeto correspondente
export const updateTitle = (id, title) => {
	getItem(id).find('.title').html($.txt(title));
};

export const updateText = (id, data) => {
	const item = getItem(id);
	for (let name in data) {
		const text = $.txt(data[name]);
		item.find('.' + name).html(text);
	}
	return item;
};

// Remove todos os itens da barra lateral
export const clear = () => {
	$('.item').not('.template').remove();
};

// End of File
// ========================<-------------------------------------------->======================== //