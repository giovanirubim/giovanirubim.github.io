const forms = [];

export const open = options => new Promise(done => {
	const shadow = $.new('div');
	shadow.css({
		position: 'fixed',
		top: '0px',
		left: '0px',
		right: '0px',
		bottom: '0px',
		'background-color': 'rgba(0, 0, 0, 0.85)',
	});
	const wrapper = $.new('div');
	shadow.append(wrapper);
	const form = $.new('div');
	wrapper.append(form);
	if (options.title) {
		const title = $.new('div').css({
			'font-size': '36px',
			'margin-bottom': '15px'
		}).append($.txt(options.title));
		form.append(title);
	}
	forms.append(shadow);
	$('body').append(shadow);
});