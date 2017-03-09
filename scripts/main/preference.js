const {BrowserWindow, ipcMain} = require('electron')
const path = require('path')

let win

exports.openWindow = function(main_win) {
	win = new BrowserWindow({
		height: 200,
		parent: main_win,
		modal: true,
		show: false,
		movable: false,
		resizable: false,
		minimizable: false,
		autoHideMenuBar: true,
	})
	win.loadURL(path.join('file://', __dirname, '..', '..', 'pages', 'preference.html'))
	win.once('ready-to-show', () => {
		win.show()
	})
}

ipcMain.on('closePreferenceWindow', (event, arg) => {
	win.close()
})

