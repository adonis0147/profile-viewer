const {app, BrowserWindow} = require('electron')
const path = require('path')

let win

function createWindow() {
	win = new BrowserWindow({width: 800, height: 600})
	win.loadURL(path.join('file://', __dirname, '..', 'index.html'))
}

app.on('ready', createWindow)

