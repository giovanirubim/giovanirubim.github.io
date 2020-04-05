// ========================<-------------------------------------------->======================== //
// Módulo que permite criar atalhos de teclado

// ========================<-------------------------------------------->======================== //
// Módulos acessados

import * as forms from './forms.js';

// ========================<-------------------------------------------->======================== //

// Mapea usando como chave uma string contendo a tecla concatenada com flags de teclas
// complementares
const map = {}

// Adiciona um atalho de teclado
export const bind = ({key, ctrl, shift, alt}, handler) => {
	key += (ctrl|0);
	key += (shift|0);
	key += (alt|0);
	map[key] = handler;
};

$(document).ready(() => {

	$(window).bind('keydown', e => {

		// Atalhos são ignorados quando um formulário está aberto
		if (forms.length()) return;

		// Chama o handler da tecla pressionada se houver
		let key = e.key.toLowerCase().replace('arrow', '');
		key += (e.ctrlKey|0);
		key += (e.shiftKey|0);
		key += (e.altKey|0);
		const handler = map[key];
		if (handler) handler();
		
	});

});