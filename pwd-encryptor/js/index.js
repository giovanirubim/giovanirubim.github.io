import { encrypt, decrypt, validCode } from './encryption.js'
import * as PwdSymbol from './pwd-symbol.js';
window.PwdSymbol = PwdSymbol;

let key = ''
const dom = {}
const centralize = () => {
	const sx = dom.main.css('width').replace('px', '')*1
	const sy = dom.main.css('height').replace('px', '')*1
	const full_sx = window.innerWidth
	const full_sy = window.innerHeight
	dom.main.css({
		'margin-top': Math.floor((full_sy - sy)*0.4) + 'px'
	})
}
const hide = () => new Promise((done) => {
	if (!dom.text.text()) {
		dom.main.css({ opacity: 0 })
		return done()
	}
	dom.main.animate({ opacity: 0 }, 500, () => {
		dom.text.html('')
		dom.content.html('')
		done()
	})
})
const show = () => new Promise((done) => {
	centralize()
	dom.main.animate({ opacity: 1 }, 500, done)
	dom.main.find('input[type="text"]').first().focus()
})
const addInput = () => {
	dom.content.append(`
		<div>
			<input type="text" autocapitalize="none">
		</div>
	`)
	return dom.content.find('input').last()
}
const addButton = (text) => {
	dom.content.append(`
		<div>
			<input type="button" value="${text}">
		</div>
	`)
	return dom.content.find('input').last()
}
const addTextblock = (content) => {
	dom.content.append(`
		<div>
			<textarea disabled></textarea>
		</div>
	`)
	const res = dom.content.find('textarea').last()
	res.val(content)
	return res
}
const options = async () => {
	await hide()
	dom.text.text('O que deseja fazer?')
	addButton('Salvar uma senha').on('click', store)
	addButton('Recuperar senha de um código').on('click', recover)
	// addButton('Criar uma senha segura')
	show()
}
const showCode = async (code) => {
	await hide()
	dom.text.text('Código gerado. Salve este código para poder recuperar a senha se precisar')
	addTextblock().val(code)
	addButton('Voltar').on('click', options)
	show()
}
const showPass = async(pass) => {
	await hide()
	dom.text.text('Senha recuperada')
	addTextblock().val(pass)
	addButton('Voltar').on('click', options)
	show()
}
// const checkSymbol = () => {
// 	await hide()
// 	dom.text.text('Este é seu símbolo?')
// }
const recover = async() => {
	await hide()
	dom.text.text('Insira o código salvo da senha')
	let input = addInput()
	addButton('Continuar').on('click', () => {
		let code = validCode(input.val())
		if (!code) {
			alert('Ops!\nParece que há um erro de digitação no código')
		} else {
			showPass(decrypt(key, code))
		}
	})
	addButton('Voltar').on('click', options)
	show()
}
const store = async () => {
	await hide()
	dom.text.text('Insira a senha que deseja salvar')
	let input = addInput()
	addButton('Continuar').on('click', () => {
		showCode(encrypt(key, input.val()))
	})
	addButton('Voltar').on('click', options)
	show()
}
const start = async () => {
	await hide()
	dom.text.text('Para começarmos insira a senha mestre')
	let input = addInput()
	addButton('Continuar').on('click', () => {
		key = input.val()
		options()
	})
	show()
}
$(document).ready(() => {
	$('form').on('submit', e => {
		const target = $('input[type="button"]:focus')
		target.trigger('click')
		return false
	})
	dom.main = $('.main')
	dom.text = $('.text')
	dom.content = $('.content')
	centralize()
	$(window).on('resize', centralize)
	start()
})
