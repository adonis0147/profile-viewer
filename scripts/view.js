const {remote} = require('electron')

ipcRenderer.send('loadCurrentData')

ipcRenderer.on('loadCurrentData', (event, arg) => {
	updateSidebar(arg.key, arg.list_data)
	if (arg.view_name) ipcRenderer.send('viewData', arg.view_name)
})

function updateSidebar(key, list_data) {
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

ipcRenderer.on('loadProfileData', (event, arg) => {
	key = arg.key
	list_data = arg.list_data
	updateSidebar(key, list_data)
})

