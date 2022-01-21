const getImageColors = (img) => {
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	const { width, height } = img;
	canvas.width = width;
	canvas.height = height;
	ctx.drawImage(img, 0, 0, width, height);
	const { data } = ctx.getImageData(0, 0, width, height);
	const matrix = [];
	for (let y=0; y<height; ++y) {
		const row = [];
		for (let x=0; x<width; ++x) {
			const color = [];
			for (let i=0; i<3; ++i) {
				const index = (y*width + x)*4 + i;
				color.push(data[index]);
			}
			row.push(color);
		}
		matrix.push(row);
	}
	return matrix;
};
