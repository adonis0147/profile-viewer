const {app, BrowserWindow, ipcMain, Menu, dialog} = require('electron')
const path = require('path')
const fs = require('fs')

let win

function createWindow() {
	win = new BrowserWindow({
		width: 1000,
		height: 600,
	})
	win.loadURL(path.join('file://', __dirname, '..', 'pages', 'index.html'))
	setMenu()
}

app.on('ready', createWindow)

function setMenu() {
	const template = [
		{
			label: 'File',
			submenu: [
				{
					label: 'Open',
					accelerator: 'CmdOrCtrl+O',
					click() { openFile() }
				},
				{ type: 'separator' },
				{
					label: 'Preferences...',
					click() { openPreferenceWindow() }
				},
			],
		},
		{
			label: 'View',
			submenu: [
				{ role: 'reload' },
				{ role: 'forcereload' },
				{ role: 'toggledevtools' },
				{ type: 'separator' },
				{ role: 'togglefullscreen' },
			],
		},
		{
			role: 'window',
			submenu: [
				{ role: 'minimize' },
				{ role: 'close' },
			],
		},
		{
			role: 'help',
			submenu: [
				{
					label: 'Learn More',
					click () { require('electron').shell.openExternal('http://electron.atom.io') }
				},
			],
		},
	]

	if (process.platform === 'darwin') {
		template.unshift({
			label: app.getName(),
			submenu: [
				{ role: 'about' },
				{ type: 'separator' },
				{
					label: 'Preferences...',
					click() { openPreferenceWindow() }
				},
				{ type: 'separator' },
				{
					role: 'services',
					submenu: [],
				},
				{ type: 'separator' },
				{ role: 'hide' },
				{ role: 'hideothers' },
				{ role: 'unhide' },
				{ type: 'separator' },
				{ role: 'quit' },
			],
		})
		// File menu.
		template[1].submenu = [
			{
				label: 'Open',
				accelerator: 'CmdOrCtrl+O',
				click() { openFile() }
			},
		]
		// Window menu.
		template[3].submenu = [
			{
				label: 'Close',
				accelerator: 'CmdOrCtrl+W',
				role: 'close',
			},
			{
				label: 'Minimize',
				accelerator: 'CmdOrCtrl+M',
				role: 'minimize',
			},
			{
				label: 'Zoom',
				role: 'zoom',
			},
			{ type: 'separator', },
			{
				label: 'Bring All to Front',
				role: 'front',
			},
		]
	}

	const menu = Menu.buildFromTemplate(template)
	Menu.setApplicationMenu(menu)
}

let preference_win

function openPreferenceWindow() {
	preference_win = new BrowserWindow({
		height: 200,
		parent: win,
		modal: true,
		show: false,
	})
	preference_win.loadURL(path.join('file://', __dirname, '..', 'pages', 'preference.html'))
	preference_win.once('ready-to-show', () => {
		preference_win.show()
	})
}

ipcMain.on('closePreferenceWindow', (event, arg) => {
	preference_win.close()
})

let SORT_BY_KEYS = [
	'total time',
	'time per call',
	'calls',
]
let profile_data
let current_key
let current_view_data

function openFile() {
	dialog.showOpenDialog(
		{
			filters: [
				{ name: 'Profile Data', extensions: ['json'] },
			]
		},
		(filenames) => {
			if (filenames === undefined)
				return
			fs.readFile(filenames[0], 'utf-8', (err, data) => {
				try {
					let raw_data = JSON.parse(data)
					profile_data = parse(raw_data)
					current_key = SORT_BY_KEYS[0]
					list_data = getListDataByKey(profile_data, current_key)
					list_data.sort((a, b) => { return a.percent < b.percent })
					win.webContents.send('loadProfileData', { 'key': current_key, 'list_data': list_data })
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
	}

	for (let name in data) {
		profile_data['calls'] += data[name]['calls']
		profile_data['total time'] += data[name]['total time']
	}
	profile_data['time per call'] = profile_data['total time'] / profile_data['calls']
	return profile_data
}

function calAverageTime(data) {
	data['time per call'] = data['total time'] / data['calls']
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

ipcMain.on('viewData', (event, name) => {
	current_view_data = profile_data.data[name]
	event.sender.send('viewData', current_view_data)
})

ipcMain.on('loadCurrentData', (event, name) => {
	if (profile_data === undefined)
		return

	event.sender.send('loadCurrentData', {
		'key': current_key,
		'list_data': getListDataByKey(profile_data, current_key),
		'view_name': current_view_data && current_view_data.name
	})
})

