const d3 = require('d3')
const {remote} = require('electron')
const {session} = remote.require('../main/viewer.js')
const {logger} = remote.require('./logger.js')

let NODE_SIZE = {
	width : 150,
	height : 50,
}

let DURATION = 750
let VERTICAL_DISTANCE = 100
let RATIO = 0.15

let container
let blackboard

let offset = {
	x: 0,
	y: 0,
	calculate() {
		this.x = container.style('width').replace('px', '') / 2
		this.y = container.style('height').replace('px', '') * RATIO
	}
}

let id_manager = {
	id: 0,
	reset() { this.id = 0 },
	generate() { return ++ this.id },
}

let tree = d3.tree().nodeSize([NODE_SIZE.width + 20, NODE_SIZE.height])
let root
let current_key

function view(data, key) {
	refresh()

	root = d3.hierarchy(data, (d) => { return d.children })
	root.x0 = offset.x
	root.y0 = offset.y

	current_key = key

	logger.info(`On view data - ${root.data.name} [${key}]`)

	collapse(root)
	update(root)
}

function refresh() {
	d3.select('#container').remove()
	container = d3.select('#content').append('svg')
		.attr('id', 'container')
	blackboard = container.call(d3.zoom().on('zoom', () => {
			blackboard.attr('transform', d3.event.transform)
		}))
		.append('g')
			.attr('transform', 'translate(0, 0)')

	offset.calculate()
	id_manager.reset()
	blackboard.selectAll('g.node').remove()
	blackboard.selectAll('path.link').remove()
	blackboard.selectAll('g.label').remove()
}

function collapse(d) {
	if (d.children) {
		d._children = d.children
		d.children.forEach(collapse)
		d.children = null
	}
}

function expand(d) {
	if (d._children) {
		d.children = d._children
		d._children = null
	}
	if (d.children)
		d.children.forEach(expand)
}

function update(source) {
	let meta_data = tree(root)
	let nodes = meta_data.descendants()
	let links = meta_data.descendants().slice(1)

	nodes.forEach((d) => {
		d.x += offset.x
		d.y = d.depth * VERTICAL_DISTANCE + offset.y
	})

	updateNodes(source, nodes)
	updateLinks(source, links)
	updateLabels(source, nodes)
	updateColor()

	nodes.forEach((d) => {
		d.x0 = d.x
		d.y0 = d.y
	})
}

function updateNodes(source, nodes) {
	let node = blackboard.selectAll('g.node')
		.data(nodes, (d) => { return d.id || (d.id = id_manager.generate()) })

	let node_enter = node.enter().append('g')
		.attr('class', 'node')
		.attr('transform', (d) => { return `translate(${source.x0}, ${source.y0})` })

	node_enter.append('rect')
		.attr('class', 'node')
		.attr('x', -NODE_SIZE.width / 2)
		.attr('y', -NODE_SIZE.height / 2)
		.attr('width', 0)
		.attr('height', 0)

	node_enter.append('foreignObject')
		.attr('x', -NODE_SIZE.width / 2)
		.attr('y', -NODE_SIZE.height / 2)
		.append('xhtml:body')
			.append('p')
				.style('width', `${NODE_SIZE.width}px`)
				.style('height', `${NODE_SIZE.height}px`)
				.style('color', 'rgba(0, 0, 0, 1)')
				.text((d) => { return d.data.name })
				.on('click', click)

	let node_update = node_enter.merge(node)

	node_update.transition()
		.duration(DURATION)
		.attr('transform', (d) => { return `translate(${d.x}, ${d.y})` })

	node_update.select('rect.node')
		.attr('width', NODE_SIZE.width)
		.attr('height', NODE_SIZE.height)
		.style('stroke', (d) => { return d._children ? 'rgb(136, 136, 136)' : '#fff' })

	let node_exit = node.exit().transition()
		.duration(DURATION)
		.attr('transform', (d) => {
			return `translate(${source.x}, ${source.y})`
		})
		.remove()

	node_exit.select('rect')
		.attr('x', 0)
		.attr('y', 0)
		.attr('width', 0)
		.attr('height', 0)

	node_exit.select('foreignObject p')
		.style('color', 'rgba(0, 0, 0, 0)')
}

function click(d) {
	if (d.children) {
		d._children = d.children
		d.children = null
	} else {
		d.children = d._children
		d._children = null
	}
	update(d)
}

function updateLinks(source, links) {
	let link = blackboard.selectAll('path.link')
		.data(links, (d) => { return d.id })

	let link_enter = link.enter().append('path')
		.attr('class', 'link')
		.attr('d', (d) => {
			let o = { x: source.x0, y: source.y0 }
			return diagonal(o, o)
		})

	let link_update = link_enter.merge(link)

	link_update.transition()
		.duration(DURATION)
		.attr('d', (d) => {
			let s = { x: d.parent.x, y: d.parent.y + NODE_SIZE.height / 2 }
			let t = { x: d.x, y: d.y - NODE_SIZE.height / 2 }
			return diagonal(s, t)
		})

	let link_exit = link.exit().transition()
		.duration(DURATION)
		.attr('d', (d) => {
			let o = { x: source.x, y: source.y }
			return diagonal(o, o)
		})
		.remove()
}

function diagonal(s, t) {
	return `M ${s.x} ${s.y}
					C ${s.x} ${(s.y + t.y) / 2}
						${t.x} ${(s.y + t.y) / 2}
						${t.x} ${t.y}`
}

function updateLabels(source, nodes) {
	let label = blackboard.selectAll('g.label')
		.data(nodes, (d) => { return d.id })

	let label_enter = label.enter().append('g')
		.attr('class', 'label')
		.attr('transform', (d) => { return `translate(${source.x0}, ${source.y0})` })

	label_enter.append('text')
		.attr('y', -(NODE_SIZE.height / 2 + 5))
		.attr('text-anchor', 'middle')
		.text((d) => { return `${current_key}: ${displayNumber(d.data[current_key])}` })

	let label_update = label_enter.merge(label)

	label_update.transition()
		.duration(DURATION)
		.attr('transform', (d) => { return `translate(${d.x}, ${d.y})` })

	let label_exit = label.exit().remove()
}

function updateColor() {
	blackboard.selectAll('g.node rect')
		.style('fill', (d) => {
			let percent = d.data[current_key] / root.data[current_key]
			let h = Math.floor((1 - percent) * 60 + 1e-6)
			if (percent < 1e-4)
				return 'white'
			else
				return hsv2rgb(h, 1, 1)
		})
}

function onUpdateKey(key) {
	current_key = key
	d3.selectAll('g.label text')
		.text((d) => { return `${current_key}: ${displayNumber(d.data[current_key])}` })
	if (blackboard)
		updateColor()
}

function displayNumber(number) {
	// Integer
	if (number % 1 === 0)
		return number
	else if (number > 0.001)
		return number.toFixed(3)
	else
		return number.toExponential(2)
}

