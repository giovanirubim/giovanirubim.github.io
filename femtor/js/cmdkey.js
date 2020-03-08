const map = {}
export const bind = ({key, ctrl, shift, alt}, handler) => {
	key += (ctrl|0);
	key += (shift|0);
	key += (alt|0);
	map[key] = handler;
};
$(document).ready(() => {
	$(window).bind('keydown', e => {
		let key = e.key.toLowerCase().replace('arrow', '');
		key += (e.ctrlKey|0);
		key += (e.shiftKey|0);
		key += (e.altKey|0);
		const handler = map[key];
		if (handler) handler();
	});
});