let nRows, nCols, nBits
let totalBits, rMask, lMask

export const setConfig = ({ rows, cols, bits }) => {
	nRows = rows
	nCols = cols
	nBits = bits
	totalBits = nRows*nCols*nBits*3
	rMask = (1 << nBits) - 1
	lMask = ~rMask
}

export const getMessageLength = () => (totalBits/7)|0

const calcProp = (size, n) => {
	const result = []
	const stride = size/n
	for (let i=0; i<n; ++i) {
		const startsAt = Math.floor(stride*i)
		const size = Math.floor(stride*(i+1)) - startsAt
		result[i] = { startsAt, size }
	}
	return result
}

const cellValue = (encodingContext, row, col, channel, value) => {
	const {size: nRows, startsAt: rowStart} = encodingContext.indexProp.row[row]
	const {size: nCols, startsAt: colStart} = encodingContext.indexProp.col[col]
	const {data, width} = encodingContext.imageData
	const area = nRows*nCols
	let sum = 0
	for (let i=0; i<nRows; ++i) {
		const base = ((rowStart + i)*width + colStart)*4 + channel
		for (let j=0; j<nCols; ++j) {
			const index = base + j*4
			sum += data[index]
		}
	}
	const average = sum/area
	const round = Math.round(average)
	if (value == null) {
		return (round & rMask).toString(2).padStart(nBits, '0')
	}
	const targetAverage = round & lMask | parseInt(value, 2) & rMask
	const targetSum = targetAverage*area
	const sumDif = targetSum - sum
	const inc = sumDif/Math.abs(sumDif)
	let nHits = Math.round(Math.abs(sumDif))
	while (nHits > 0) {
		const x = colStart + Math.floor(Math.random()*nCols)
		const y = rowStart + Math.floor(Math.random()*nRows)
		const index = (y*width + x)*4 + channel
		const value = data[index] + inc
		if (value >= 0 && value <= 255) {
			data[index] = value
			-- nHits
		}
	}
}

const encodeText = (text) => {
	let result = ''
	for (let i=0; i<text.length; ++i) {
		const byte = text.charCodeAt(i)
		result += byte.toString(2).padStart(7, '0')
	}
	return result.padEnd(totalBits, '0')
}

const decodeText = (bin) => {
	let res = ''
	const length = getMessageLength()
	for (let i=0; i<length; ++i) {
		const byte = parseInt(bin.substr(i*7, 7), 2)
		res += String.fromCharCode(byte)
	}
	return res.replace(/\x00/g, '')
}

const createEncodingContext = (context2d, width, height) => {
	const indexProp = {
		row: calcProp(height, nRows),
		col: calcProp(width, nCols),
	}
	const imageData = context2d.getImageData(0, 0, width, height)
	const {data} = imageData
	return {
		indexProp,
		context2d,
		imageData,
	}
}

const forEachCell = (encodingContext, it) => {
	for (let row = 0; row<nRows; ++row) {
		for (let col = 0; col<nCols; ++col) {
			for (let channel = 0; channel<3; ++channel) {
				it(row, col, channel)
			}
		}
	}
}

export const encode = (context2d, width, height, message) => {
	const encodingContext = createEncodingContext(context2d, width, height)
	let input = encodeText(message)
	forEachCell(encodingContext, (row, col, channel) => {
		const value = input.substr(0, nBits)
		cellValue(encodingContext, row, col, channel, value)
		input = input.substr(nBits)
	})
	context2d.putImageData(encodingContext.imageData, 0, 0)
}

export const decode = (context2d, width, height) => {
	const encodingContext = createEncodingContext(context2d, width, height)
	let bin = ''
	forEachCell(encodingContext, (row, col, channel) => {
		bin += cellValue(encodingContext, row, col, channel)
	})
	bin = bin.padEnd(totalBits, '0')
	return decodeText(bin)
}
