import * as UTF8 from './utf-8.js';
import * as SHA1 from './sha-1.js';
import * as Pattern from './pattern.js';
import * as Random from './random.js';
import * as PwdGenerator from './pwd-generator.js';

let centralizer, wrapper;

const chr = code => String.fromCharCode(code);
const charsetMap = {
	digits: '0123456789',
	lowercase: new Array(26).fill(0).map((_,i)=>chr(97+i)).join(''),
	uppercase: new Array(26).fill(0).map((_,i)=>chr(65+i)).join(''),
	special1: new Array(94).fill(0).map((_,i)=>chr(i+33)).join('').replace(/[A-Za-z0-9]/g, ''),
	special2: new Array(95).fill(0).map((_,i)=>chr(i+161)).join('').replace(/\xAD/, ''),
};

let pattern = '';
const centralize = () => {
	let fullsy = parseInt(centralizer.css('height').replace('px', ''));
	let innersy = parseInt(wrapper.css('height').replace('px', ''));
	wrapper.css({
		'margin-top': Math.max(10, (fullsy - innersy)*0.4)
	});
};

const hide = () => new Promise(done => {
	centralizer.animate({ opacity: 0 }, done);
});
const show = () => new Promise(done => {
	centralizer.animate({ opacity: 1 }, done);
});
const intRegex = /^\d+$/;

const createValidation = (fields) => {
	let queue = [];
	for (let id in fields) {
		const { type, required } = fields[id];
		const input = $('#'+id);
		const validate = () => {
			let value = input.val().trim();
			if (!value) {
				if (!required) {
					input.val('');
					return true;
				} else {
					input.addClass('invalid');
					return false;
				}
			}
			if (type === 'integer') {
				if (!intRegex.test(value)) {
					input.addClass('invalid');
					return false;
				}
			}
			return true;
		};
		queue.push(validate);
		input.bind('change', validate);
		input.bind('keyup', () => input.removeClass('invalid'));	
	}
	return () => {
		let valid = 1;
		queue.forEach(check => valid &= check());
		return !!valid;
	};
};

$(document).ready(() => {
	const pwd1 = $('#pwd1');
	const pwd2 = $('#pwd2');
	centralizer = $('#centralizer');
	wrapper = $('#wrapper');
	Pattern.setCanvas($('canvas')[0]);
	Pattern.render();
	Pattern.onChange(str => {
		pattern = str? '3/' + str: '*';
	});
	centralize();
	centralizer.css({opacity: 1});
	$(window).bind('resize', centralize);
	$('#ok').bind('click', async () => {
		if (pwd1.val() !== pwd2.val()) {
			pwd2.addClass('invalid');
			return;
		}
		await hide();
		$('.page').eq(0).hide();
		$('.page').eq(1).show().find('input').first().focus();
		centralize();
		show();
	});
	$('#pwd1,#pwd2').bind('keyup change', () => {
		if (pwd1.val() === pwd2.val()) pwd2.removeClass('invalid');
	});
	$('#year').val(new Date().getFullYear())
	$('#counter').val('1');
	$('#length').val(16);
	const validate1 = createValidation({
		usage: { required: true, type: 'string' },
		length: { required: true, type: 'integer' },
		year: { type: 'integer' },
		counter: { required: true, type: 'integer' },
	});
	$('#generate').bind('click', async () => {
		if (!validate1()) return;
		await hide();
		$('.page').eq(1).hide();
		$('.page').eq(2).show();
		centralize();
		let result = PwdGenerator.generate({
			password: $('#pwd1').val(),
			pattern,
			usage: $('#usage').val(),
			length: $('#length').val(),
			counter: $('#counter').val(),
			year: $('#year').val(),
			digits: $('#digits').is(':checked'),
			lowercase: $('#lowercase').is(':checked'),
			uppercase: $('#uppercase').is(':checked'),
			specialascii: $('#specialascii').is(':checked'),
			specialnonascii: $('#specialnonascii').is(':checked')
		});
		$('#result').val(result).focus().select();
		show();
	});
	$('#back').bind('click', async () => {
		await hide();
		$('.page').eq(2).hide();
		$('.page').eq(1).show();
		centralize();
		show();
	})
});