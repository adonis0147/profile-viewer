const {BrowserWindow, ipcMain, dialog} = require('electron')
const path = require('path')
const fs = require('fs')
const {logger} = require('./logger.js')

let win
let config_file

exports.openWindow = function(main_win, file) {
	win = new BrowserWindow({
		width: 480,
		height: 130,
		parent: main_win,
		modal: true,
		show: false,
		movable: false,
		resizable: false,
		minimizable: false,
		autoHideMenuBar: true,
	})
	config_file = file

	win.loadURL(path.join('file://', __dirname, '..', '..', 'pages', 'preference.html'))
	win.once('ready-to-show', () => {
		win.show()
	})
}

ipcMain.on('loadConfig', (event) => {
	config = JSON.parse(fs.readFileSync(config_file, 'utf-8'))
	event.sender.send('loadConfig', config)
})

ipcMain.on('changeProtoPath', (event, proto_path) => {
	config = JSON.parse(fs.readFileSync(config_file, 'utf-8'))
	config['proto path'] = proto_path
	fs.writeFile(config_file, JSON.stringify(config, null, 2), 'utf-8', (err) => {
		if (err) {
			dialog.showErrorBox('Load Profile Data Error', err.message)
			return
		}
		logger.info(`Change proto path: ${proto_path}`)
		win.close()
	})
})

