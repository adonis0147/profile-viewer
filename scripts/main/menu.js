const {app, Menu, MenuItem} = require('electron')
const viewer = require('./viewer.js')

const template = [
	{
		label: 'File',
		submenu: [
			{
				label: 'Open',
				accelerator: 'CmdOrCtrl+O',
				click() { viewer.openFile() }
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
			click() { viewer.openFile() }
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

let main_win

exports.init = (win) => {
	main_win = win
	viewer.init(win)

	const menu = Menu.buildFromTemplate(template)
	Menu.setApplicationMenu(menu)
}

