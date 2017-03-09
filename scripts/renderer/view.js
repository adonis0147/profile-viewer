const {ipcRenderer} = require('electron')

if (session.list_data)
	updateSidebar(session.list_data)
if (session.current_data)
	ipcRenderer.send('viewData', session.current_data)

function updateSidebar(list_data) {
	let sidebar = d3.select('#sidebar')
	let line_item = sidebar.selectAll('div.line-item')
		.data(list_data)

	line_item.enter().append('div')
		.attr('class', 'line-item')
		.text((d) => { return d.name })
		.on('click', function(d) {
			d3.selectAll('#sidebar div.line-item').classed('active', false)
			d3.select(this).classed('active', true)
			ipcRenderer.send('viewData', d.name)
		})
}

ipcRenderer.on('loadProfileData', (event, list_data) => {
	let names = list_data.map((e) => { return e.name })
	logger.info(`Got list data - [${names.join(', ')}]`)
	updateSidebar(list_data)
})

ipcRenderer.on('viewData', (event, key, data) => {
	view(data, key)
})

