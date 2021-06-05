const models = await $.get('models.json');
const offers = await $.get('offers.json');

offers.sort((a, b) => a.valor_unitario - b.valor_unitario);

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
		html += '<tr>';
		html += `<td>${row.nome}</td>`
		html += `<td>${row.modelo}</td>`
		html += `<td>${formatPrice(row.valor_unitario)}</td>`
		html += `<td>${row.loja_fisica? 'Sim': 'Não'}</td>`
		html += `<td>${row.loja_online? 'Sim': 'Não'}</td>`
		html += `<td>${row.frete}</td>`
		html += '</tr>';
	});
	$('table tr').not(':first').remove();
	$('table').append(html);
};

const fillModelos = () => {
	const select = $('[name="model"]');
	models.forEach((model, i) => {
		select.append(`<option value="${i}">${model}<option/>`)
	});
};

const updateTable = () => {
	let array = offers.slice();
	let fields = {};
	$('#filters [name]').each(function(){
		const item = $(this);
		fields[item.attr('name')] = item.val();
	});
	console.log(fields);
	fillTable(offers);
};

$(document).ready(function(){
	fillModelos();
	updateTable();
});
