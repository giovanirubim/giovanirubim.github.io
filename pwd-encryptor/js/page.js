const wrapItem = (dom) => {
	const item = document.createElement('div');
	item.setAttribute('class', 'item');
	item.appendChild(dom);
	return item;
};

export class Page {
	constructor() {
		this.content = [];
	}
	setOnload(fn) {
		this.onload = fn;
		return this;
	}
	addText(text) {
		this.content.push({ text });
		return this;
	}
	addInput(name) {
		this.content.push({ name });
		return this;
	}
	addButton(label, onclick) {
		this.content.push({ label, onclick });
		return this;
	}
	addOutput(name) {
		this.content.push({ isOutput: true, name });
		return this;
	}
	build() {
		const page = document.createElement('div');
		for (const { text, name, label, onclick, isOutput } of this.content) {
			if (text !== undefined) {
				const child = document.createElement('div');
				child.innerText = text;
				page.appendChild(wrapItem(child));
				continue;
			}
			if (label !== undefined) {
				const child = document.createElement('button');
				child.innerText = label;
				child.addEventListener('click', onclick);
				page.appendChild(wrapItem(child));
				continue;
			}
			if (isOutput) {
				const child = document.createElement('textarea');
				child.setAttribute('name', name);
				child.setAttribute('disabled', true);
				page.appendChild(wrapItem(child));
				continue;
			}
			if (name !== undefined) {
				const child = document.createElement('input');
				child.setAttribute('type', 'text');
				child.setAttribute('name', name);
				page.appendChild(wrapItem(child));
				continue;
			}
		}
		page.setAttribute('class', 'page');
		this.onload?.(page);
		return page;
	}
}
