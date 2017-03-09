const winston = require('winston')

exports.logger = new (winston.Logger)({
	transports: [
		new (winston.transports.Console)({
			timestamp() {
				let d = new Date()
				let locale = 'zh-CN'
				let date_string = d.toLocaleDateString(locale, { year: 'numeric', month: '2-digit', day: '2-digit' })
					.replace(/\//g, '-')
				let time_string = d.toLocaleTimeString(locale, { hour12: false })
				return `${date_string} ${time_string}`
			}
		})
	]
})

