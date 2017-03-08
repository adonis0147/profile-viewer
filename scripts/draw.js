const d3 = require('d3')
const {ipcRenderer} = require('electron')

let container = d3.select('#container')
container.style('min-width', container.style('width'))
container.style('min-height', container.style('height'))

let SVG_SIZE = {
	width: container.style('width').replace('px', ''),
	height: container.style('height').replace('px', ''),
}

let zoom = d3.zoom()
let blackboard = d3.select('#container').call(zoom)
	.append('g')
		.attr('transform', 'translate(0, 0)')

zoom.on('zoom', () => {
	blackboard.attr('transform', d3.event.transform)
})

let NODE_SIZE = {
	width : 150,
	height : 50,
}

let DURATION = 750
let VERTICAL_DISTANCE = 100
let RATIO = 0.15
let tree = d3.tree().nodeSize([NODE_SIZE.width + 20, NODE_SIZE.height])
let root
let i = 0

function collapse(d) {
	if (d.children) {
		d._children = d.children
		d.children.forEach(collapse)
		d.children = null
	}
}

function update(source) {
	let meta_data = tree(root)
	let nodes = meta_data.descendants()
	let links = meta_data.descendants().slice(1)

	nodes.forEach((d) => {
		d.x += SVG_SIZE.width / 2
		d.y = d.depth * VERTICAL_DISTANCE + SVG_SIZE.height * RATIO
	})

	updateNodes(source, nodes)
	updateLinks(source, links)

	nodes.forEach((d) => {
		d.x0 = d.x
		d.y0 = d.y
	})
}

function updateNodes(source, nodes) {
	let node = blackboard.selectAll('g.node')
		.data(nodes, (d) => { return d.id || (d.id = ++i) })

	let node_enter = node.enter().append('g')
		.attr('class', 'node')
		.attr('transform', (d) => { return `translate(${source.x0}, ${source.y0})` })
		.on('click', click)

	node_enter.append('rect')
		.attr('class', 'node')
		.attr('x', -NODE_SIZE.width / 2)
		.attr('y', -NODE_SIZE.height / 2)
		.attr('width', 0)
		.attr('height', 0)

	node_enter.append('text')
		.attr("dy", ".35em")
		.attr("text-anchor", "middle")
		.text((d) => {
			return d.data.name
		})

	let node_update = node_enter.merge(node)

	node_update.transition()
		.duration(DURATION)
		.attr('transform', (d) => { return `translate(${d.x}, ${d.y})` })

	node_update.select('rect.node')
		.attr('width', NODE_SIZE.width)
		.attr('height', NODE_SIZE.height)
		.style('stroke', (d) => { return d._children ? 'rgb(136, 136, 136)' : '#fff' })
		.attr('cursor', 'pointer')

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

	node_exit.select('text')
		.style('fill-opacity', 0)
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

ipcRenderer.on('loadProfileData', (event, arg) => {
	root = d3.hierarchy(arg, (d) => { return d.children })
	root.x0 = SVG_SIZE.width / 2
	root.y0 = SVG_SIZE.height * RATIO

	collapse(root)
	update(root)
})

