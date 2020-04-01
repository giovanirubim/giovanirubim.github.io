// --------------------------------------------------
// <start> fname: js/globals.js

const PI = Math.PI;
const TAU = Math.PI*2;

let canvas;
let ctx;

let screen_sx;
let screen_sy;
let editor_sx;
let editor_sy;
let editor_true_sx;
let editor_true_sy;
let editor_cx;
let inner_sx;
let inner_sy;
let start_x;
let start_y;
let end_x;
let end_y;
let nodes_x;
let space_sx;
let space_sy;
let space_x;
let space_y;
let toolButton_x;
let toolButton_y0 = 35;
let toolButton_rad = 20;
let toolButton_margin = 10;
let mg_width = 3;
let mg_delta = 5;
let mg_n = 6;

let leftbar_sx = 250;
let item_spacing = 4;
let item_sy = 22;
let item_padding = 5;
let item_font = 13;
let info_font = 13;
let item_tab_sx = 15;
let button_spacing = 5;
let button_radius = 7;
let plus_linewidth = 2;
let plus_radius = button_radius*0.7;
let ex_radius = plus_radius/Math.SQRT2;
let min_dist = 3;
let margin = 0.1;
let node_radius = 5;
let node_line_cut = 10;
let mode3d = false;

const themes = [
	{
		background: '#ddd',
		outline: '#069',
		text: ['#ccc', '#fff', '#222'],

		lbitem: '#07a',
		leftbar: '#069',
		
		cylinder: '#aaa',

		free_node: '#aaa',
		free_node_line: '#07f',
		free_node_outline: '#07f',

		fixed_node: '#aaa',
		fixed_node_line: '#024',
		fixed_node_outline: '#069',

		selected_cylinder: '#ccc',
		
		selected_free_node: '#fff',
		selected_free_node_line: '#07f',
		selected_free_node_outline: '#07f',

		selected_fixed_node: '#fff',
		selected_fixed_node_line: '#024',
		selected_fixed_node_outline: '#069',
		
		ruler: '#024',
		mg: '#036',
		me: '#036',

	},
	{
		background: '#202020',
		outline: '#f70',
		cylinder: '#333',
		text: ['#ccc', '#fff', '#aaa'],

		lbitem: '#333',
		leftbar: '#555',
		
		free_node: '#444',
		free_node_line: '#888',
		free_node_outline: '#fa3',
		
		fixed_node: '#444',
		fixed_node_line: '#666',
		fixed_node_outline: '#f70',

		selected_cylinder: '#246',
		
		selected_free_node: '#246',
		selected_free_node_line: '#5df',
		selected_free_node_outline: '#5df',
		
		selected_fixed_node: '#246',
		selected_fixed_node_line: '#5df',
		selected_fixed_node_outline: '#5df',
	}
];

let theme_index = 0;
let colors = themes[theme_index];

const setTheme = num => {
	num --;
	if (num < 0 || num >= themes.length) {
		return false;
	}
	if (theme_index !== num) {
		theme_index = num;
		colors = themes[theme_index];
		storeThemeLocal();
		return true;
	}
	return true;
};

// <end>
// --------------------------------------------------

// --------------------------------------------------
// <start> fname: js/classes.js

class Button {
	constructor(name, draw, pull_right) {
		this.draw = draw;
		this.name = name;
		this.visible = true;
		this.x = null;
		this.y = null;
		this.pull_right = pull_right || false;
		this.parent = null;
	}
	render(x, y) {
		if (!this.visible) return this;
		const {draw} = this;
		if (draw) {
			draw(x, y, this);
		} else {
			ctx.fillStyle = colors.text[0];
			ctx.beginPath();
			ctx.arc(x, y, button_radius, 0, TAU);
			ctx.fill();
		}
		this.x = x;
		this.y = y;
		return this;
	}
	wraps(tx, ty) {
		const {x, y} = this;
		const dx = x - tx;
		const dy = y - ty;
		return Math.sqrt(dx*dx + dy*dy) <= button_radius;
	}
}

class LBItem {
	constructor(title, name) {
		this.parent = null;
		this.x = null;
		this.y = null;
		this.sx = null;
		this.sy = null;
		this.visible = true;
		this.title = title;
		this.name = name;
		this.children = [];
		this.buttons = [];
		this.open = true;
		this.buttonMap = {};
		this.highlighted = false;
	}
	addButton(button) {
		button.parent = this;
		this.buttons.push(button);
		this.buttonMap[button.name] = button;
		return this;
	}
	wraps(tx, ty) {
		const {x, y, sx, sy} = this;
		return (tx >= x && ty >= y && tx < x + sx && ty < y + sy);
	}
	index() {
		if (!this.parent) return -1;
		return this.parent.children.indexOf(this);
	}
	render(x, y) {

		if (!this.visible) return 0;
		leftbar.rendered_items.push(this);

		let sx = leftbar_sx - item_spacing - x;
		let sy = item_sy;

		this.x = x;
		this.y = y;
		this.sx = sx;
		this.sy = sy;

		let ax = x + item_padding;
		let bx = x + sx - item_padding;
		let cy = y + sy*0.5;

		if (this.parent === null) {
			ctx.fillStyle = colors.lbitem;
			ctx.fillRect(x, y, sx, sy);
		}

		if (this.highlighted) {
			ctx.fillStyle = colors.text[1];
			ctx.font = 'bold ' + item_font + 'px monospace';
		} else {
			ctx.fillStyle = colors.text[0];
			ctx.font = item_font + 'px monospace';
		}
		ctx.textAlign = 'left';
		ctx.textBaseline = 'middle';
		ctx.fillText(this.title, ax, y + sy*0.55);
		ax += ctx.measureText(this.title).width + button_spacing;

		const {buttons} = this;
		for (let i=0; i<buttons.length; ++i) {
			const button = buttons[i];
			if (!button.visible) {
				continue;
			}
			leftbar.rendered_buttons.push(button);
			if (button.pull_right) {
				button.render(bx - button_radius, cy);
				bx -= button_radius*2 + button_spacing;
			} else {
				button.render(ax + button_radius, cy);
				ax += button_radius*2 + button_spacing;
			}
		}

		y += sy;

		const {children} = this;
		if (this.open && children.length) {
			children.forEach(child => {
				y += item_spacing;
				sy += item_spacing;
				const height = child.render(x + item_tab_sx, y);
				y += height;
				sy += height;
			});
		}

		return sy;

	}
	append(child) {
		if (this.buttonMap.toggle) {
			this.buttonMap.toggle.visible = true;
		}
		child.parent = this;
		this.children.push(child);
		return this;
	}
	removeChild(child) {
		const {children} = this;
		const index = children.indexOf(child);
		if (index === -1) return this;
		children.splice(index, 1);
		if (children.length === 0 && this.buttonMap.toggle) {
			this.buttonMap.toggle.visible = false;
		}
		return this;
	}
	remove() {
		if (!this.parent) return this;
		this.parent.removeChild(this);
		this.parent = null;
		return this;
	}
};

// <end>
// --------------------------------------------------

// --------------------------------------------------
// <start> fname: js/leftbar.js

const leftbar = {
	items: [],
	rendered_buttons: [],
	rendered_items: [],
	groupMap: {},
	getButtonAt: (x, y) => {
		const array = leftbar.rendered_buttons;
		for (let i=0; i<array.length; ++i) {
			if (array[i].wraps(x, y)) {
				return array[i];
			}
		}
		return null;
	},
	find: name => {
		const search = item => {
			if (item.name === name) {
				return item;
			}
			const {children} = item;
			for (let i=children.length; i--;) {
				const child = children[i];
				if (child.name === name) {
					return child;
				}
			}
			return null;
		};
		const {items} = leftbar;
		for (let i=items.length; i--;) {
			const res = search(items[i]);
			if (res) return res;
		}
		return null;
	},
	getItemAt: (x, y) => {
		const array = leftbar.rendered_items;
		for (let i=array.length; i--;) {
			const item = array[i];
			if (item.wraps(x, y)) return item;
		}
		return null;
	},
	init: () => {
		const addPropGroup = (label, name) => {
			const group = new LBItem(label, name);
			group.addButton(new Button('add', drawPlus));
			group.addButton(new Button('toggle', drawToggle, true));
			group.buttonMap.toggle.visible = false;
			leftbar.items.push(group);
			leftbar.groupMap[name] = group;
		};
		addPropGroup(toLabel.axis[1], 'axis');
		addPropGroup(toLabel.disk[1], 'disk');
		addPropGroup(toLabel.mg[1], 'mg');
		addPropGroup(toLabel.me[1], 'me');
		const list = new LBItem('Modelo', 'item-list');
		list.addButton(new Button('toggle', drawToggle, true));
		list.buttonMap.toggle.visible = false;
		leftbar.items.push(list);
	}
};

// <end>
// --------------------------------------------------

// --------------------------------------------------
// <start> fname: js/cylinder-nodes.js

let cylinder_scale_x = 1;
let cylinder_scale_y = 1;

const cylinders = [];
const fixedNodes = [];
const freeNodes = [];

let cylinders_updated = false;
const cylindersChanged = () => {
	cylinders_updated = false;
	nodesChanged();
};

let nodes_updated = false;
const nodesChanged = () => {
	nodes_updated = false;
};

let axisInstanceToPos = {};
let nodeToIndex = {};
let hSum;
const mappedNodes = [];
const mapCylinders = () => {
	axisInstanceToPos = {};
	if (mode3d) return buildCylinders3D();
	cylinders.length = 0;
	let pos = 0;
	project.database.axis_instance.forEach((instance) => {
		const axis = project.find(instance.axis_id).object;
		cylinders.push({
			w: axis.prop.outer_diameter,
			i: axis.prop.inner_diameter,
			h: instance.length,
			x: null, sx: null,
			y: null, sy: null,
			pos, ref: instance
		});
		axisInstanceToPos[instance.id] = pos;
		pos += instance.length;
	});
	hSum = pos;
	cylinders_updated = true;
	mapNodes();
};

const mapNodes = () => {
	mappedNodes.length = 0;
	nodeToIndex = {};
	project.database.node.forEach(node => {
		let {axis_instance_id, position} = node;
		if (axis_instance_id) {
			position = axisInstanceToPos[axis_instance_id];
		} else if (position == null) {
			position = hSum;
		}
		mappedNodes.push({node, position});
	});
	mappedNodes.sort((a, b) => a.position - b.position);
	mappedNodes.forEach((node, i) => nodeToIndex[node.node.id] = i);
};

const buildCylinders3D = () => {
	let array = [];
	project.database.axis_instance.forEach(instance => {
		const axis = project.find(instance.axis_id).object;
		let obj = {
			r0: axis.prop.inner_diameter/2,
			r1: axis.prop.outer_diameter/2,
			h: instance.length,
		};
		array.push(obj);
	});
	Ctrl3D.setCylinders(array);
	cylinders_updated = true;
};

const getInstanceAtXY = (tx, ty) => {
	for (let i=0; i<cylinders.length; ++i) {
		const cylinder = cylinders[i];
		const {x, y, sx, sy} = cylinder;
		if (tx >= x && tx < x + sx && ty >= y && ty < y + sy) {
			return cylinder.ref;
		}
	}
	return null;
};

const getInstancePosition = instance => {
	const array = project.database.axis_instance;
	let sum = 0;
	for (let i=0; i<array.length; ++i) {
		if (array[i] === instance) return sum;
		sum += array[i].length;
	}
	return null;
};

const buildNodes = () => {
	if (nodes_updated) return;
	fixedNodes.length = 0;
	freeNodes.length = 0;
	const x = null, y = null, ex = null;
	const array = project.database.node;
	for (let i=0; i<array.length; ++i) {
		const node = array[i];
		let {axis_instance_id, position} = node;
		if (axis_instance_id) {
			const {object, index} = project.find(axis_instance_id, true);
			fixedNodes.push({ ref: node, index, position: null, x, y, ex });
		} else if (position != null) {
			freeNodes.push({ ref: node, index: null, position, x, y, ex });
		} else {
			let index = project.database.axis_instance.length;
			fixedNodes.push({ ref: node, index, position: null, x, y, ex });
		}
	}
	mapNodes();
	nodes_updated = true;
};

const getNodeAt = (x, y) => {
	for (let i=fixedNodes.length; i--;) {
		const node = fixedNodes[i];
		const dx = x - node.x;
		const dy = y - node.y;
		if (Math.sqrt(dx*dx + dy*dy) <= node_radius) {
			return node.ref;
		}
	}
	for (let i=freeNodes.length; i--;) {
		const node = freeNodes[i];
		const dx = x - node.x;
		const dy = y - node.y;
		if (Math.sqrt(dx*dx + dy*dy) <= node_radius) {
			return node.ref;
		}
	}
	return null;
};

const getInstanceDiameter = instance => {
	const axis = project.find(instance.axis_id).object;
	return axis.prop.outer_diameter;
};

const getDiamAt = position => {
	if (position < 0) return null;
	const array = project.database.axis_instance;
	let sum = 0;
	let index = null;
	for (let i=0; i<array.length; ++i) {
		const instance = array[i];
		let next_sum = sum + instance.length;
		if (next_sum > position) {
			return getInstanceDiameter(instance);
		}
		if (next_sum === position) {
			index = i;
			break;
		}
		sum = next_sum;
	}
	if (index === null) return null;
	if (index === array.length - 1) {
		return getInstanceDiameter(array[index]);
	}
	const diam_1 = getInstanceDiameter(array[index]);
	const diam_2 = getInstanceDiameter(array[index + 1]);
	return Math.max(diam_1, diam_2);
};

const getInstanceAtPos = position => {
	if (position < 0) return null;
	const array = project.database.axis_instance;
	let sum = 0;
	let index = null;
	for (let i=0; i<array.length; ++i) {
		const instance = array[i];
		let next_sum = sum + instance.length;
		if (next_sum > position) {
			return instance;
		}
		if (next_sum === position) {
			index = i;
			break;
		}
		sum = next_sum;
	}
	if (index === null) return null;
	if (index === array.length - 1) {
		return array[index];
	}
	return array[index + 1];
};

const updateNodeCoord = node => {
	const nodes_x = (space_x + leftbar_sx)/2;
	const {index, position} = node;
	if (position != null) {
		node.x = nodes_x;
		node.y = position*cylinder_scale_y + space_y;
		node.ex = editor_cx - getDiamAt(position)/2*cylinder_scale_x;
		return;
	}
	if (index === 0) {
		const cylinder = cylinders[0];
		node.x = nodes_x;
		node.y = cylinder.y;
		node.ex = cylinder.x;
		return;
	}
	if (index === cylinders.length) {
		const cylinder = cylinders[cylinders.length - 1];
		node.x = nodes_x;
		node.y = cylinder.y + cylinder.sy;
		node.ex = cylinder.x;
		return;
	}
	let a = cylinders[index];
	let b = cylinders[index - 1];
	node.x = nodes_x;
	node.y = a.y;
	node.ex = Math.min(a.x, b.x);
};

const sumCylinders = () => {
	let total_w = 0;
	let total_h = 0;
	cylinders.forEach(cylinder => {
		let {w, h} = cylinder;
		total_w = Math.max(total_w, w-0);
		total_h += h-0;
	});
	return {total_w, total_h};
};

// Em a conta, em b não
const getFreeNodesBetween = (a, b) => {
	const array = project.database.node;
	const res = [];
	for (let i=0; i<array.length; ++i) {
		const node = array[i];
		const {position} = node;
		if (position != null && position >= a && position < b) {
			res.push(node);
		}
	}
	return res;
};

const getNodesAt = instance => {
	const a = getInstancePosition(instance);
	const b = a + instance.length;
	return getFreeNodesBetween(a, b);
};

// <end>
// --------------------------------------------------

// --------------------------------------------------
// <start> fname: js/table.js

const generateMatrix = () => {
	const table = [];
	mapNodes();
	mappedNodes.forEach(({node, position}) => {
		const content = getNodeContent(node);
		const row = new Array(32).fill(0);
		const axis = project.find(getInstanceAtPos(position).axis_id).object;
		row[0] = axis.prop.outer_diameter;
		row[1] = axis.prop.inner_diameter;
		row[2] = axis.prop.density;
		row[3] = axis.prop.mod_e;
		row[4] = axis.prop.mod_g;
		row[5] = position;
		content.forEach(element => {
			const type = project.find(element.id).type;
			if (type === 'disk_instance') {
				const disk = project.find(element.disk_id).object;
				row[6] = disk.prop.diameter;
				row[7] = disk.prop.polar_inertia;
				row[8] = disk.prop.diametrical_inertia;
				row[9] = disk.prop.mass;
			}
			if (type === 'mg_instance') {
				const mg = project.find(element.mg_id).object;
				row[10] = mg.prop.kxx;
				row[11] = mg.prop.kxy;
				row[12] = mg.prop.kyy;
				row[13] = mg.prop.kyx;
				row[14] = mg.prop.cxx;
				row[15] = mg.prop.cxy;
				row[16] = mg.prop.cyy;
				row[17] = mg.prop.cyx;
				row[18] = mg.prop.mass_x;
				row[19] = mg.prop.mass_y;
				row[20] = mg.prop.k0;
				row[21] = mg.prop.c0;
				row[22] = mg.prop.i0;
			}
			if (type === 'me_instance') {
				const me = project.find(element.me_id).object;
				row[23] = me.prop.k0x;
				row[24] = me.prop.k0y;
				row[25] = me.prop.c0y;
				row[26] = me.prop.c0x;
				row[27] = me.prop.ix;
				row[28] = me.prop.iy;
				row[29] = me.prop.k0;
				row[30] = me.prop.c0;
				row[31] = me.prop.i0;
			}
		});
		table.push(row);
	});
	return table;
};

let matrixShadow = null;
const closeMatrix = () => {
	if (!matrixShadow) return;
	let aux = matrixShadow;
	matrixShadow.animate({
		opacity: 0
	}, () => aux.remove());
	matrixShadow = null;
};
const popupMatrix = () => {
	if (matrixShadow) return;
	showingMatrix = true;
	const shadow = $.new('div').css({
		'position': 'fixed',
		'z-index': 10,
		'top': '0px',
		'left': '0px',
		'right': '0px',
		'bottom': '0px',
		'opacity': 0,
		'background-color': 'rgba(8, 8, 8, 0.75)',
		'text-align': 'center'
	});
	const main = $.new('div').css({
		'background-color': '#fff',
		'box-shadow': '0px 5px 5px rgba(0, 0, 0, 0.5)',
		'display': 'inline-block',
	});
	$('body').append(shadow);
	const table = $.new('table').css({
		'font-family': 'monospace',
		'margin': '15px 20px'
	}).attr({
		cellspacing: 10
	});
	const m = generateMatrix();
	for (let i=0; i<m.length; ++i) {
		const tr = $.new('tr');
		const row = m[i];
		row.forEach(val => {
			const td = $.new('td').append(val);
			tr.append(td);
		});
		table.append(tr);
	}
	shadow.animate({opacity: 1});
	shadow.append(main);
	main.append(table);
	main.css({
		'margin-top': (shadow.sy() - main.sy())*0.4 + 'px'
	});
	matrixShadow = shadow;
};

// <end>
// --------------------------------------------------

// --------------------------------------------------
// <start> fname: js/project.js

class Project {
	constructor() {
		this.database = {
			axis: [],
			disk: [],
			mg: [],
			me: [],
			axis_instance: [],
			disk_instance: [],
			mg_instance: [],
			me_instance: [],
			node: []
		};
		this.idMap = {};
		this.typeMap = {};
		this.lastId = 0;
	}
	newId() {
		return ++ this.lastId;
	}
	resetMaps() {
		const {database} = this;
		const idMap = {};
		const typeMap = {};
		for (let type in database) {
			const array = database[type];
			for (let i=array.length; i--;) {
				const {id} = array
			}
		}
		return this;
	}
	add(type, object) {
		const {idMap, typeMap, database} = this;
		let {id} = object;
		if (!id) {
			id = this.newId();
			object.id = id;
		} else {
			this.lastId = Math.max(this.lastId, id);
		}
		idMap[id] = object;
		typeMap[id] = type;
		const array = database[type];
		array.push(object);
		return object;
	}
	find(id, includeIndex) {
		const {idMap, typeMap, database} = this;
		const object = idMap[id];
		if (!object) {
			return null;
		}
		const type = typeMap[id];
		let index = null;
		if (includeIndex) {
			const array = database[type];
			index = array.indexOf(object);
		}
		return {object, type, index};
	}
	nodeOf(axis_instance) {
		const {database} = this;
		const array = database.node;
		for (let i=array.length; i--;) {
			const node = array[i];
			if (node.axis_instance_id === axis_instance.id) {
				return node;
			}
		}
		return null;
	}
	getReferences(from, id) {
		const {database} = this;
		const array = database[from];
		const res = [];
		const attr = this.find(id).type + '_id';
		for (let i=array.length; i;) {
			const obj = array[--i];
			if (obj[attr] === id) {
				res.push(obj);
			}
		}
		return res;
	}
	getReference(from, id) {
		const {database} = this;
		const array = database[from];
		const attr = this.find(id).type + '_id';
		for (let i=array.length; i;) {
			const obj = array[--i];
			if (obj[attr] === id) {
				return obj;
			}
		}
		return null;
	}
	remove(object) {
		const {idMap, typeMap, database} = this;
		const {id} = object;
		const type = typeMap[id];
		const array = database[type];
		const index = array.indexOf(object);
		array.splice(index, 1);
		delete typeMap[id];
		delete idMap[id];
		return this;
	}
	clear() {
		this.lastId = 0;
		const {database} = this;
		for (let type in database) {
			database[type].length = 0;
		}
		this.idMap = {};
		this.typeMap = {};
		return this;
	}
}

// <end>
// --------------------------------------------------

// --------------------------------------------------
// <start> fname: js/inputform.js

let anInputFormIsOpen = false;
const openInputForm = (title, fields, callback, cancel) => {

	if (!anInputFormIsOpen) {
		anInputFormIsOpen = true;
	} else {
		if (cancel) {
			cancel();
		}
		return;
	}

	const fieldMap = {};

	const shadow = $.new('div').css({
		'position': 'fixed',
		'z-index': 10,
		'top': '0px',
		'left': '0px',
		'right': '0px',
		'bottom': '0px',
		'opacity': 0,
		'background-color': 'rgba(8, 8, 8, 0.75)',
		'text-align': 'center'
	});

	const formDiv = $.new('div').css({
		'background-color': '#fff',
		'box-shadow': '0px 5px 5px rgba(0, 0, 0, 0.5)',
		'display': 'inline-block'
	});

	const formContent = $.new('div').css({
		'padding': '20px 25px',
		'text-align': 'left',
		'font-family': 'Monospace',
	});

	const formTitle = $.new('div').css({
		'font-size': '24px',
		'margin-bottom': '20px',
	}).append($.txt(title));
	formContent.append(formTitle);

	const buttonLine = $.new('div').css({
		'margin-top': '20px',
		'text-align': 'right'
	});

	const addButton = (name) => {
		const button = $.new('input[type="button"]').css({
			'margin-left': '15px',
			'border': '1px solid #ccc',
			'border-radius': '3px',
			'background-color': '#eee',
			height: '30px',
			width: '80px',
			cursor: 'pointer'
		});
		button.val(name);
		buttonLine.append(button);
		return button;
	};

	const addInput = (title, name, def) => {
		const field = $.new('div').css({
			'margin-top': '15px'
		});
		const input = $.new('input[type="text"][name="' + name + '"]').css({
			width: '300px',
			height: '26px',
			'padding-left': '6px',
			'font-family': 'Monospace',
			'font-size': '14px'
		});
		if (def) {
			input.val(def);
		}
		const titleDiv = $.new('div').append($.txt(title)).css({
			'font-size': '15px',
			'font-weight': 'bold',
			'color': '#444'
		});
		field.append(titleDiv).append(input);
		formContent.append(field);
	};

	const closeForm = callback => {
		shadow.animate({
			opacity: 0,
		}, 150, () => {
			shadow.remove();
			anInputFormIsOpen = false;
			if (callback) callback();
		});
	};
	
	addButton('Cancelar').bind('click', () => {
		closeForm(cancel);
	});
	
	addButton('Ok').bind('click', () => {
		let data = {};
		formContent.find('input[type="text"]').each((i, e) => {
			e = $(e);
			const name = e.attr('name');
			const field = fieldMap[name];
			if (field.type === 'number') {
				data[name] = parseFloat(e.val());
			} else {
				data[name] = e.val();
			}
		});
		closeForm(() => {
			if (callback) {
				callback(data);
			}
		});
	});

	formDiv.append(formContent);
	const updateMarginTop = () => {
		formDiv.css({
			'margin-top': Math.floor((shadow.sy() - formDiv.sy())*0.4) + 'px'
		});
	};

	fields.forEach(field => {
		const {name} = field;
		addInput(field.title, name, field['default']);
		fieldMap[name] = field;
	});

	formContent.append(buttonLine);
	$('body').append(shadow);

	shadow.append(formDiv);
	shadow.find('input').first().focus().select();
	shadow.animate({
		opacity: 1
	}, 150);

	updateMarginTop();

	return shadow;

};

// <end>
// --------------------------------------------------

// --------------------------------------------------
// <start> fname: js/draw.js

const drawPlus = (x, y, button) => {
	ctx.lineWidth = plus_linewidth;
	ctx.strokeStyle = colors.text[0];
	ctx.beginPath();
	ctx.moveTo(x + plus_radius, y);
	ctx.lineTo(x - plus_radius, y);
	ctx.moveTo(x, y + plus_radius);
	ctx.lineTo(x, y - plus_radius);
	ctx.stroke();
};

const drawAdd = (x, y) => {
	ctx.strokeStyle = colors.text[0];
	ctx.beginPath();
	ctx.moveTo(x - plus_radius, y);
	ctx.lineTo(x + plus_radius, y);
	ctx.moveTo(x, y - plus_radius);
	ctx.lineTo(x + plus_radius, y);
	ctx.lineTo(x, y + plus_radius);
	ctx.stroke();
};

const drawDelete = (x, y, button) => {
	ctx.lineWidth = plus_linewidth;
	ctx.strokeStyle = colors.text[0];
	ctx.beginPath();
	ctx.moveTo(x + ex_radius, y + ex_radius);
	ctx.lineTo(x - ex_radius, y - ex_radius);
	ctx.moveTo(x + ex_radius, y - ex_radius);
	ctx.lineTo(x - ex_radius, y + ex_radius);
	ctx.stroke();
};

const drawEdit = (x, y, button) => {
	ctx.fillStyle = colors.text[0];
	let rad = plus_radius/4;
	ctx.beginPath();
	ctx.arc(x - rad*3, y, rad, 0, TAU);
	ctx.fill();
	ctx.beginPath();
	ctx.arc(x, y, rad, 0, TAU);
	ctx.fill();
	ctx.beginPath();
	ctx.arc(x + rad*3, y, rad, 0, TAU);
	ctx.fill();
};

const drawToggle = (x, y, button) => {
	const item = button.parent;
	ctx.fillStyle = colors.text[0];
	ctx.beginPath();
	if (item.open) {
		ctx.moveTo(x, y + 5);
		ctx.lineTo(x - 5, y - 5);
		ctx.lineTo(x + 5, y - 5);
	} else {
		ctx.moveTo(x - 5, y);
		ctx.lineTo(x + 5, y - 5);
		ctx.lineTo(x + 5, y + 5);
	}
	ctx.closePath();
	ctx.fill();
};

// <end>
// --------------------------------------------------

// --------------------------------------------------
// <start> fname: js/selection.js

let selected = null;
const selectionChangeHandlers = [];
const onSelectionChange = handler => {
	selectionChangeHandlers.push(handler);
};

const handleSelectionChange = () => {
	selectionChangeHandlers.forEach(handler => handler());
};

const select = (object) => {
	if (selected === object) return;
	if (selected) unselect();
	selected = object;
	const {type} = project.find(object.id);
	if (type === 'axis_instance') {
		const item = leftbar.find('#' + object.id);
		item.highlighted = true;
	}
	handleSelectionChange();
};

const unselect = () => {
	if (selected) {
		const res = project.find(selected.id);
		if (res) {
			const {type} = res;
			if (type === 'axis_instance') {
				const item = leftbar.find('#' + selected.id);
				if (item) item.highlighted = false;
			}
		}
	}
	selected = null;
	handleSelectionChange();
};

// <end>
// --------------------------------------------------

// --------------------------------------------------
// <start> fname: js/horizontal.js



// <end>
// --------------------------------------------------

// --------------------------------------------------
// <start> fname: js/renders.js

const editorTransform = [1, 0, 0, 1, 0, 0];
const setEditorTransform = (a, b, c, d, e, f) => {
	editorTransform[0] = a;
	editorTransform[1] = b;
	editorTransform[2] = c;
	editorTransform[3] = d;
	editorTransform[4] = e;
	editorTransform[5] = f;
};

const applyEditorTransform = (x, y) => {
	const [a, b, c, d, e, f] = editorTransform;
	const rx = x*a + y*c + e;
	const ry = x*b + y*d + f;
	return [rx, ry];
};

const reverseEditorTransform = (rx, ry) => {
	const [a, b, c, d, e, f] = editorTransform;
	if (b) {
		const t = a/b;
		y = (rx - e - (ry - f)*t)/(c - d*t);
		x = (ry - f - y*d)/b;
		return [x, y];
	}
	if (d) {
		const t = c/d;
		x = (rx - e - (ry - f)*t)/(a - b*t);
		y = (ry - x*b - f)/d;
		return [rx, ry];
	}
};

const clearCanvas = () => {
	ctx.clearRect(0, 0, screen_sx, screen_sy);
};

const renderEditor = () => {
	if (mode3d) {
		setTimeout(() => {
			if (selected) {
				Ctrl3D.highlight(project.find(selected.id, true).index);
			} else {
				Ctrl3D.highlight(-1);
			}
		}, 0)
		Ctrl3D.start();
		if (!cylinders_updated) {
			mapCylinders();
		}
	} else {
		Ctrl3D.stop();
		ctx.setTransform(...editorTransform);
		renderCylinders();
		renderNodes();
		renderRuler();
		ctx.setTransform(1, 0, 0, 1, 0, 0);
	}
};

const render = () => {
	if (updateMeasures()) {
		canvas.width = screen_sx;
		canvas.height = screen_sy;
		Ctrl3D.resize(editor_true_sx, editor_true_sy);
	}
	if (!cylinders_updated || !nodes_updated) {
		storeProjectLocal();
	}
	clearCanvas();
	renderEditor();
	renderLeftbar();
	renderInfo();
	renderTools();
};

const renderLeftbarItems = () => {
	const array = leftbar.items;
	let y = item_spacing;
	array.forEach(item => {
		y += item.render(item_spacing, y) + item_spacing;
	});
};

const renderLeftbar = () => {
	ctx.fillStyle = colors.leftbar;
	ctx.fillRect(0, 0, leftbar_sx, screen_sy);
	leftbar.rendered_buttons.length = 0;
	leftbar.rendered_items.length = 0;
	renderLeftbarItems();
};

const renderInfo = () => {
	let info_margin_x = 15;
	let info_margin_y = 10;
	ctx.textAlign = 'right';
	ctx.font = info_font + 'px monospace';
	ctx.fillStyle = colors.text[2];
	ctx.textBaseline = 'bottom';
	ctx.fillText('F1: teclas de atalho', screen_sx - info_margin_x, screen_sy - info_margin_y);
	if (!selected) return;
	const {type} = project.find(selected.id);
	if (type === 'node') {
		let x = leftbar_sx + info_margin_x;
		let y = screen_sy - info_margin_y;
		ctx.textAlign = 'left';
		ctx.textBaseline = 'bottom';
		const array = getNodeContent(selected);
		for (let i=array.length; i--;) {
			const {object, type} = project.find(array[i].id);
			let text = type;
			const srcType = type.replace('_instance', '');
			const src = project.find(object[srcType + '_id']).object;
			text = toLabel[srcType][0] + ': ' + src.name;
			ctx.fillText(text, x, y);
			y -= info_font*2;
		}
	}
};

const renderCylinders = () => {

	ctx.fillStyle = colors.background;
	ctx.fillRect(leftbar_sx, 0, editor_sx, editor_sy);

	if (!cylinders_updated) {
		mapCylinders();
	}

	let {total_w, total_h} = sumCylinders();
	let ratio = total_w/total_h;
	space_sx = Math.min(inner_sx, inner_sy*ratio);
	space_sy = space_sx/ratio;
	space_x = start_x + (inner_sx - space_sx)/2;
	space_y = start_y + (inner_sy - space_sy)/2;
	cylinder_scale_x = space_sx/total_w;
	cylinder_scale_y = space_sy/total_h;

	let y = space_y;
	ctx.lineWidth = 1;
	ctx.strokeStyle = colors.outline;

	cylinders.forEach(cylinder => {
		const sx = cylinder.w*cylinder_scale_x;
		const sy = cylinder.h*cylinder_scale_y;
		const x = editor_cx - sx/2;
		const isx = cylinder.i*cylinder_scale_y;
		const y1 = y + sy;
		const ix0 = x + (sx - isx)/2;
		const ix1 = x + sx - (sx - isx)/2;
		if (cylinder.ref === selected) {
			ctx.fillStyle = colors.selected_cylinder;
		} else {
			ctx.fillStyle = colors.cylinder;
		}

		ctx.beginPath();
		ctx.rect(x, y, sx, sy);
		ctx.fill();
		ctx.stroke();

		ctx.beginPath();
		ctx.setLineDash([2, 2]);
		ctx.moveTo(ix0, y);
		ctx.lineTo(ix0, y1);
		ctx.moveTo(ix1, y);
		ctx.lineTo(ix1, y1);
		ctx.stroke();
		ctx.setLineDash([]);

		cylinder.x = x;
		cylinder.y = y;
		cylinder.sx = sx;
		cylinder.sy = sy;
		y += sy;
	});

};

const drawMG = (x, y) => {
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	ctx.strokeStyle = colors.mg;
	ctx.lineWidth = mg_width;
	ctx.beginPath();
	ctx.moveTo(x, y);
	ctx.lineTo(x + mg_delta, y);
	x += mg_delta*0.5;
	let dy = 0.5;
	for (let i=0; i<mg_n; ++i) {
		x += mg_delta;
		dy = -dy;
		ctx.lineTo(x, y + dy*mg_delta);
	}
	ctx.lineTo(x + mg_delta*0.5, y);
	ctx.lineTo(x + mg_delta*1.5, y);
	ctx.stroke();
};

const drawME = (x, y) => {
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	ctx.strokeStyle = colors.me;
	ctx.lineWidth = mg_width;
	ctx.beginPath();
	ctx.moveTo(x, y);
	ctx.lineTo(x + mg_delta*mg_n, y);
	ctx.moveTo(x, y - mg_delta/2);
	ctx.lineTo(x, y + mg_delta/2);
	ctx.stroke();
};

const renderNodes = () => {

	if (!nodes_updated) {
		buildNodes();
	}

	ctx.font = item_font + 'px monospace';
	if (!Ctrl3D.isVertical()) {
		ctx.textAlign = 'center';
		ctx.textBaseline = 'top';
	} else {
		ctx.textAlign = 'right';
		ctx.textBaseline = 'middle';
	}
	const renderNumber = (x, y, node) => {
		ctx.save();
		ctx.fillStyle = colors.fixed_node_outline;
		ctx.translate(x - item_font, y);
		if (!Ctrl3D.isVertical()) {
			ctx.rotate(PI/2);
		}
		ctx.fillText(nodeToIndex[node.id], 0, 0);
		ctx.restore();
	};

	const hasDisk = {};
	const hasMg = {};
	const hasMe = {};
	project.database.disk_instance.forEach(({node_id}) => {
		hasDisk[node_id] = true;
	});
	project.database.mg_instance.forEach(({node_id}) => {
		hasMg[node_id] = true;
	});
	project.database.me_instance.forEach(({node_id}) => {
		hasMe[node_id] = true;
	});
	
	fixedNodes.forEach(node => {

		if (node.ref === selected) {
			ctx.fillStyle = colors.selected_fixed_node;
		} else {
			ctx.fillStyle = colors.fixed_node;
		}

		updateNodeCoord(node);
		const {x, y, ex} = node;

		if (node.ref === selected) {
			ctx.strokeStyle = colors.selected_fixed_node_outline;
		} else {
			ctx.strokeStyle = colors.fixed_node_outline;
		}
		ctx.beginPath();
		ctx.arc(x, y, node_radius, 0, TAU);
		ctx.fill();
		ctx.stroke();
		
		if (node.ref === selected) {
			ctx.strokeStyle = colors.selected_fixed_node_line;
		} else {
			ctx.strokeStyle = colors.fixed_node_line;
		}
		ctx.beginPath();
		ctx.moveTo(x + node_radius + node_line_cut, y);
		ctx.lineTo(ex - node_line_cut, y);
		ctx.stroke();

		if (hasMe[node.ref.id]) {
			drawME(editor_cx + editor_cx - ex, y);
			ctx.lineWidth = 1;
		}
		if (hasMg[node.ref.id]) {
			drawMG(editor_cx + editor_cx - ex, y);
			ctx.lineWidth = 1;
		}
		if (hasDisk[node.ref.id]) {
			const dash1 = node_radius;
			const dash0 = node_radius*2;
			ctx.lineCap = 'round';
			ctx.lineWidth = node_radius;
			ctx.strokeStyle = colors.outline;
			const x0 = ex;
			const x1 = editor_cx*2 - ex;
			ctx.setLineDash([dash1, dash0]);
			ctx.beginPath();
			ctx.moveTo(x0 - node_radius/2, y);
			ctx.lineTo(x1 + node_radius/2, y);
			ctx.stroke();
			ctx.setLineDash([]);
			ctx.lineWidth = 1;
		}

		renderNumber(x, y, node.ref);

	});

	freeNodes.forEach(node => {

		if (node.ref === selected) {
			ctx.fillStyle = colors.selected_free_node;
		} else {
			ctx.fillStyle = colors.free_node;
		}
		updateNodeCoord(node);
		const {x, y, ex} = node;

		if (node.ref === selected) {
			ctx.strokeStyle = colors.selected_free_node_outline;
		} else {
			ctx.strokeStyle = colors.free_node_outline;
		}
		ctx.beginPath();
		ctx.arc(x, y, node_radius, 0, TAU);
		ctx.fill();
		ctx.stroke();
		
		if (node.ref === selected) {
			ctx.strokeStyle = colors.selected_free_node_line;
		} else {
			ctx.strokeStyle = colors.free_node_line;
		}
		ctx.beginPath();
		ctx.moveTo(x + node_radius + node_line_cut, y);
		ctx.lineTo(ex - node_line_cut, y);
		ctx.stroke();

		if (hasMe[node.ref.id]) {
			drawME(editor_cx + editor_cx - ex, y);
			ctx.lineWidth = 1;
		}
		if (hasMg[node.ref.id]) {
			drawMG(editor_cx + editor_cx - ex, y);
			ctx.lineWidth = 1;
		}
		if (hasDisk[node.ref.id]) {
			ctx.lineCap = 'round';
			ctx.lineWidth = node_radius;
			ctx.strokeStyle = colors.outline;
			ctx.setLineDash([node_radius, node_radius*2]);
			ctx.beginPath();
			ctx.moveTo(ex - node_radius/2, y);
			ctx.lineTo(editor_cx*2 - ex + node_radius/2, y);
			ctx.stroke();
			ctx.setLineDash([]);
			ctx.lineWidth = 1;
		}

		renderNumber(x, y, node.ref);
	
	});

};

const renderRuler = () => {
	let t = 0;
	let arr = [];
	project.database.axis_instance.forEach(obj => {
		arr.push(obj.length);
		t += obj.length;
	});
	ctx.lineWidth = 1;
	ctx.strokeStyle = colors.ruler;
	const mx = (editor_sx - inner_sx)/2;
	let delta_x = (editor_sx - inner_sx)/16;
	let cx = editor_cx + inner_sx/2 + mx/2;
	let y0 = space_y;
	let y1 = editor_sy - y0;
	ctx.beginPath();
	ctx.moveTo(cx, y0);
	ctx.lineTo(cx, y1);
	ctx.stroke();
	if (Ctrl3D.isVertical()) {
		ctx.textAlign = 'right';
		ctx.textBaseline = 'middle';
	} else {
		ctx.textAlign = 'center';
		ctx.textBaseline = 'top';
	}
	ctx.font = item_font + 'px monospace';
	ctx.fillStyle = colors.ruler;
	let drawn = [];
	const draw = (value, p) => {
		if (drawn[value]) return;
		drawn[value] = true;
		const y = y0 + value/t*(y1 - y0);
		const delta = delta_x*p;
		const x0 = cx - delta;
		const x1 = cx + delta;
		ctx.beginPath();
		ctx.moveTo(x0, y);
		ctx.lineTo(x1, y);
		ctx.stroke();
		ctx.save();
		ctx.translate(x0 - item_font, y);
		if (!Ctrl3D.isVertical()) {
			ctx.rotate(Math.PI*0.5);
		}
		ctx.fillText(value + 'm', 0, 0);
		ctx.restore();
	};
	draw(0, 1);
	draw(t, 1);
	let type;
	if (selected) {
		type = project.find(selected.id).type;
	}
	if (type === 'axis_instance') {
		cylinders.forEach(cylinder => {
			if (cylinder.ref === selected) {
				draw(cylinder.pos, 0.5);
				draw(cylinder.pos + cylinder.h, 0.5);
			}
		});
	} else if (type === 'node') {
		const {position, axis_instance_id} = selected;
		if (position != null) {
			draw(position, 0.5);
		} else if (axis_instance_id) {
			const {object} = project.find(axis_instance_id);
			cylinders.forEach(cylinder => {
				if (cylinder.ref === object) {
					draw(cylinder.pos, 0.5);
				}
			});
		}
	}
};

// <end>
// --------------------------------------------------

// --------------------------------------------------
// <start> fname: js/native-events.js

const buttonHandlers = {};
const bindButton = (name, handler) => {
	buttonHandlers[name] = handler;
};

const keyHandlers = {};
const bindKey = ({key, ctrl, shift, alt}, handler) => {
	key = key.toString();
	ctrl  = ctrl?  1: 0;
	shift = shift? 1: 0;
	alt   = alt?   1: 0;
	keyHandlers[key + ctrl + shift + alt] = handler;
};

const handleToggle3D = () => {
	mode3d = !mode3d;
	if (mode3d) {
		Ctrl3D.resetView();
	}
	cylindersChanged();
	mapCylinders();
	updateTools();
	render();
	return true;
};

const handleLclick = (x, y) => {
	if (checkTools(x, y)) return;
	if (x < leftbar_sx) {
		const button = leftbar.getButtonAt(x, y);
		if (button) {
			const {name} = button;
			const handler = buttonHandlers[name];
			if (handler) {
				handler(button);
			}
			return;
		}
		const item = leftbar.getItemAt(x, y);
		if (item) {
			const id = parseInt(item.name.substr(1));
			const res = project.find(id);
			if (res) {
				const {object, type} = res;
				if (type === 'axis_instance') {
					select(object);
					render();
					return;
				}
			}
		}
		return;
	}
	[x, y] = reverseEditorTransform(x, y);
	if (mode3d) return;
	const instance = getInstanceAtXY(x, y);
	if (instance) {
		instanceClick(instance);
		render();
		return;
	}
	const node = getNodeAt(x, y);
	if (node) {
		nodeClick(node);
		render();
		return;
	}
	unselect();
	render();
};

window.addEventListener('load', () => onload());

// <end>
// --------------------------------------------------

// --------------------------------------------------
// <start> fname: js/script.js

const toLabel = {
	'axis': ['Eixo', 'Eixos'],
	'disk': ['Disco', 'Discos'],
	'mg': ['Mancal Guia', 'Mancais guia'],
	'me': ['Mancal Escora', 'Mancais escora'],
};

let lastVertical = null;
const updateMeasures = () => {
	const {innerWidth, innerHeight} = window;
	let vertical = Ctrl3D.isVertical();
	if (screen_sx === innerWidth && screen_sy === innerHeight && vertical === lastVertical) {
		return false;
	}
	lastVertical = vertical;
	screen_sx = innerWidth;
	screen_sy = innerHeight;
	editor_true_sx = screen_sx - leftbar_sx;
	editor_true_sy = screen_sy;
	if (vertical) {
		setEditorTransform(1, 0, 0, 1, 0, 0);
		editor_sx = editor_true_sx;
		editor_sy = editor_true_sy;
	} else {
		setEditorTransform(0, -1, 1, 0, leftbar_sx, screen_sy + leftbar_sx);
		editor_sx = editor_true_sy;
		editor_sy = editor_true_sx;
	}
	editor_cx = leftbar_sx + editor_sx/2;
	const m = 120;
	inner_sx = editor_sx - m*2;
	inner_sy = editor_sy - m*2;
	start_x = leftbar_sx + (editor_sx - inner_sx)/2;
	start_y = (editor_sy - inner_sy)/2;
	end_x = start_x + inner_sx;
	end_y = start_y + inner_sy;
	toolButton_x = screen_sx - toolButton_y0;
	return true;
};

const handleResize = () => {
	if (updateMeasures()) {
		canvas.width = screen_sx;
		canvas.height = screen_sy;
		Ctrl3D.resize(editor_sx, editor_sy);
		render();
	}
};

const project = new Project();

const readUserData = (formTitle, fields) => new Promise((done) => {
	const data = {};
	if (fields[0] instanceof Array) {
		let res = null;
		const n = fields.length;
		const next = (i) => {
			if (i === n) return done(res);
			const title = formTitle + ` [${i+1}/${n}]`;
			openInputForm(title, fields[i], data => {
				if (data) {
					if (res) {
						res = {...res, ...data};
					} else {
						res = data;
					}
					next(i+1);
				} else {
					done(null);
				}
			}, done);
		};
		next(0);
	} else {
		openInputForm(formTitle, fields, done, () => done(null));
	}
});

// <end>
// --------------------------------------------------

// --------------------------------------------------
// <start> fname: js/events.js

bindButton('add', button => {
	const {name} = button;
	const item = button.parent;
	insert[item.name]();
});

bindButton('toggle', button => {
	const {parent} = button;
	parent.open = !parent.open;
	render();
});

bindButton('addToModel', button => {
	const {parent} = button;
	const {name} = parent;
	const id = parseInt(name.substr(1));
	const {object, type} = project.find(id);
	insert[type + '_instance'](object);
});

bindButton('remove', button => {
	const {parent} = button;
	const {name} = parent;
	const id = parseInt(name.substr(1));
	const res = project.find(id);
	if (!res) return;
	const {object, type} = res;
	if (!confirm('Deseja remover este ' + toLabel[type][0].toLowerCase() + '?')) {
		return;
	}
	parent.remove();
	remove(object);
	render();
});

bindButton('edit', button => {
	const {parent} = button;
	const {name} = parent;
	const id = parseInt(name.substr(1));
	const {object, type} = project.find(id);
	const handler = editForm[type];
	if (handler) {
		handler(object);
	}
});

let instanceClick = axis_instance => {
	select(axis_instance);
};
let nodeClick = node => {
	select(node);
};

const callEdit = () => {
	if (!selected) {
		return;
	}
	const {type} = project.find(selected.id);
	const handler = editForm[type];
	if (handler) {
		handler(selected);
	}
};

bindKey({ key: 'e' }, callEdit);

bindKey({ key: 't' }, popupMatrix);

bindKey({ key: 'h' }, () => {
	if (Ctrl3D.isVertical()) {
		Ctrl3D.toggleOrientation();
	}
});

bindKey({ key: 'v' }, () => {
	if (!Ctrl3D.isVertical()) {
		Ctrl3D.toggleOrientation();
	}
});

const callSelectPrev = () => {
	if (!selected) {
		return false;
	}
	const {type, index} = project.find(selected.id, true);
	if (type === 'axis_instance') {
		if (index > 0) {
			select(project.database.axis_instance[index - 1]);
			return true;
		}
	} else if (type === 'node') {
		let index;
		for (let i=mappedNodes.length; i--;) {
			if (mappedNodes[i].node === selected) {
				index = i;
				break;
			}
		}
		if (index > 0) {
			select(mappedNodes[index - 1].node);
			return true;
		}
	}
	return false;
};

const callSelectNext = () => {
	if (!selected) {
		return false;
	}
	const {type, index} = project.find(selected.id, true);
	if (type === 'axis_instance') {
		const max = project.database.axis_instance.length;
		if (index < max - 1) {
			select(project.database.axis_instance[index + 1]);
			return true;
		}
	} else if (type === 'node') {
		let index = -1;
		for (let i=mappedNodes.length; i--;) {
			if (mappedNodes[i].node === selected) {
				index = i;
				break;
			}
		}
		const max = mappedNodes.length - 1;
		if (index < max) {
			select(mappedNodes[index + 1].node);
			return true;
		}
	}
	return false;
};

bindKey({ key: 'up' }, callSelectPrev);
bindKey({ key: 'left' }, callSelectPrev);
bindKey({ key: 'down' }, callSelectNext);
bindKey({ key: 'right' }, callSelectNext);

const callMoveUp = () => {
	if (!selected) {
		return;
	}
	const {type} = project.find(selected.id);
	if (type === 'axis_instance') {
		shiftInstance(selected, -1);
	}
};
bindKey({ key: 'up', ctrl: true }, callMoveUp);

bindKey({ key: 'down', ctrl: true }, () => {
	if (!selected) {
		return;
	}
	const {type} = project.find(selected.id);
	if (type === 'axis_instance') {
		shiftInstance(selected, 1);
	}
});

bindKey({ key: 'd' }, () => {
	if (!selected) {
		return;
	}
	const {type} = project.find(selected.id);
	if (type === 'axis_instance') {
		duplicateInstance(selected);
	}
});

bindKey({ key: '/' }, () => {
	if (!selected) {
		return;
	}
	const {type, index} = project.find(selected.id, true);
	if (type === 'axis_instance') {
		readUserData('Adicionar nós livres', [
			{name: 'n', title: 'Número de nós', type: 'number', 'default': 1}
		]).then(data => {
			if (!data) return;
			const {length} = selected;
			const start = getInstancePosition(selected);
			const {n} = data;
			const delta = length/(n + 1);
			for (let i=1; i<=n; ++i) {
				create.node({ position: start + delta*i });
			}
			render();
		})
	}
});

bindKey({ key: 'escape' }, () => {
	if (matrixShadow) {
		closeMatrix();
		return;
	}
	if (popupIsOpen()) {
		closePopup();
	} else {
		unselect();
	}
});

bindKey({ key: 'delete' }, () => {
	if (!selected) return;
	remove(selected);
});

for (let i=themes.length; i; --i) {
	bindKey({ ctrl: true, key: i }, () => {
		setTheme(i);
	});
}

bindKey({ key: 'f1' }, () => {
	openPopup();
});

bindKey({ key: 'delete', shift: true }, () => {
	if (confirm('Deseja mesmo limpar o projeto?')) {
		clearProject();
	}
});

// <end>
// --------------------------------------------------

// --------------------------------------------------
// <start> fname: js/storage.js

let backup_index = -1;
const backup = [];
const max_backup = 15;

const checkBackup = () => {
	let json = JSON.stringify(project);
	if (backup_index === -1) {
		backup[0] = json;
		backup_index = 0;
		return;
	}
	if (json !== backup[backup_index]) {
		localStorage.setItem('project', json);
		backup[++backup_index] = json;
		if (backup.length > max_backup) {
			backup.splice(0, 1);
			-- backup_index;
		}
	}
};
setInterval(checkBackup, 1000);

const undo = () => {
	checkBackup();
	if (backup_index > 0) {
		loadProjectJSON(backup[--backup_index]);
	}
};

const storeProjectLocal = () => {
	if (!window.localStorage) return;
	localStorage.setItem('project', JSON.stringify(project));
};

const order = ['axis', 'disk', 'mg', 'me', 'axis_instance', 'node', 'disk_instance', 'mg_instance', 'me_instance'];

const loadProjectJSON = json => {
	clearProject();
	const obj = JSON.parse(json);
	const {database} = obj;
	order.forEach(type => {
		const array = database[type];
		if (array) {
			array.forEach(object => create[type](object));
		}
		if (type === 'axis_instance') {
			project.database.node.length = 0;
		}
	});
	cylindersChanged();
};

const loadProjectLocal = () => {
	if (!window.localStorage) return;
	const json = localStorage.getItem('project');
	if (!json) return;
	loadProjectJSON(json);
};

const loadThemeLocal = () => {
	if (!window.localStorage) return;
	const json = localStorage.getItem('theme_index');
	if (!json) return;
	setTheme(JSON.parse(json) + 1);
};

const storeThemeLocal = () => {
	if (!window.localStorage) return;
	localStorage.setItem('theme_index', theme_index);
};

const loadLocal = () => {
	loadThemeLocal();
	loadProjectLocal();
};

window.addEventListener('beforeunload', () => {
	storeProjectLocal();
	storeThemeLocal();
});

// <end>
// --------------------------------------------------

// --------------------------------------------------
// <start> fname: js/build-objects.js

const requiredFields = {
	axis: [
		{name: 'name', title: 'Nome', type: 'string'},
		{name: 'description', title: 'Descrição', type: 'string'},
		{name: 'outer_diameter', title: 'Diâmetro externo (m)', type: 'number'},
		{name: 'inner_diameter', title: 'Diâmetro interno (m)', type: 'number'},
		{name: 'density', title: 'Densidade (kg/m3)', type: 'number'},
		{name: 'mod_e', title: 'Módulo E (MPa)', type: 'number'},
		{name: 'mod_g', title: 'Módulo G (MPa)', type: 'number'},
	],
	axis_instance: [
		{name: 'length', title: 'Comprimento (m)', type: 'number'},
	],
	disk: [
		{name: 'name', title: 'Nome', type: 'string'},
		{name: 'description', title: 'Descrição', type: 'string'},
		{name: 'diameter', title: 'Diâmetro (m)', type: 'number'},
		{name: 'polar_inertia', title: 'Inércia polar (kg·m²)', type: 'number'},
		{name: 'diametrical_inertia', title: 'Inércia diametral (kg·m²)', type: 'number'},
		{name: 'mass', title: 'Massa (kg)', type: 'number'},
	],
	mg: [
		[
			{name: 'name', title: 'Nome', type: 'string'},
			{name: 'description', title: 'Descrição', type: 'string'},
			{name: 'kxx', title: 'Kxx', type: 'number'},
			{name: 'kxy', title: 'Kxy', type: 'number'},
			{name: 'kyy', title: 'Kyy', type: 'number'},
			{name: 'kyx', title: 'Kyx', type: 'number'},
		],
		[
			{name: 'cxx', title: 'Cxx', type: 'number'},
			{name: 'cxy', title: 'Cxy', type: 'number'},
			{name: 'cyy', title: 'Cyy', type: 'number'},
			{name: 'cyx', title: 'Cyx', type: 'number'},
		],
		[
			{name: 'mass_x', title: 'Massa X', type: 'number'},
			{name: 'mass_y', title: 'Massa Y', type: 'number'},
			{name: 'k0', title: 'K0', type: 'number'},
			{name: 'c0', title: 'C0', type: 'number'},
			{name: 'i0', title: 'I0', type: 'number'},
		]
	],
	me: [
		[
			{name: 'name', title: 'Nome', type: 'string'},
			{name: 'description', title: 'Descrição', type: 'string'},
			{name: 'k0x', title: 'K0x', type: 'number'},
			{name: 'k0y', title: 'K0y', type: 'number'},
			{name: 'c0x', title: 'C0x', type: 'number'},
			{name: 'c0y', title: 'C0y', type: 'number'},
		],
		[
			{name: 'iy', title: 'Iy', type: 'number'},
			{name: 'ix', title: 'Ix', type: 'number'},
			{name: 'k0', title: 'K0', type: 'number'},
			{name: 'c0', title: 'C0', type: 'number'},
			{name: 'i0', title: 'I0', type: 'number'},
		]
	]
};

const newElementItem = (title, name) => {
	const item = new LBItem(title, name);
	item.addButton(new Button('edit', drawEdit));
	item.addButton(new Button('remove', drawDelete));
	item.addButton(new Button('addToModel', drawAdd));
	return item;
};

const updateListOrder = () => {
	const idToItem = {};
	const list = leftbar.find('item-list');
	let array = list.children;
	for (let i=array.length; i--;) {
		const item = array[i];
		const id = parseInt(item.name.substr(1));
		idToItem[id] = item;
	}
	array.length = 0;
	array = project.database.axis_instance;
	for (let i=0; i<array.length; ++i) {
		const instance = array[i];
		list.append(idToItem[instance.id]);
		updateItemListTitle(list.children[i], i);
	}
};

const updateItemListTitle = (item, index) => {
	const {name} = item;
	const id = parseInt(name.substr(1));
	let object;
	if (index != null) {
		object = project.find(id).object;
	} else {
		const res = project.find(id, true);
		object = res.object;
		index = res.index;
	}
	const axis_name = project.find(object.axis_id).object.name;
	item.title = (index + 1) + '. ' + axis_name + ' (' + object.length + ')';
};

const updateListTitles = () => {
	const list = leftbar.find('item-list');
	const array = list.children;
	for (let i=0; i<array.length; ++i) {
		const item = array[i];
		updateItemListTitle(item, i);
	}
};

const shiftInstance = (instance, inc) => {
	if (Math.abs(inc) !== 1) {
		throw 'Invalid increment';
	}
	const {index} = project.find(instance.id, true);
	const newIndex = index + inc;
	const array = project.database.axis_instance;
	if (newIndex < 0 || newIndex >= array.length) {
		return;
	}
	let i1, i2;
	if (inc < 0) {
		i1 = array[newIndex];
		i2 = array[index];
	} else {
		i1 = array[index];
		i2 = array[newIndex];
	}
	const l1 = i1.length;
	const l2 = i2.length;
	const a = getInstancePosition(i1);
	const b = a + l1;
	const c = b + l2;
	const array1 = getFreeNodesBetween(a, b);
	const array2 = getFreeNodesBetween(b, c);
	array1.forEach(node => {
		node.position += l2;
	});
	array2.forEach(node => {
		node.position -= l1;
	});
	const aux = array[index];
	array[index] = array[newIndex];
	array[newIndex] = aux;
	cylindersChanged();
	updateListOrder();
};

const duplicateInstance = (instance) => {
	const {total_h} = sumCylinders();
	const position = getInstancePosition(instance);
	getFreeNodesBetween(position + instance.length, total_h).forEach(node => {
		node.position += instance.length;
	});
	const {index} = project.find(instance.id, true);
	const newInstance = create.axis_instance({...instance, id: null});
	const array = project.database.axis_instance;
	array.splice(array.indexOf(newInstance), 1);
	array.splice(index + 1, 0, newInstance);
	select(newInstance);
	cylindersChanged();
	updateListOrder();
};

const addItemList = (instance) => {
	const axis = project.find(instance.axis_id).object;
	const item = new LBItem('', '#' + instance.id);
	updateItemListTitle(item);
	leftbar.find('item-list').append(item);
};

const handleChange = object => {
	const {type} = project.find(object.id);
	const item = leftbar.find('#' + object.id);
	item.title = object.name;
	updateListTitles();
};

onSelectionChange(() => {
	let node = null
	if (selected) {
		const {object, type} = project.find(selected.id);
		if (type === 'node') node = object;
	};
	disks = leftbar.find('disk').children;
	mgs = leftbar.find('mg').children;
	mes = leftbar.find('me').children;
	const turnOn = item => item.buttonMap.addToModel.visible = true;
	const turnOff = item => item.buttonMap.addToModel.visible = false;
	if (!node) {
		disks.forEach(turnOff);
		mgs.forEach(turnOff);
		mes.forEach(turnOff);
		return;
	}
	disks.forEach(project.getReference('disk_instance', node.id)? turnOff: turnOn);
	const hasMancal = project.getReference('mg_instance', node.id) || project.getReference('me_instance', node.id);
	mgs.forEach(hasMancal? turnOff: turnOn);
	mes.forEach(hasMancal? turnOff: turnOn);
});

const create = {
	axis: data => {
		let {id, name, description, inner_diameter, outer_diameter, density, mod_e, mod_g,
			prop} = data;
		if (prop) {
			inner_diameter = prop.inner_diameter;
			outer_diameter = prop.outer_diameter;
			density = prop.density;
			mod_e = prop.mod_e;
			mod_g = prop.mod_g;
		}
		let object = project.add('axis', {
			id, name, description,
			prop: {inner_diameter, outer_diameter, density, mod_e, mod_g}
		});
		leftbar.find('axis').append(newElementItem(name, '#' + object.id));
		handleSelectionChange();
		return object;
	},
	disk: data => {
		let {
			id, name, description, diameter, polar_inertia, diametrical_inertia, mass, prop
		} = data;
		if (prop) {
			diameter = prop.diameter;
			polar_inertia = prop.polar_inertia;
			diametrical_inertia = prop.diametrical_inertia;
			mass = prop.mass;
		}
		let object = project.add('disk', {
			id, name, description,
			prop: {diameter, polar_inertia, diametrical_inertia, mass}
		});
		const item = newElementItem(name, '#' + object.id);
		leftbar.find('disk').append(item);
		handleSelectionChange();
		return object;
	},
	mg: data => {
		let {
			id, name, description,
			kxx, kxy, kyy, kyx, cxx, cxy, cyy, cyx,
			mass_x, mass_y, k0, c0, i0, prop
		} = data;
		if (prop) {
			kxx = prop.kxx;
			kxy = prop.kxy;
			kyy = prop.kyy;
			kyx = prop.kyx;
			cxx = prop.cxx;
			cxy = prop.cxy;
			cyy = prop.cyy;
			cyx = prop.cyx;
			mass_x = prop.mass_x;
			mass_y = prop.mass_y;
			k0 = prop.k0;
			c0 = prop.c0;
			i0 = prop.i0;
		}
		let object = project.add('mg', {
			id, name, description,
			prop: {
				kxx, kxy, kyy, kyx, cxx, cxy, cyy, cyx,
				mass_x, mass_y, k0, c0, i0
			}
		});
		const item = newElementItem(name, '#' + object.id);
		leftbar.find('mg').append(item);
		handleSelectionChange();
		return object;
	},
	me: data => {
		let {
			id, name, description,
			k0x, k0y, c0x, c0y, iy, ix, k0, c0, i0,
			prop
		} = data;
		if (prop) {
			k0x = prop.k0x;
			k0y = prop.k0y;
			c0x = prop.c0x;
			c0y = prop.c0y;
			iy = prop.iy;
			ix = prop.ix;
			k0 = prop.k0;
			c0 = prop.c0;
			i0 = prop.i0;
			mass_x = prop.mass_x;
		}
		let object = project.add('me', {
			id, name, description,
			prop: {
				k0x, k0y, c0x, c0y, iy, ix, k0, c0, i0,
			}
		});
		const item = newElementItem(name, '#' + object.id);
		leftbar.find('me').append(item);
		handleSelectionChange();
		return object;
	},
	axis_instance: (data, axis_id) => {
		let {id, length} = data;
		if ('axis_id' in data) {
			axis_id = data.axis_id;
		}
		let object = project.add('axis_instance', {id, length, axis_id});
		create.node({axis_instance_id: object.id});
		if (project.database.axis_instance.length === 1) {
			create.node({});
		}
		addItemList(object);
		cylindersChanged();
		handleSelectionChange();
		return object;
	},
	node: data => {
		let {id, axis_instance_id, position} = data;
		if (!axis_instance_id) {
			axis_instance_id = null;
		}
		if (!position) {
			position = null;
		}
		object = project.add('node', {id, axis_instance_id, position});
		nodesChanged();
		return object;
	},
	disk_instance: ({disk_id, node_id}) => {
		let object = project.add('disk_instance', {disk_id, node_id});
		handleSelectionChange();
	},
	mg_instance: ({mg_id, node_id}) => {
		let object = project.add('mg_instance', {mg_id, node_id});
		handleSelectionChange();
	},
	me_instance: ({me_id, node_id}) => {
		let object = project.add('me_instance', {me_id, node_id});
		handleSelectionChange();
	}
};

const insert = {
	axis: () => {
		readUserData('Novo eixo', requiredFields.axis)
			.then(data => {
				if (!data) {
					return;
				}
				create.axis(data);
				render();
			})
			.catch(error => console.error(error));
	},
	disk: () => {
		readUserData('Novo disco', requiredFields.disk)
			.then(data => {
				if (!data) {
					return;
				}
				create.disk(data);
				render();
			})
			.catch(error => console.error(error));
	},
	mg: () => {
		readUserData('Novo mancal guia', requiredFields.mg)
			.then(data => {
				if (!data) {
					return;
				}
				create.mg(data);
				render();
			})
			.catch(error => console.error(error));
	},
	me: () => {
		readUserData('Novo mancal escora', requiredFields.me)
			.then(data => {
				if (!data) {
					return;
				}
				create.me(data);
				render();
			})
			.catch(error => console.error(error));
	},
	axis_instance: axis => {
		readUserData('Novo elemento de eixo', requiredFields.axis_instance)
			.then(data => {
				if (!data) {
					return;
				}
				create.axis_instance(data, axis.id);
				render();
			})
	},
	disk_instance: disk => {
		const node_id = selected.id;
		if (project.getReferences('disk_instance', node_id).length) {
			return;
		}
		create.disk_instance({disk_id: disk.id, node_id});
		render();
	},
	mg_instance: mg => {
		const node_id = selected.id;
		if (project.getReferences('mg_instance', node_id).length) {
			return;
		}
		create.mg_instance({mg_id: mg.id, node_id});
		render();
	},
	me_instance: me => {
		const node_id = selected.id;
		if (project.getReferences('me_instance', node_id).length) {
			return;
		}
		create.me_instance({me_id: me.id, node_id});
		render();
	},
};

const editForm = {
	axis: axis => {
		const fields = requiredFields.axis.slice();
		for (let i=fields.length; i--;) {
			const field = {...fields[i]};
			const {name} = field;
			let val = axis[name];
			if (val === undefined) val = axis.prop[name];
			field['default'] = val;
			fields[i] = field;
		}
		readUserData('Editar eixo', fields)
			.then(data => {
				if (!data) {
					return;
				}
				for (let attr in data) {
					if (attr in axis) {
						axis[attr] = data[attr];
					} else if (attr in axis.prop) {
						axis.prop[attr] = data[attr];
					}
				}
				handleChange(axis);
				cylindersChanged();
				render();
			})
			.catch(error => console.error(error));
	},
	disk: disk => {
		const fields = requiredFields.disk.slice();
		for (let i=fields.length; i--;) {
			const field = {...fields[i]};
			const {name} = field;
			let val = disk[name];
			if (val === undefined) val = disk.prop[name];
			field['default'] = val;
			fields[i] = field;
		}
		readUserData('Editar disco', fields)
			.then(data => {
				if (!data) {
					return;
				}
				for (let attr in data) {
					if (attr in disk) {
						disk[attr] = data[attr];
					} else if (attr in disk.prop) {
						disk.prop[attr] = data[attr];
					}
				}
				handleChange(disk);
				render();
			})
			.catch(error => console.error(error));
	},
	mg: mg => {
		const array = requiredFields.mg.slice();
		array.forEach((fields, i) => {
			array[i] = fields = fields.slice();
			for (let i=fields.length; i--;) {
				const field = {...fields[i]};
				const {name} = field;
				let val = mg[name];
				if (val === undefined) val = mg.prop[name];
				field['default'] = val;
				fields[i] = field;
			}
		});
		readUserData('Editar mancal guia', array)
			.then(data => {
				if (!data) {
					return;
				}
				for (let attr in data) {
					if (attr in mg) {
						mg[attr] = data[attr];
					} else if (attr in mg.prop) {
						mg.prop[attr] = data[attr];
					}
				}
				handleChange(mg);
				render();
			})
			.catch(error => console.error(error));
	},
	me: me => {
		const array = requiredFields.me.slice();
		array.forEach((fields, i) => {
			array[i] = fields = fields.slice();
			for (let i=fields.length; i--;) {
				const field = {...fields[i]};
				const {name} = field;
				let val = me[name];
				if (val === undefined) val = me.prop[name];
				field['default'] = val;
				fields[i] = field;
			}
		});
		readUserData('Editar mancal escora', array)
			.then(data => {
				if (!data) {
					return;
				}
				for (let attr in data) {
					if (attr in me) {
						me[attr] = data[attr];
					} else if (attr in me.prop) {
						me.prop[attr] = data[attr];
					}
				}
				handleChange(me);
				render();
			})
			.catch(error => console.error(error));
	},
	axis_instance: instance => {
		const fields = [
			{name: 'length', title: 'Comprimento', type: 'number', 'default': instance.length}
		];
		readUserData('Editar elemento eixo', fields)
			.then(data => {
				if (data) {
					const prevLen = instance.length;
					const nextLen = data.length;
					const dif = nextLen - prevLen;
					const a = getInstancePosition(instance);
					const b = a + prevLen;
					const max = sumCylinders().total_h;
					let array1 = getFreeNodesBetween(b, max);
					let array2 = getFreeNodesBetween(a, b);
					for (let i=array1.length; i--;) {
						array1[i].position += dif;
					}
					for (let i=array2.length; i--;) {
						array2[i].position = (array2[i].position - a)/prevLen*nextLen + a;
					}
					instance.length = data.length;
					handleChange(instance);
					cylindersChanged();
					render();
				}
			})
			.catch(error => console.error(error));
	},
	node: node => {
		const {position} = node;
		if (position == null) return;
		const fields = [
			{name: 'position', title: 'Posição', type: 'number', 'default': position}
		];
		readUserData('Editar elemento eixo', fields)
			.then(data => {
				if (data) {
					node.position = data.position;
					nodesChanged();
					render();
				}
			})
			.catch(error => console.error(error));
	}
};

const getNodeContent = node => {
	const res = [];
	const check = name => {
		const obj = project.getReference(name, node.id);
		if (obj) res.push(obj);
	};
	check('disk_instance');
	check('mg_instance');
	check('me_instance');
	return res;
};

const removeNodeContent = node => {
	const array = getNodeContent(node);
	array.forEach(remove);
	return array.length;
};

const remove = item => {
	const res = project.find(item.id);
	if (!res) return;
	const {type} = res;
	if (type === 'node' && removeNodeContent(item)) {
		handleSelectionChange();
		return;
	}
	if (type === 'node' && item.position == null) {
		return;
	}
	let select_next;
	if (type === 'axis_instance') {
		const {index} = project.find(item.id, true);
		const a = getInstancePosition(item);
		const b = a + item.length;
		let array = getFreeNodesBetween(a, b);
		for (let i=0; i<array.length; ++i) {
			remove(array[i]);
		}
		array = getFreeNodesBetween(b, sumCylinders().total_h);
		for (let i=0; i<array.length; ++i) {
			array[i].position -= item.length;
		}
		const node = project.nodeOf(item);
		removeNodeContent(node);
		project.remove(node);
		if (project.database.node.length === 1) {
			const lastNode = project.database.node[0];
			removeNodeContent(lastNode);
			project.remove(lastNode);
		}
		leftbar.find('#' + item.id).remove();
		if (item === selected) {
			array = project.database.axis_instance;
			if (index + 1 < array.length) {
				select_next = array[index + 1];
			} else if (index - 1 >= 0) {
				select_next = array[index - 1];
			}
		}
	}
	if (type === 'axis') {
		const array = project.database.axis_instance;
		for (let i=array.length; i--;) {
			const instance = array[i];
			if (instance.axis_id === item.id) {
				remove(instance);
			}
		}
	}
	if (type === 'disk' || type === 'mg' || type === 'me') {
		const array = project.getReferences(type + '_instance', item.id);
		array.forEach(remove);
	}
	if (type === 'node') {
		removeNodeContent(item);
	}
	project.remove(item);
	if (item === selected) {
		unselect();
	}
	if (select_next) {
		select(select_next);
	}
	cylindersChanged();
};

const clearProject = () => {
	project.clear();
	leftbar.items.forEach(item => {
		const children = item.children;
		for (let i=children.length; i--;) {
			children[i].remove();
		}
	});
	cylindersChanged();
};

// <end>
// --------------------------------------------------

// --------------------------------------------------
// <start> fname: js/onload.js

const onload = () => {

	canvas = document.querySelector('canvas');
	ctx = canvas.getContext('2d');
	
	leftbar.init();
	
	window.addEventListener('resize', render);

	window.addEventListener('keydown', e => {
		let key = (e.key||'').toLowerCase().replace('arrow', '');
		let ctrl  = e.ctrlKey?  1: 0;
		let shift = e.shiftKey? 1: 0;
		let alt   = e.altKey?   1: 0;
		let handler = keyHandlers[key + ctrl + shift + alt];
		if (anInputFormIsOpen) {
			return;
		}
		if (handler) {
			e.preventDefault();
			handler();
			render();
		}
	});
	
	canvas.addEventListener('click', e => {
		const {offsetX, offsetY, button} = e;
		if (button === 0) {
			handleLclick(offsetX, offsetY);
		}
	});
	
	canvas.addEventListener('mousedown', e => {
		const {offsetX, offsetY, button} = e;
		if (mode3d) {
			Ctrl3D.handleMousedown(offsetX, offsetY, e.button);
		}
	});

	canvas.addEventListener('mousemove', e => {
		if (mode3d) {
			const {offsetX, offsetY, buttons, shiftKey} = e;
			Ctrl3D.handleMousemove(offsetX, offsetY, buttons, shiftKey);
		}
	});

	canvas.addEventListener('wheel', e => {
		if (mode3d) {
			Ctrl3D.handleWheel(e.deltaY);
		}
	});

	const canvas3d = Ctrl3D.getCanvas();
	document.body.appendChild(canvas3d);

	loadLocal();
	handleSelectionChange();
	render();

};

// <end>
// --------------------------------------------------

// --------------------------------------------------
// <start> fname: js/info.js

let popupShadow;
const popupIsOpen = () => {
	return !!popupShadow;
};
const openPopup = () => {
	if (popupShadow) {
		return closePopup();
	}
	const lines = [
		'E: Edita o elemento selecionado',
		'D: Duplica o eixo selecionado',
		'/: Adiciona nós intermediários livres no eixo selecionado',
		'H: Alterna para o modo horizontal',
		'V: Alterna para o modo vertical',
		'Ctrl + ⇧/⇩: Desloca o eixo selecionado',
		'Delete: Remove o elemento selecionado',
		'Shift + Delete: Limpa o projeto',
		'Esc: Fecha esta janela',
	];
	const shadow = $.new('div').css({
		position: 'absolute',
		top: '0px',
		left: '0px',
		right: '0px',
		bottom: '0px',
		'z-index': '2',
		'background-color': 'rgba(8, 8, 8, 0.75)',
	});
	$('body').append(shadow);
	const center = div => {
		const total_sx = div.parent().sx();
		const total_sy = div.parent().sy();
		const sx = div.sx();
		const sy = div.sy();
		div.css({
			'margin-left': Math.floor((total_sx - sx)*0.5) + 'px',
			'margin-top': Math.floor((total_sy - sy)*0.4) + 'px',
		});
	};
	const wrapper = $.new('div').css({
		'background-color': '#fff',
		'display': 'inline-block',
	});
	shadow.append(wrapper);
	const inner = $.new('div').css({
		'padding': '20px 30px 20px 25px',
		'line-height': '26px',
		'font-size': '16px',
		'font-family': 'monospace',
		// 'font-weight': 'bold'
	});
	wrapper.append(inner);
	lines.forEach(line => {
		inner.append($.new('div').append($.txt(line)));
	});
	center(wrapper);
	popupShadow = shadow;
};
const closePopup = () => {
	if (popupShadow) {
		popupShadow.remove();
		popupShadow = null;
	}
};

// <end>
// --------------------------------------------------

// --------------------------------------------------
// <start> fname: js/tmath.js

{
	const mulMatMat = (m1, m2, dst) => {
		const aux = new Array(16);
		for (let i=0; i<4; ++i) {
			for (let j=0; j<4; ++j) {
				let sum = 0;
				for (let k=0; k<4; ++k) {
					sum += m1[i*4 + k]*m2[k*4 + j];
				}
				aux[i*4 + j] = sum;
			}
		}
		for (let i=0; i<16; i++) dst[i] = aux[i];
	};

	const mRotationX = (ang, m) => {
		const cos = Math.cos(ang);
		const sin = Math.sin(ang);
		m[0x0] = 1;
		m[0x1] = 0;
		m[0x2] = 0;
		m[0x3] = 0;
		m[0x4] = 0;
		m[0x5] = cos;
		m[0x6] = -sin;
		m[0x7] = 0;
		m[0x8] = 0;
		m[0x9] = sin;
		m[0xa] = cos;
		m[0xb] = 0;
		m[0xc] = 0;
		m[0xd] = 0;
		m[0xe] = 0;
		m[0xf] = 1;
	};
	const mRotationZ = (ang, m) => {
		const cos = Math.cos(ang);
		const sin = Math.sin(ang);
		m[0x0] = cos;
		m[0x1] = -sin;
		m[0x2] = 0;
		m[0x3] = 0;
		m[0x4] = sin;
		m[0x5] = cos;
		m[0x6] = 0;
		m[0x7] = 0;
		m[0x8] = 0;
		m[0x9] = 0;
		m[0xa] = 1;
		m[0xb] = 0;
		m[0xc] = 0;
		m[0xd] = 0;
		m[0xe] = 0;
		m[0xf] = 1;
	};
	const mRotationY = (ang, m) => {
		const cos = Math.cos(ang);
		const sin = Math.sin(ang);
		m[0x0] = cos;
		m[0x1] = 0;
		m[0x2] = sin;
		m[0x3] = 0;
		m[0x4] = 0;
		m[0x5] = 1;
		m[0x6] = 0;
		m[0x7] = 0;
		m[0x8] = -sin;
		m[0x9] = 0;
		m[0xa] = cos;
		m[0xb] = 0;
		m[0xc] = 0;
		m[0xd] = 0;
		m[0xe] = 0;
		m[0xf] = 1;
	};

	const aux0 = new Float32Array(16);
	const invertMat = (m, dst) => {
		for (let i=0; i<4; ++i) {
			for (let j=0; j<4; ++j) {
				if (i==j) {
					dst[i*4 + j] = 1;
				} else {
					dst[i*4 + j] = 0;
				}
				aux0[i*4 + j] = m[i*4 + j];
			}
		}
		for (let i=0; i<4; ++i) {
			let e = aux0[i*4 + i];
			if (e === 0) {
				for (let k=i+1; k<4; ++k) {
					if (aux0[k*4 + i] != 0) {
						for (let j=0; j<4; j++) {
							e = aux0[i*4 + j];
							aux0[i*4 + j] = aux0[k*4 + j];
							aux0[k*4 + j] = e;
							e = dst[i*4 + j];
							dst[i*4 + j] = dst[k*4 + j];
							dst[k*4 + j] = e;
						}
						break;
					}
				}
				e = aux0[i*4 + i];
				if (e === 0) throw 'Error inverting matrix';
			}
			for (let j=0; j<4; j++) {
				aux0[i*4 + j] = aux0[i*4 + j]/e;
				dst[i*4 + j] = dst[i*4 + j]/e;
			}
			for (let k=0; k<4; k++) {
				if (k === i) continue;
				e = aux0[k*4 + i];
				for (let j=0; j<4; j++) {
					aux0[k*4 + j] -= e*aux0[i*4 + j];
					dst[k*4 + j] -= e*dst[i*4 + j];
				}
			}
		}
		return dst;
	};

	class Transform extends Float32Array {
		constructor() {
			super(16);
			this.fill(0);
			for (let i=0; i<4; ++i) this[i*5] = 1;
		}
		apply(other, dst) {
			if (!dst) dst = this;
			mulMatMat(other, this, dst);
			return this;
		}
		translate(x, y, z) {
			this[0x3] += x;
			this[0x7] += y;
			this[0xb] += z;
			return this;
		}
		rotateXYZ(x, y, z) {
			const aux = new Array(16);
			mRotationX(x, aux);
			mulMatMat(aux, this, this);
			mRotationY(y, aux);
			mulMatMat(aux, this, this);
			mRotationZ(z, aux);
			mulMatMat(aux, this, this);
			return this;
		}
		set() {
			let src = arguments.length === 1? arguments[0]: arguments;
			for (let i=16; i--;) this[i] = src[i];
			return this;
		}
		invert(dst) {
			if (!dst) dst = this;
			invertMat(this, dst);
			return this;
		}
		clear() {
			this.fill(0);
			this[0x0] = 1;
			this[0x5] = 1;
			this[0xa] = 1;
			this[0xf] = 1;
			return this;
		}
	}
	window.Transform = Transform;
}

// <end>
// --------------------------------------------------

// --------------------------------------------------
// <start> fname: js/ctx3d.js

{

	const canvas = document.createElement('canvas');
	const gl = canvas.getContext('webgl2');
	const GL = WebGL2RenderingContext;

	// Context
	let currentProgram = null;
	let sx = 800;
	let sy = 600;
	canvas.width = sx;
	canvas.height = sy;

	let lastId = 0;
	const idMap = {};
	const newId = obj => {
		idMap[++lastId] = obj;
		return lastId;
	};
	const progMap = {};
	const progCode = (vs, fs) => vs.id + '/' + fs.id;

	const UNIFORM_MAT4 = 0x1;
	const UNIFORM_FLOAT = 0x2;
	const uniformTypeMap = {
		'mat4': UNIFORM_MAT4,
		'm4': UNIFORM_MAT4,
		'float': UNIFORM_FLOAT,
	};

	const camera = {
		transform: new Transform(),
		projection: new Transform(),
		angle: 12/180*Math.PI,
		near: 0.1,
		far: 500,
	};

	class Shader {
		constructor(src, type) {
			this.id = newId(this);
			this.src = src;
			this.type = type;
			this.ref = null;
		}
		get link() {
			const {ref} = this;
			if (ref !== null) return ref;
			const {src, type} = this;
			const res = gl.createShader(type);
			gl.shaderSource(res, src.trim());
			gl.compileShader(res);
			const log = gl.getShaderInfoLog(res);
			if (log) throw log;
			return this.ref = res;
		}
	}

	class Program {
		constructor(vs, fs) {
			this.id = newId(this);
			this.vs = vs;
			this.fs = fs;
			this.ref = null;
			this.cam_loc = null;
			this.proj_loc = null;
		}
		get link() {
			const {ref} = this;
			if (this.ref !== null) return ref;
			const {vs, fs} = this;
			const res = gl.createProgram();
			gl.attachShader(res, vs.link);
			gl.attachShader(res, fs.link);
			gl.linkProgram(res);
			this.cam_loc = gl.getUniformLocation(res, 'cam');
			this.proj_loc = gl.getUniformLocation(res, 'proj');
			return this.ref = res;
		}
		use() {
			if (currentProgram === this) return;
			gl.useProgram(this.link);
			gl.uniformMatrix4fv(this.cam_loc, true, camera.transform);
			gl.uniformMatrix4fv(this.proj_loc, true, camera.projection);
			currentProgram = this;
			return this;
		}
	}

	class Material {
		constructor(program) {
			this.program = program;
		}
		use() {
			this.program.use();
			return this;
		}
	}

	class Geometry {
		constructor(attrArray, element, layout) {
			this.attrArray = new Float32Array(attrArray);
			this.element = new Uint32Array(element);
			this.layout = layout.slice();
			this.ref = null;
			this.vbo = null;
			this.ebo = null;
		}
		get link() {
			
			const {ref} = this;
			if (ref !== null) return ref;
			
			const {attrArray, element, layout} = this;
			const bpe = attrArray.BYTES_PER_ELEMENT;
			let stride = 0;
			layout.forEach(size => stride += size*bpe);

			const res = gl.createVertexArray();
			const vbo = gl.createBuffer();
			const ebo = gl.createBuffer();
			gl.bindVertexArray(res);
			gl.bindBuffer(GL.ARRAY_BUFFER, vbo);
			gl.bufferData(GL.ARRAY_BUFFER, attrArray, GL.STATIC_DRAW);

			let offset = 0;
			layout.forEach((size, i) => {
				gl.vertexAttribPointer(i, size, GL.FLOAT, false, stride, offset);
				gl.enableVertexAttribArray(i);
				offset += size*bpe;
			});
			
			gl.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, ebo);
			gl.bufferData(GL.ELEMENT_ARRAY_BUFFER, element, GL.STATIC_DRAW);

			this.vbo = vbo;
			this.ebo = ebo;

			return this.ref = res;

		}
		draw() {
			gl.bindVertexArray(this.link);
			gl.drawElements(GL.TRIANGLES, this.element.length, GL.UNSIGNED_INT, 0);
			return this;
		}
		delete() {
			const {ref, vbo, ebo} = this;
			gl.deleteBuffer(vbo);
			gl.deleteBuffer(ebo);
			gl.deleteVertexArray(ref);
			return this;
		}
	}

	class UniformMap {
		constructor(program) {
			this.map = {};
			this.array = [];
			this.program = program;
		}
		setMat4(name, value) {
			const {map} = this;
			const uniform = map[name];
			if (uniform !== undefined) {
				uniform.value = value;
				return this;
			}
			const obj = { name, value, type: UNIFORM_MAT4, location: null };
			const {array} = this;
			array.push(obj);
			map[name] = obj;
			return this;
		}
		setFloat(name, value) {
			const {map} = this;
			const uniform = map[name];
			if (uniform !== undefined) {
				uniform.value = value;
				return this;
			}
			const obj = { name, value, type: UNIFORM_FLOAT, location: null };
			const {array} = this;
			array.push(obj);
			map[name] = obj;
			return this;
		}
		apply() {
			const {program, array} = this;
			const prog = program.link;
			for (let i=array.length; i;) {
				const {name, value, type, location} = array[--i];
				let loc = location;
				if (location === null) {
					loc = gl.getUniformLocation(prog, name);
				}
				switch (type) {
					case UNIFORM_MAT4: gl.uniformMatrix4fv(loc, true, value); break;
					case UNIFORM_FLOAT: gl.uniform1f(loc, value); break;
				}
			}
			return this;
		}
	}

	class Mesh {
		constructor(geometry, material) {
			this.geometry = geometry;
			this.material = material;
			this.transform = new Transform();
			this.uniforms = new UniformMap(material.program);
			this.uniforms.setFloat('highlight', 0);
		}
		translate(x, y, z) {
			this.transform.translate(x, y, z);
			return this;
		}
		rotateXYZ(x, y, z) {
			this.transform.rotateXYZ(x, y, z);
			return this;
		}
		draw() {
			const {geometry, material, transform, uniforms} = this;
			material.use();
			uniforms.setMat4('transform', transform);
			uniforms.apply();
			geometry.draw();
		}
		highlight(state) {
			this.uniforms.setFloat('highlight', state? 1: 0);
			return this;
		}
	}

	const createShader = (src, type) => {
		type = type.trim().toLowerCase();
		if (type === 'vertex' || type === 'v') {
			type = GL.VERTEX_SHADER;
		} else if (type === 'frag' || type === 'fragment' || type === 'f') {
			type = GL.FRAGMENT_SHADER;
		} else {
			throw 'Invalid type';
		}
		return new Shader(src, type);
	};

	const createProgram = (vs, fs) => {
		const code = progCode(vs, fs);
		let prog = progMap[code];
		if (prog !== undefined) return prog;
		return progMap[code] = new Program(vs, fs);
	};

	const handleCameraPropSet = () => {
		const {angle, near, far} = camera;
		const {projection, transform} = camera;
		const n = near;
		const f = far;
		const h = Math.tan(angle)*n;
		const w = h*(sx/sy);
		projection.set(
			n/w, 0, 0, 0,
			0, n/h, 0, 0,
			0, 0, (n+f)/(n-f), 2*n*f/(n-f),
			0, 0, -1, 0
		);
		currentProgram = null;
	};

	const lightPos = [15, 5, 5];
	const toFloatStr = x => Number.isInteger(x)? x+'.0': x.toString();
	const vec3ToStr = (arg) => {
		let arr = [];
		arg.forEach(val => arr.push(toFloatStr(val)));
		return arr.join(', ');
	};

	const handleCameraTransform = () => {
		currentProgram = null;
	};

	const vs = createShader(`
		#version 300 es
		precision highp float;
		layout (location = 0) in vec3 vCoord;
		layout (location = 1) in vec3 vColor;
		layout (location = 2) in vec3 vNormal;
		uniform mat4 transform;
		uniform mat4 cam;
		uniform mat4 proj;
		out vec3 color;
		out vec3 lightCoord;
		out vec3 vertexCoord;
		out vec3 vertexNormal;
		void main() {
			color = vColor;
			lightCoord = (cam*vec4(${ vec3ToStr(lightPos) }, 1.0)).xyz;
			vertexCoord = vCoord;
			vertexNormal = vNormal;
			mat4 all = proj*inverse(cam);
			gl_Position = all*transform*vec4(vCoord, 1.0);
		}
	`, 'vertex');

	const highlightColor = [0, 0.75, 1];

	const fs = createShader(`
		#version 300 es
		precision highp float;
		uniform float highlight;
		in vec3 color;
		in vec3 lightCoord;
		in vec3 vertexCoord;
		in vec3 vertexNormal;
		out vec4 FragColor;
		void main() {
			vec3 lightVec = lightCoord - vertexCoord;
			vec3 lightDir = normalize(lightVec);
			float dist = length(lightVec);
			float angle = dot(vertexNormal, lightDir);
			float change = 1.0 + (2.0*angle - 1.0)*0.2;
			FragColor = vec4(mix(color, vec3(${ vec3ToStr(highlightColor) }), highlight/2.0)*change, 1.0);
		}
	`, 'fragment');

	gl.clearColor(0.8666, 0.8666, 0.8666, 1);
	gl.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
	gl.enable(GL.DEPTH_TEST);

	const n = 60;
	const createCylinder = (z0, z1, r0, r1) => {
		const attrArray = [];
		const element = [];
		const step = Math.PI*2/n;
		const rad = 0.5;
		let nv = 0;
		const add_v = (attr) => {
			attrArray.push(...attr);
			++ nv;
		};
		const addFace = (z, r0, r1, color, nz) => {
			const s = nv;
			for (let i=0; i<n; ++i) {
				const deg = i*step;
				const cos = Math.cos(deg);
				const sin = Math.sin(deg);
				add_v([cos*r0, sin*r0, z, ...color, 0, 0, nz]);
				add_v([cos*r1, sin*r1, z, ...color, 0, 0, nz]);
				const a = s + i*2;
				const b = a + 1;
				const c = s + (i+1)%n*2;
				const d = c + 1;
				element.push(a, b, c);
				element.push(b, c, d);
			}
		};
		const addCylinder = (z0, z1, rad, color, sign) => {
			const s = nv;
			for (let i=0; i<n; ++i) {
				const deg = i*step;
				const cos = Math.cos(deg);
				const sin = Math.sin(deg);
				add_v([cos*rad, sin*rad, z0, ...color, cos*sign, sin*sign, 0]);
				add_v([cos*rad, sin*rad, z1, ...color, cos*sign, sin*sign, 0]);
				const a = s + i*2;
				const b = a + 1;
				const c = s + (i+1)%n*2;
				const d = c + 1;
				element.push(a, b, c);
				element.push(b, c, d);
			}
		};
		const rd = Math.min(r1 - r0, 5);
		const ra = r0 + rd*0.1;
		const rb = r1 - rd*0.1;
		const zd = Math.min(z1 - z0, 5);
		const za = z0 + zd*0.05;
		const zb = z1 - zd*0.05;

		const border_color = [0.3, 0.35, 0.4];
		const face_color = [2/3, 2/3, 2/3];
		
		addFace(z0, r0, ra, border_color, -1);
		addFace(z0, ra, rb, face_color, -1);
		addFace(z0, rb, r1, border_color, -1);
		
		addFace(z1, r0, ra, border_color, +1);
		addFace(z1, ra, rb, face_color, +1);
		addFace(z1, rb, r1, border_color, +1);

		addCylinder(z0, za, r1, border_color, +1);
		addCylinder(za, zb, r1, face_color, +1);
		addCylinder(zb, z1, r1, border_color, +1);
		
		addCylinder(z0, za, r0, border_color, -1);
		addCylinder(za, zb, r0, face_color, -1);
		addCylinder(zb, z1, r0, border_color, -1);
		
		return new Geometry(attrArray, element, [3, 3, 3]);
	};

	const scene = [];
	const mat = new Material(new Program(vs, fs));

	const resize = (width, height) => {
		canvas.width = width;
		canvas.height = height;
		sx = width;
		sy = height;
		gl.viewport(0, 0, sx, sy);
		handleCameraPropSet();
	};

	const setCamera = (angle, near, far) => {
		if (near != null) camera.near = near;
		if (far != null) camera.far = far;
		if (angle) {
			camera.angle = angle;
		}
		handleCameraPropSet();
	};

	const clear = () => {
		scene.forEach(mesh => mesh.geometry.delete());
		scene.length = 0;
	};

	const resetCamera = () => {
		camera.transform.clear();
		handleCameraTransform();
	};

	const translateCamera = (x, y, z) => {
		camera.transform.translate(x, y, z);
		handleCameraTransform();
	};

	const rotateCamera = (x, y, z) => {
		camera.transform.rotateXYZ(x, y, z);
		handleCameraTransform();
	};

	const addCylinder = (z0, z1, r0, r1) => {
		const mesh = new Mesh(createCylinder(z0, z1, r0, r1), mat);
		scene.push(mesh);
	};

	const render = () => {
		gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
		scene.forEach(mesh => mesh.draw());
	};

	const getCanvas = () => {
		return canvas;
	};

	window.Ctx3D = {
		resize,
		setCamera,
		clear,
		resetCamera,
		translateCamera,
		rotateCamera,
		addCylinder,
		render,
		getCanvas,
		highlight: index => {
			scene.forEach((mesh, i) => {
				mesh.highlight(index == i);
			});
		}
	};
}

// <end>
// --------------------------------------------------

// --------------------------------------------------
// <start> fname: js/3d-controller.js

{

	const TAU = Math.PI*2;

	let canvas_sx = 800;
	let canvas_sy = 600;

	Ctx3D.setCamera(22/180*Math.PI);
	Ctx3D.resize(canvas_sx, canvas_sy);
	const canvas = Ctx3D.getCanvas();

	let interval = null;
	let vertical = 1;
	let distance = 0;
	let rotation = 0;
	let shift = 0;

	// let animation = null;
	// const animate = (step, duration) => {
	// 	const t0 = new Date();
	// 	let code = null;
	// 	const finish = () => {
	// 		if (code === null) return;
	// 		clearInterval(code);
	// 		code = null;
	// 		animation = null;
	// 		step(1);
	// 	};
	// 	code = setInterval(() => {
	// 		const t1 = new Date();
	// 		let t = (t1 - t0)/duration;
	// 		if (t >= 1) return finish();
	// 		t = (1 - Math.cos(t*Math.PI))/2;
	// 		t = (1 - Math.cos(t*Math.PI))/2;
	// 		step(t);
	// 	});
	// 	animation = { duration, finish };
	// };

	const updateCamera = () => {
		Ctx3D.resetCamera();
		Ctx3D.translateCamera(0, 0, distance*distance);
		rotation = (rotation%TAU + TAU)%TAU;
		const r = 90/180*Math.PI + rotation;
		const a = vertical*r;
		const b = (1 - vertical)*r;
		Ctx3D.rotateCamera(a, b, 0);
		Ctx3D.translateCamera(0, 0, shift);
	};

	const buttonToMask = [1, 4, 2];
	let startClick = null;

	const handleMousedown = (x, y, button) => {
		if (startClick) return;
		startClick = { x, y, button, distance, rotation, shift };
	};

	const handleMousemove = (x, y, buttons, shiftKey) => {
		if (!startClick) return;
		if (!(buttonToMask[startClick.button] & buttons)) {
			startClick = null;
			return;
		}
		const axis = vertical > 0.5? 'y': 'x';
		const size = vertical > 0.5? canvas_sy: canvas_sx;
		const pos = {x, y}[axis];
		let dif = (pos - startClick[axis])/size;
		if (shiftKey) {
			if (Math.abs(Math.sin(rotation)) <= 0.999) {
				if (Math.cos(rotation) > 0) {
					shift = startClick.shift + dif*10;
				} else {
					shift = startClick.shift - dif*10;
				}
			}
		} else {
			rotation = startClick.rotation - dif*TAU;
		}
		updateCamera();
	};

	const handleWheel = (deltaY) => {
		distance += deltaY/Math.abs(deltaY)/10;
		distance = Math.max(distance, 0);
		updateCamera();
	};

	const getCanvas = () => canvas;

	const start = () => {
		if (interval !== null) return;
		interval = setInterval(() => Ctx3D.render(), 0);
	};

	const stop = () => {
		if (interval === null) return;
		clearInterval(interval);
		interval = null;
	};

	const maxRad = 9;
	const maxH = 30;
	const setCylinders = array => {
		Ctx3D.clear();
		let th = 0;
		let mr = 0;
		array.forEach(cylinder => {
			const {h, r0, r1} = cylinder;
			th += h;
			mr = Math.max(mr, r1);
		});
		let scale1 = maxRad/mr;
		let scale2 = maxH/th;
		let scale = Math.min(scale1, scale2);
		let z0 = -th*scale/2;
		array.forEach(cylinder => {
			let {h, r0, r1} = cylinder;
			let z1 = z0 + h*scale;
			r0 *= scale;
			r1 *= scale;
			Ctx3D.addCylinder(z0, z1, r0, r1);
			z0 = z1;
		});
	};

	const resetView = () => {
		distance = 7;
		rotation = Math.PI;
		shift = 0;
		updateCamera();
	};

	const toggleOrientation = () => {
		vertical = 1 - vertical;
		updateCamera();
	};

	const isVertical = () => vertical > 0.5;

	const resize = (sx, sy) => Ctx3D.resize(sx, sy);

	const highlight = index => {
		Ctx3D.highlight(index);
	};

	resetView();
	updateCamera();

	window.Ctrl3D = {
		handleMousedown,
		handleMousemove,
		handleWheel,
		getCanvas,
		start,
		stop,
		setCylinders,
		resetView,
		toggleOrientation,
		resize,
		isVertical,
		highlight
	};
}

// <end>
// --------------------------------------------------

// --------------------------------------------------
// <start> fname: js/tools.js

const drawTable = (x, y) => {
	ctx.lineWidth = toolButton_rad*0.1;
	ctx.strokeStyle = '#fff';
	ctx.lineCap = 'round';
	const sx = toolButton_rad*1.2;
	const sy = toolButton_rad;
	const x0 = x - sx/2;
	const y0 = y - sy/2;
	const x1 = x0 + sx/3;
	const y1 = y0 + sy/3;
	const x2 = x1 + sx/3;
	const y2 = y1 + sy/3;
	const x3 = x + sx/2;
	const y3 = y + sy/2;
	ctx.beginPath();
	ctx.rect(x0, y0, sx, sy);
	ctx.moveTo(x0, y1);
	ctx.lineTo(x3, y1);
	ctx.moveTo(x0, y2);
	ctx.lineTo(x3, y2);
	ctx.moveTo(x1, y0);
	ctx.lineTo(x1, y3);
	ctx.moveTo(x2, y0);
	ctx.lineTo(x2, y3);
	ctx.stroke();
};

const draw3DToggle = (x, y) => {
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillStyle = '#fff';
	ctx.font = 'bold ' + toolButton_rad + 'px monospace';
	ctx.fillText(mode3d? '2D': '3D', x, y);
};

const drawArrow = (x, y, dir) => {
	const delta1 = toolButton_rad*0.4;
	const delta2 = toolButton_rad*0.1;
	ctx.lineWidth = toolButton_rad*0.2;
	ctx.strokeStyle = '#fff';
	ctx.lineCap = 'round';
	ctx.beginPath();
	ctx.moveTo(x, y - delta1);
	ctx.lineTo(x, y + delta1);
	ctx.stroke();
};

const drawMoveUp = (x, y) => {
	drawArrow(x, y, 1);
};

const drawMoveDown = (x, y) => {
	drawArrow(x, y, -1);
};

const drawOrientationToggle = (x, y) => {
	ctx.lineWidth = toolButton_rad*0.2;
	ctx.strokeStyle = '#fff';
	ctx.lineCap = 'round';
	ctx.beginPath();
	const delta = toolButton_rad*0.5;
	let x0 = x, y0 = y;
	if (Ctrl3D.isVertical()) {
		x0 = x - delta;
	} else {
		y0 = y - delta;
	}
	let x1 = x + (x - x0);
	let y1 = y + (y - y0);
	ctx.moveTo(x0, y0);
	ctx.lineTo(x1, y1);
	ctx.stroke();
};

const drawEditButton = (x, y) => {
	ctx.fillStyle = '#fff';
	const delta = toolButton_rad*0.45;
	for (let i=-1; i<=1; ++i) {
		ctx.beginPath();
		ctx.arc(x + i*delta, y, toolButton_rad*0.15, 0, Math.PI*2);
		ctx.fill();
	}
};

const checkTools = (x, y) => {
	let res = false;
	toolButtons.forEach(button => {
		let dx = x - button.x;
		let dy = y - button.y;
		const dist = Math.sqrt(dx*dx + dy*dy);
		const {handler, visible} = button;
		if (dist <= toolButton_rad && visible) {
			res = true;
			handler();
		}
	});
	if (res) render();
	return res;
};

const renderTools = () => {
	let y = toolButton_y0;
	let delta = toolButton_rad*2 + toolButton_margin;
	toolButtons.forEach((button) => {
		if (!button.visible) return;
		let x = toolButton_x;
		ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
		ctx.beginPath();
		ctx.arc(x, y, toolButton_rad, 0, Math.PI*2);
		ctx.fill();
		button.draw(x, y);
		button.x = x;
		button.y = y;
		y += delta;
	});
};

const toolButtons = [];
const addToolButton = (draw, handler) => {
	const button = {draw, handler, visible: true, x: 0, y: 0};
	toolButtons.push(button);
	return button;
};

addToolButton(draw3DToggle, handleToggle3D);
const tableButton = addToolButton(drawTable, popupMatrix);

const editButton = addToolButton(drawEditButton, callEdit);

const updateTools = () => {
	let edit = false;
	if (selected) {
		const {type, object} = project.find(selected.id);
		if (type !== 'node' || object.position != null) {
			edit = true;
		}
	}
	editButton.visible = edit;
	tableButton.visible = !mode3d;
};

updateTools();
onSelectionChange(updateTools);

// <end>
// --------------------------------------------------
