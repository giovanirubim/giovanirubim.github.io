// ========================<-------------------------------------------->======================== //
// Global variables

let leftbar;
let leftbarContent;
let lastAutoId = 0;
const idMap = {};

// ========================<-------------------------------------------->======================== //
// Item

class Item {
	constructor(id) {
		if (!id) id = 'auto_' + (++lastAutoId);
		idMap[id] = this;
		const main = $.new(`div#${id}.item`);
		const head = $.new('div.head');
		const rButtons = $.new('div.r-buttons');
		const lButtons = $.new('div.l-buttons');
		main.append(head);
		const title = $.new('div.title');
		head.append([rButtons, title, lButtons]);
		this.id = id;
		this.jdom = { main, title, lButtons, rButtons };
		this.buttonMap = {};
	}
	setTitle(text) {
		this.jdom.title.html($.txt(text));
		return this;
	}
	addButton(iconClass, name, side) {
		const {buttonMap, jdom} = this;
		const button = $.new('div.button');
		button.append($.new('i').attr('class', iconClass));
		buttonMap[name] = button;
		jdom[side + 'Buttons'].append(button);
		return this;
	}
	addButtonL() {
		return this.addButton(...arguments, 'l');
	}
	addButtonR() {
		return this.addButton(...arguments, 'r');
	}
	remove() {
		this.jdom.main.remove();
		delete idMap[this.id];
		return this;
	}
}

// ========================<-------------------------------------------->======================== //
// Private methods

const append = item => leftbarContent.append(item.jdom.main);

// ========================<-------------------------------------------->======================== //
// Public methods

export const getWidth = () => {
	return parseInt(leftbar.css('width').replace('px',''));
};

export const get = id => idMap[id] || null;

export const createItem = id => new Item(id);

export const init = () => {
	leftbar = $('#leftbar');
	leftbarContent = leftbar.children('.content');
	const axis = new Item('axis')
		.setTitle('Eixos')
		.addButtonL('fas fa-plus', 'add', 'l')
		.addButtonR('fas fa-chevron-left', 'open-close');
	const disk = new Item('disk')
		.setTitle('Discos')
		.addButtonL('fas fa-plus', 'add', 'l')
		.addButtonR('fas fa-chevron-left', 'open-close');
	const mg = new Item('mg')
		.setTitle('Mancais Guia')
		.addButtonL('fas fa-plus', 'add', 'l')
		.addButtonR('fas fa-chevron-left', 'open-close');
	const me = new Item('me')
		.setTitle('Mancais Escora')
		.addButtonL('fas fa-plus', 'add', 'l')
		.addButtonR('fas fa-chevron-left', 'open-close');
	append(axis);
	append(disk);
	append(mg);
	append(me);
};

// End of File
// ========================<-------------------------------------------->======================== //