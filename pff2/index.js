import * as Popup from './pop-up.js';

const ofertas = await $.get('ofertas.json');
ofertas.forEach((oferta, index) => oferta.index = index);

ofertas.sort((a, b) => a.valor_unitario - b.valor_unitario);

const formatPrice = (price) => {
	price = price.toString();
	price = price.replace('.', ',');
	if (!price.includes(',')) {
		price += ',00';
	}
	price = price.replace(/,\d+/, (str) => str.padEnd(3, '0'));
	return 'R$ ' + price;
}

const fillTable = (rows) => {
	let html = '';
	rows.forEach((row) => {
		html += `<tr class="oferta" oferta-index="${row.index}">`;
		html += `<td>${row.nome}</td>`
		html += `<td>${row.modelo}</td>`
		html += `<td>${formatPrice(row.valor_unitario)}</td>`
		html += `<td>${row.loja_fisica? 'Sim': 'Não'}</td>`
		html += `<td>${row.loja_online? 'Sim': 'Não'}</td>`
		html += `<td>${row.frete}</td>`
		html += `<td>${row.zona}</td>`
		html += '</tr>';
	});
	$('table tr').not(':first').remove();
	$('table').append(html);
};

const fillSelect = (name) => {
	const map = {};
	ofertas.forEach((item) => {
		const key = prepareString(item[name]);
		map[key] = item[name];
	});
	const items = Object.values(map);
	const select = $(`[name="${name}"]`);
	items.forEach((item, i) => {
		select.append(`<option value="${item}">${item}</option>`);
	});
};

const fillModelos = () => {
	fillSelect('modelo');
	fillSelect('zona');
};

const prepareString = (string) => string
	.trim()
	.replace(/\s+/g, '\x20')
	.toLowerCase();

const getFiltered = () => {
	const modelo = prepareString($('[name="modelo"]').val() ?? '');
	const zona = prepareString($('[name="zona"]').val() ?? '');
	const min = $('[name="min"]').val();
	const max = $('[name="max"]').val();
	return ofertas.filter((oferta) => {
		if (modelo !== '' && modelo !== prepareString(oferta.modelo)) {
			return false;
		}
		if (zona !== '' && zona !== prepareString(oferta.zona)) {
			return false;
		}
		if (min !== '' && oferta.valor_unitario < (min*1)) {
			return false;
		}
		if (max !== '' && oferta.valor_unitario > (max*1)) {
			return false;
		}
		return true;
	});
};

const updateTable = () => {
	fillTable(getFiltered());
};

$(document).ready(function(){
	fillModelos();
	updateTable();
	$('#filters [name]').on('change keyup', () => {
		updateTable();
	});
	$('body').on('click', 'tr.oferta', function(e) {
		const tr = $(this);
		const index = tr.attr("oferta-index")*1;
		const oferta = ofertas[index];
		Popup.open();
		const div = $(document.createElement('div'))
			.addClass('text-info');
		div[0].innerText = e.altKey ? 'Número: ' + oferta.index : oferta.info;
		Popup.setContent(div);
	});
});
