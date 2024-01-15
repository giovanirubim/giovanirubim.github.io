import { open } from './page-manager.js';
import { Page } from './page.js';
import * as Encryption from './encryption.js';
import { fixTypo } from './utils.js';
import { printCode } from './print-code.js';

export const start = new Page()
	.addText('Para começar insira a senha mestre')
	.addInput('pass')
	.addButton('Continuar', () => {
		window.pass = document.querySelector('[name=pass]').value;
		return open(main);
	});

export const fromURL = new Page()
	.addText('Insira a senha mestre para recuperar a senha deste QR Code')
	.addInput('pass')
	.addButton('Continuar', async () => {
		const pass = document.querySelector('[name=pass]').value;
		window.output = await Encryption.decrypt(window.encrypted, pass);
		await open(outputDecryption);
	})
	.addButton('Cancelar', () => open(start))
	.setOnload(() => {
		window.encrypted = decodeURIComponent(window.location.search.replace(/^\?/, ''));
	});

const main = new Page()
	.addButton('Salvar senha', () => open(encrypt))
	.addButton('Recuperar senha', () => open(decrypt))

const encrypt = new Page()
	.addText('Insira a senha que deseja salvar')
	.addInput('pass')
	.addButton('Continuar', async () => {
		const pass = document.querySelector('[name=pass]').value;
		window.output = await Encryption.encrypt(pass, window.pass);
		await open(outputEncryption);
	})
	.addButton('Voltar', () => open(main));

const outputEncryption = new Page()
	.addText('Código gerado. Salve este código para poder recuperar a senha quando necessário')
	.addOutput('output')
	.addButton('Imprimir QR Code', () => printCode(window.output))
	.addButton('Voltar', () => open(main))
	.setOnload(page => page.querySelector('[name=output]').value = window.output);

const decrypt = new Page()
	.addText('Insira a senha que deseja recuperar')
	.addInput('encrypted')
	.addButton('Continuar', async () => {
		const encrypted = fixTypo(document.querySelector('[name=encrypted]').value);
		const valid = await Encryption.validSum(encrypted);
		if (!valid) {
			return alert('Parece que houve algum erro de digitação');
		}
		window.output = await Encryption.decrypt(encrypted, window.pass);
		await open(outputDecryption);
	})
	.addButton('Voltar', () => open(main));

const outputDecryption = new Page()
	.addText('Senha recuperada')
	.addOutput('output')
	.addButton('Voltar', () => open(main))
	.setOnload(page => page.querySelector('[name=output]').value = window.output);
