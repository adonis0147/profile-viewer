const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')

let win

function createWindow() {
	win = new BrowserWindow({width: 800, height: 600})
	win.loadURL(path.join('file://', __dirname, '..', 'index.html'))
}

app.on('ready', createWindow)

let tree_data = {
	"name": 'Top of level',
	"children": [
		{
			"name": "Level 2: A",
			"children": [
				{ "name": "Son of A" },
				{ "name": "Daughter of A" }
			]
		},
		{ "name": "Level 2: B" }
	]
};

ipcMain.on('getTreeData', (event, arg) => {
	event.sender.send('getTreeData', tree_data)
})

