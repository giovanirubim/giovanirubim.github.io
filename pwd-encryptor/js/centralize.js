export const centralize = (dom) => {
	const innerCSS = getComputedStyle(dom);
	const parent = dom.parentElement;
	const parentCSS = getComputedStyle(parent);
	const parentWidth = Number(parentCSS.width.replace('px', ''));
	const parentHeight = Number(parentCSS.height.replace('px', ''));
	const innerWidth = Number(innerCSS.width.replace('px', ''));
	const innerHeight = Number(innerCSS.height.replace('px', ''));
	dom.style.marginTop = (parentHeight - innerHeight)*0.4;
	dom.style.marginLeft = (parentWidth - innerWidth)/2;
};
