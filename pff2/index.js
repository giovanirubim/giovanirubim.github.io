const modelos = await $.get('modelos.json');

const fillModelos = () => {
	const select = $('[name="modelo"]');
	modelos.forEach((modelo, i) => {
		select.append(`<option value="${i}">${modelo}<option/>`)
	});
};

$(document).ready(function(){
	fillModelos();
});
