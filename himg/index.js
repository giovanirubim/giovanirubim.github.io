import * as Encoder from './encoder.js'
let canvas, context2d

const loadData = () => {
	const json = localStorage.getItem('data')
	if (!json) {
		return
	}
	const data = JSON.parse(json)
	for (let id in data) {
		$(`#${id}`).val(data[id])
	}
}

const setImageSrc = (src) => {
	const img = document.createElement('img')
	let callback
	img.onload = () => {
		canvas.width = img.width
		canvas.height = img.height
		context2d.drawImage(img, 0, 0)
		callback()
	}
	img.src = src
	return new Promise((done) => callback = done)
}

const updateConfig = () => {
	const data = {};
	['bits', 'rows', 'cols'].forEach((id) => {
		const dom = $(`#${id}`)
		data[id] = Number(dom.val() || dom.attr('placeholder'))
	})
	Encoder.setConfig(data)
	localStorage.setItem('data', JSON.stringify(data))
	const maxlength = Encoder.getMessageLength()
	$('#text').attr('maxlength', maxlength)
	$('#maxlength').text(maxlength)
}

const encode = () => {
	Encoder.encode(context2d, canvas.width, canvas.height, $('#text').val())
}

const decode = () => {
	const message = Encoder.decode(context2d, canvas.width, canvas.height)
	$('#text').val(message)
}

$(document).ready(() => {
	$('#decode').bind('click', decode)
	$('input[type="file"]').bind('change', function() {
		const [file] = this.files
		if (!file) {
			return
		}
		const reader = new FileReader()
		reader.onloadend = () => {
			setImageSrc(reader.result)
		}
		reader.readAsDataURL(file)
	})
	$('form').bind('submit', () => {
		encode()
		return false
	});
	$('#bits,#rows,#cols').bind('keyup change', updateConfig)
	canvas = document.querySelector('canvas')
	context2d = canvas.getContext('2d')
	loadData()
	updateConfig()
})
