import * as Renderer from './renderer.js';

const canvas = document.querySelector('canvas');
Renderer.init(canvas);

const setter = {};
const config = {};
const onUpdates = {};
const inputs = [...document.querySelectorAll('input[type="range"]')];

for (let input of inputs) {
	const name = input.getAttribute('name');
	const valueDiv = input.parentElement.querySelector('div.value');
	const setter = (value) => {
		valueDiv.innerText = value;
		input.value = value;
		config[name] = value;
		Renderer.update(config);
	};
	setter[name] = setter;
	input.addEventListener('input', () => {
		setter(input.value);
		onUpdates[name]?.();
	});
	setter(input.value);
}
