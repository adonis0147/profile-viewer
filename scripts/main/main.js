const {app, BrowserWindow} = require('electron')
const path = require('path')
const fs = require('fs')
const os = require('os')
const menu = require('./menu.js')
const preference = require('./preference.js')
const viewer = require('./viewer.js')

let win
let config_file = path.join(os.homedir(), '.viewer_config.json')

app.on('ready', createWindow)

app.on('window-all-closed', () => {
	app.quit()
})

function createWindow() {
	win = new BrowserWindow({
		width: 1000,
		height: 600,
	})
	win.loadURL(path.join('file://', __dirname, '..', '..', 'pages', 'index.html'))
	menu.init(win, config_file)
	viewer.init(win, config_file)
	configure()
}

function configure() {
	let exists = fs.existsSync(config_file)
	if (!exists) {
		let default_config = {
			'proto path': '',
		}
		fs.writeFileSync(config_file, JSON.stringify(default_config, null, 2))
	}

	let config = JSON.parse(fs.readFileSync(config_file))
	if (!config['proto path'])
		preference.openWindow(win, config_file)
}

