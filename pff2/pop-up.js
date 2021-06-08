let wrapper = null;
let block = null;
let content = null;

const centralize = () => {
	if (!wrapper) return;
	const full_x = wrapper.css('width').replace('px', '')*1;
	const full_y = wrapper.css('height').replace('px', '')*1;
	const inner_x = block.css('width').replace('px', '')*1;
	const inner_y = block.css('height').replace('px', '')*1;
	const margin_left = (full_x - inner_x)*0.5;
	const margin_top = (full_y - inner_y)*0.35;
	block.css({
		'margin-left': margin_left,
		'margin-top': margin_top,
	});
	wrapper.on('click', function (e) {
		const target = e.target ?? e.srcElement;
		if (target !== this) {
			return;
		}
		close();
	});
};

export const open = async () => {
	wrapper = $(document.createElement('div'));
	wrapper.addClass('popup-wrapper');
	wrapper.append('<div class="block"></div>');
	block = wrapper.children()
		.append('<div class="content"></div>');
	$('body').append(wrapper);
	content = block.children();
	centralize();
};

export const close = async () => {
	wrapper?.remove();
	wrapper = null;
	block = null;
	content = null;
};

export const setContent = (arg) => {
	content.append(arg);
	centralize();
};

window.onresize = centralize;
