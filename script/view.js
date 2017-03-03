const d3 = require('d3')

var blackboard = d3.select('#blackboard')

init()

function init() {
	initBlackboard()
	registerEvent()
}

function initBlackboard() {
	var min_width = blackboard.style('width')
	var min_height = blackboard.style('height')

	blackboard.style('min-width', min_width)
	blackboard.style('min-height', min_height)
}

function registerEvent() {
	d3.select(window).on('resize', () => {
		console.log('Windows was resized to ' +
				blackboard.style('width') +
				' x ' +
				blackboard.style('height'))
	})
}

