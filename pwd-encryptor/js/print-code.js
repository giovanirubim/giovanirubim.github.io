const baseURL = 'https://giovanirubim.github.io/pwd-encryptor';

export const printCode = (code) => {
	const screen = document.querySelector('#screen');
	const printDiv = document.querySelector('#print');
	screen.style.display = 'none';
	printDiv.style.display = 'block';
	new QRious({
		element: printDiv.querySelector('canvas'),
		value: baseURL + '?' + encodeURIComponent(code),
		size: 200,
	});
	printDiv.querySelector('.qr-text').innerText = code;
	print();
};
