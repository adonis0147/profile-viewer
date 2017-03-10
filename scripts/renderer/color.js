//reference https://www.cs.rit.edu/~ncs/color/t_convert.html
function hsv2rgb(h, s, v) {
	let rgb
	if (s == 0) rgb = [v, v, v]
	else {
		h /= 60
		let i = Math.floor(h)
		let f = h - i
		data = [v * (1 - s), v * (1 - s * f), v * (1 - s * (1 - f))]
		switch (i) {
			case 0:
				rgb = [v, data[2], data[0]]
				break
			case 1:
				rgb = [data[1], v, data[0]]
				break
			case 2:
				rgb = [data[0], v, data[2]]
				break
			case 3:
				rgb = [data[0], data[1], v]
				break
			case 4:
				rgb = [data[2], data[0], v]
				break
			default:
				rgb = [v, data[0], data[1]]
				break
		}
	}
	rgb = rgb.map((x) => { return ('0' + Math.round(x * 255).toString(16)).slice(-2) })
	return `#${rgb.join('')}`
}

