const div = document.createElement('div');

export default function(text) {
	div.innerText = text;
	return div.innerHTML
		.replace(/wpp:{(.*?)}/g, (match, content) => {
			const number = content.replace(/[^\d]/g, '');
			return `<a target="_blank" href="https://wa.me/55${number}">${content}</a>`;
		})
		.replace(/link:{([^;]*?);([^;]*?)}/g, (match, text, url) => {
			return `<a target="_blank" href="${url}">${text}</a>`;
		})
		.replace(/n:{(.*?)}/g, (match, text) => {
			return `<b>${text}</b>`;
		});
}
