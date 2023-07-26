import fs from 'fs'

fs.readFile('./logs/Quake.log', 'utf8', (err, data) => {
	if (err) {
		console.error(err)
		return
	}
	console.log(data)
})
