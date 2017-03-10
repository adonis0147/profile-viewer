const {Menu, MenuItem} = remote
const {SORT_BY_KEYS} = remote.require('../main/viewer.js')

const menu = new Menu()

for (let i = 0; i < SORT_BY_KEYS.length; ++ i) {
	menu.append(new MenuItem({
		label: `view ${SORT_BY_KEYS[i]}`,
		type: 'checkbox',
		click() {
			menu.items.forEach((d) => { d.checked = (d.id == i) })
			ipcRenderer.send('changeKey', i)
		},
		id: i,
	}))
}

if (!session.current_key)
	menu.items[0].checked = true
else
	menu.items.forEach((d) => { d.checked = (SORT_BY_KEYS[d.id] == session.current_key)})

d3.select(window).on('contextmenu', () => {
	if (d3.event.clientX < 280)
		return

	d3.event.preventDefault()
	menu.popup(remote.getCurrentWindow())
})

