const {app, BrowserWindow} = require('electron')
const path = require('path')
const fs = require('fs')
const menu = require('./menu.js')

let win

function createWindow() {
	win = new BrowserWindow({
		width: 1000,
		height: 600,
	})
	win.loadURL(path.join('file://', __dirname, '..', '..', 'pages', 'index.html'))
	menu.init(win)
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
	app.quit()
})

