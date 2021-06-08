const ofertas = await $.get('./ofertas.json');

const load = (index) => {
	$('#index').val(index);
	const oferta = ofertas[index];
	let data = '';
	for (let attr in oferta) {
		if (attr !== 'info') {
			data += `${attr}=${oferta[attr]}\n`;
		}
	}
	$('#data').val(data);
	$('#info').val(oferta.info);
};

const read = () => {
	const data = $('#data').val();
	const info = $('#info').val();
	const obj = Object.fromEntries(
		data.trim()
			.replace(/\s*\n\s*/g, '\n')
			.split('\n')
			.map((line) => line.split('='))
	);
	console.log(obj);
};

const updatePreview = () => {
	const info = $('#info').val();
	const view = $('#view');
	view[0].innerText = info;
	let html = view[0].innerHTML;
	html = html.replace(/wpp:{(.*)}/g, (match, content) => {
		const number = content.replace(/[^\d]/g, '');
		return `<a href="https://wa.me/55${number}">${content}</a>`;
	});
	view[0].innerHTML = html;
};

$(document).ready(() => {
	load(0);
	updatePreview();
	$('#update').on('click', () => {
		read();
	});
	$('#info').on('keyup', updatePreview);
});
