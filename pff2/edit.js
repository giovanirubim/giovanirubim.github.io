import format from './format.js';

const ofertas = await $.get('./ofertas.json');

const load = (index) => {
	$('#index').val(index + 1);
	const oferta = ofertas[index];
	let data = '';
	for (let attr in oferta) {
		if (attr !== 'info') {
			data += `${attr}=${oferta[attr]}\n`;
		}
	}
	$('#data').val(data);
	$('#info').val(oferta.info);
	updatePreview();
};

const read = () => {
	const data = $('#data').val();
	const info = $('#info').val();
	return Object.fromEntries(
		data.trim()
			.replace(/\s*\n\s*/g, '\n')
			.split('\n')
			.map((line) => line.split('='))
			.concat([['info', info]])
	);
};

const updatePreview = () => {
	$('#view')[0].innerHTML = format($('#info').val());
};

const download = () => {
	$('#download').remove();
	const link = $(document.createElement('a'));
	const json = JSON.stringify(ofertas, null, '\t')
		.replace(/[^\x00-\x7e]/g, (char) => '\\u' + char.charCodeAt(0).toString(16).padStart(4, '0'));
	link.attr({
		id: 'download',
		href: `data:application/json;base64,${btoa(json)}`,
		download: 'ofertas.json',
	});
	link.html('Download');
	$('body').append(link);
	updateRange();
};

const updateRange = () => {
	$('#index').attr('max', ofertas.length);
	$('#total').html(ofertas.length);
};

$(document).ready(() => {
	updateRange();
	load(0);
	updatePreview();
	$('#update').on('click', () => {
		read();
	});
	$('#info').on('keyup', updatePreview);
	$('#update').on('click', () => {
		const index = $('#index').val() - 1;
		ofertas[index] = read();
		download();
	});
	$('#index').on('change keyup', function() {
		const index = this.value - 1;
		if (ofertas[index]) {
			load(index);
		} else {
			$('#data').val('');
			$('#info').val('');
			$('#view').html('');
		}
	});
	$('#delete').on('click', () => {
		const index = $('#index').val() - 1;
		ofertas.splice(index, 1);
		if (index === ofertas.length) {
			load(index - 1);
		} else {
			load(index);
		}
		download();
	});
	$('#add').on('click', () => {
		const oferta = read();
		ofertas.push(oferta);
		updateRange();
		load(ofertas.length - 1);
		download();
	});
});
