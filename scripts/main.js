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
					let profile_data = JSON.parse(data)
					win.webContents.send('loadProfileData', profile_data)
				} catch(exception) {
					dialog.showErrorBox('Read Profile Data Error', exception.message)
				}
			})
		}
	)
}

