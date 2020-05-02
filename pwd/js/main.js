import * as UTF8 from './utf-8.js';
import * as SHA1 from './sha-1.js';
import * as Pattern from './pattern.js';

let centralizer, wrapper;

const chr = code => String.fromCharCode(code);
const charsetMap = {
	digits: '0123456789',
	lowercase: new Array(26).fill(0).map((_,i)=>chr(97+i)).join(''),
	uppercase: new Array(26).fill(0).map((_,i)=>chr(65+i)).join(''),
	special1: new Array(94).fill(0).map((_,i)=>chr(i+33)).join('').replace(/[A-Za-z0-9]/g, ''),
	special2: new Array(95).fill(0).map((_,i)=>chr(i+161)).join('').replace(/\xAD/, ''),
};

const context = {
	key: '',
	password: '',
	grid: 3,
	pattern: '',
};

const centralize = () => {
	let fullsy = parseInt(centralizer.css('height').replace('px', ''));
	let innersy = parseInt(wrapper.css('height').replace('px', ''));
	wrapper.css({
		'margin-top': Math.max(10, (fullsy - innersy)*0.4)
	});
};

$(document).ready(() => {
	const pwd1 = $('#pwd1');
	const pwd2 = $('#pwd2');
	centralizer = $('#centralizer');
	wrapper = $('#wrapper');
	Pattern.setCanvas($('canvas')[0]);
	Pattern.render();
	Pattern.onChange(str => {
		context.pattern = str? context.grid+'/'+str: '*';
	});
	centralize();
	centralizer.css({opacity: 1});
	$(window).bind('resize', centralize);
	$('#ok').bind('click', () => {
		if (pwd1.val() !== pwd2.val()) {
			pwd2.addClass('invalid');
			return;
		}
		centralizer.animate({opacity: 0});
	});
	$('#pwd1,#pwd2').bind('keyup change', () => {
		if (pwd1.val() === pwd2.val()) pwd2.removeClass('invalid');
	});
});