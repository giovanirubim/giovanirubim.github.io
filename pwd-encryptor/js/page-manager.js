import { animate } from './animate.js';
import { centralize } from './centralize.js';

const closeCurrentPage = async () => {
	const dom = document.querySelector('.page');
	if (dom === null) return;
	await animate(t => {
		dom.style.opacity = 1 - t;
	});
	dom.remove();
};

export const open = async (page) => {
	await closeCurrentPage();
	const dom = page.build();
	dom.style.opacity = 0;
	document.querySelector('.page')?.remove();
	document.querySelector('#screen').appendChild(dom);
	dom.querySelector('input[type=text]')?.focus();
	centralize(dom);
	await animate(t => {
		dom.style.opacity = t;
	});
};

window.addEventListener('resize', () => {
	centralize(document.querySelector('.page'));
});
