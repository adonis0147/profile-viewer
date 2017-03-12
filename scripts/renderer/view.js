const {ipcRenderer} = require('electron')

if (session.list_data)
	updateSidebar(session.list_data)
if (session.current_data)
	ipcRenderer.send('viewData', session.current_data)

function updateSidebar(list_data) {
	let sidebar = d3.select('#sidebar')

	let active = sidebar.select('div.line-item.active p')
	if (active.size()) current_data = active.text()
	else current_data = session.current_data

	sidebar.selectAll('div.line-item').remove()

	let line_item = sidebar.selectAll('div.line-item')
		.data(list_data, (d) => { return d.name })

	let line_item_enter = line_item.enter().append('div')
		.attr('class', 'line-item')
		.on('click', function(d) {
			d3.selectAll('#sidebar div.line-item').classed('active', false)
			d3.select(this).classed('active', true)
			ipcRenderer.send('viewData', d.name)
		})

	line_item_enter.append('div')
		.attr('class', 'percent')
		.text((d) => { return `${(d.percent * 100).toFixed(2)}%` })

	line_item_enter.append('p')
		.text((d) => { return d.name })

	sidebar.selectAll('div.line-item')
		.each(function(d) {
			if (current_data == d.name) {
				d3.select(this).classed('active', true)
			}
		})

	autoScroll()
}

function autoScroll() {
	let active_line_item = d3.select('div.line-item.active').node()
	if (!active_line_item) return

	d3.select('#sidebar').node().scrollTop = active_line_item.offsetTop
}

ipcRenderer.on('loadProfileData', (event, list_data) => {
	let names = list_data.map((d) => { return d.name })
	logger.info(`Got list data - [${names.join(', ')}]`)
	updateSidebar(list_data)
})

ipcRenderer.on('viewData', (event, key, data) => {
	view(data, key)
})

ipcRenderer.on('changeKey', (event, list_data, key) => {
	let names = list_data.map((d) => { return d.name })
	logger.info(`On change key: ${key} - [${names.join(', ')}]`)
	updateSidebar(list_data)
	onUpdateKey(key)
})

