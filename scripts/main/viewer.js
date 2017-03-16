const {dialog, ipcMain} = require('electron')
const fs = require('fs')
const {logger} = require('./logger.js')

let main_win

exports.init = function(win) {
	main_win = win
}

const SORT_BY_KEYS = [
	'total time',
	'time per call',
	'calls',
]
exports.SORT_BY_KEYS = SORT_BY_KEYS

let profile_data
exports.session = session = {
	current_key: SORT_BY_KEYS[0],
}

exports.openFile = function() {
	dialog.showOpenDialog(
		{
			filters: [
				{ name: 'Profile Data', extensions: ['json'] },
			]
		},
		(filenames) => {
			if (filenames === undefined)
				return

			let filename = filenames[0]

			logger.info(`Load profile data - ${filename}`)

			fs.readFile(filename, 'utf-8', (err, data) => {
				try {
					let raw_data = JSON.parse(data)
					profile_data = parse(raw_data)
					session.list_data = getListDataByKey(profile_data, session.current_key)
					session.list_data.sort(compare)
					main_win.webContents.send('loadProfileData', session.list_data)
				} catch(exception) {
					dialog.showErrorBox('Load Profile Data Error', exception.message)
				}
			})
		}
	)
}

function parse(data) {
	for (let name in data) {
		calAverageTime(data[name])
	}

	let profile_data = {
		'data': data,
		'calls': 0,
		'total time': 0,
		'time per call': 0,
	}

	for (let name in data) {
		profile_data['calls'] += data[name]['calls']
		profile_data['total time'] += data[name]['total time']
		profile_data['time per call'] += data[name]['time per call']
	}
	return profile_data
}

function calAverageTime(data) {
	data['time per call'] = data['total time'] / (data['calls'] + 1e-6)
	if (data.children) {
		data.children.forEach(calAverageTime)
	}
}

function getListDataByKey(profile_data, key) {
	list_data = []
	for (let name in profile_data.data) {
		list_data.push({
			'name': name,
			'percent': profile_data.data[name][key] / profile_data[key]
		})
	}
	return list_data
}

function compare(a, b) {
	if (Math.abs(a.percent - b.percent) > 1e-4)
		return b.percent - a.percent
	else if (a.name < b.name)
		return -1
	else if (a.name > b.name)
		return 1
	else
		return 0
}

ipcMain.on('viewData', (event, name) => {
	session.current_data = name
	logger.info(`View data - ${name}`)
	data = profile_data.data[name]
	event.sender.send('viewData', session.current_key, data)
})

ipcMain.on('changeKey', (event, index) => {
	session.current_key = SORT_BY_KEYS[index]
	logger.info(`Change key: ${session.current_key}`)
	if (!profile_data) {
		logger.info('Profile data not loaded')
		return
	}

	session.list_data = getListDataByKey(profile_data, session.current_key)
	session.list_data.sort(compare)
	event.sender.send('changeKey', session.list_data, session.current_key)
})

