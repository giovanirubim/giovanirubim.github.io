{
	// Módulo de funções auxiliares

	// Cria um DOM element compatível com o selector
	// Exemplo de selector: input#id[name="nome"][type="button"].class1.class2
	const buildDOM = selector => {
		const sep = '#[.';
		const isSep = {};
		sep.split('').forEach(chr => isSep[chr] = true);
		let strIt = 0;
		let first = 1;
		let element;
		let classes = '';
		const addToken = token => {
			if (first === 1) {
				first = 0;
				element = document.createElement(token);
			} else if (token[0] === '#') {
				element.setAttribute('id', token.substr(1));
				return
			} if (token[0] === '[') {
				token = token.substr(1, token.length - 2);
				const array = token.split('=');
				const name = array[0];
				let value = array[1];
				value = value.substr(1, value.length - 2);
				element.setAttribute(name, value);
			} else if (token[0] === '.') {
				classes += ' ' + token.substr(1);
			}
		};
		const next = () => {
			if (strIt >= selector.length) return false;
			let token = selector[strIt], chr;
			while (++strIt < selector.length && !isSep[chr = selector[strIt]]) {
				token += chr;
			}
			addToken(token);
			return true;
		};
		while (next());
		if (classes) {
			element.setAttribute('class', classes.trim());
		}
		return element;
	}

	// Converte uma medida em pixels para number
	const parsePx = str => parseInt((str + '').replace('px', ''), 10);

	jQuery.fn.sx = function() {
		return parsePx(this.css('width'));
	};
	jQuery.fn.sy = function() {
		return parsePx(this.css('height'));
	};
	jQuery.new = selector => $(buildDOM(selector));
	jQuery.txt = text => $(document.createTextNode(text));
}