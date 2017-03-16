const P = require('parsimmon')
const fs = require('fs')
const {logger} = require('./logger.js')

let comment = P.regexp(/(#.*)(\n)*/, 1).many()
let whitespace = P.optWhitespace.then(comment)

function token(p) {
	return p.skip(whitespace)
}

let identifier = token(P.regexp(/[a-zA-Z_][0-9a-zA-Z_+-]*/))

let colon = token(P.string(':'))

let number_literal = token(P.regexp(/-?([1-9][0-9]*)/)).map(Number)
let string_literal = token(P.regexp(/".*"/)).map((s) => { return s.substr(1, s.length - 2) })
let type_literal = token(P.regexp(/[A-Z]([A-Z]|_)*/))

let value = P.alt(number_literal, string_literal, type_literal)

let expr = P.lazy(() => { return P.alt(pair, object).many() })

let pair = token(P.seq(identifier.skip(colon), value))
	.map((p) => {
		return { type: 'pair', key: p[0], value: p[1] }
	})

let lbrace = token(P.string('{'))
let rbrace = token(P.string('}'))
let object = P.seq(identifier, lbrace.then(expr).skip(rbrace))
	.map((data) => {
		let obj = {}
		let name = data[0]
		let properties = data[1]
		properties.forEach((property) => {
			if (property.type === 'pair')
				obj[property.key] = property.value
			else {
				if (property.name === 'child_node') {
					if (!obj.children) obj.children = []
					obj.children.push(property.value.child_id)
				}
				else if (property.name === 'param') {
					if (!obj.params) obj.params = {}
					obj.params[property.value.name] = property.value.value
				}
			}
		})
		return { type: 'object', name: name, value: obj }
	})

let aitree = P.lazy(() => {
	return whitespace.then(expr)
})

exports.parse = function(proto) {
	fs.readFile(proto, 'utf-8', (err, data) => {
		let result = aitree.parse(data)
		if (!result.status) {
			console.log(logger.error(`Failed to parse proto file [${proto}]!`))
			return
		}
		nodes_info = {}
		result.value.forEach((value) => {
			if (value.type !== 'object' || value.name !== 'ai_node')
				return
			nodes_info[value.value.id] = value.value
		})
		return nodes_info
	})
}

