import * as fs from 'fs'
import * as readline from 'readline'
import { modTranslations } from './utils/modTranslations'

const writeToLogFile = (output: string) => {
	fs.appendFile('./output/Kills_parsed.log', output + '\n', (err) => {
		if (err) throw err
	})
}

const parseLogFile = async (filePath: string) => {
	const fileStream = fs.createReadStream(filePath)
	const rl = readline.createInterface({
		input: fileStream,
		crlfDelay: Infinity,
	})
	for await (const line of rl) if (line.includes('Kill')) parseKillLine(line)
	console.log('Successfully written to /output/Kills_parsed.log')
}

const parseKillLine = (line: string) => {
	const killRegex = /(\d+:\d+) Kill: (\d+) (\d+) (\d+): (.+) killed (.+) by (.+)/
	const match = line.match(killRegex)

	if (match !== null) {
		const time = match[1]
		const killer = match[5]
		const victim = match[6]
		const mod = modTranslations[match[7]]
		let output: any

		if (killer === '<world>' && mod === 'Falling to death') {
			output = `At ${time}, the player "${victim}" died because he was wounded and fell from a height enough to kill him.`
		} else if (killer === '<world>' && mod === 'Killed by environment') {
			output = `At ${time}, the player "${victim}" died because the environment killed him.`
		} else output = `At ${time}, the player "${killer}" killed the player "${victim}" using ${mod}`
		writeToLogFile(output)
	} else return null
}

parseLogFile('./logs/Quake.log')
