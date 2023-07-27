// Import the file system module to read and write files
import * as fs from 'fs'
// Import the readline module to read the log file line by line
import * as readline from 'readline'
// Import the modTranslations object from a separate module
import { modTranslations } from './utils/modTranslations'

// This function appends a line to the output log file
export const writeToLogFile = (output: string) => {
	fs.appendFile('./output/Kills_parsed.log', output + '\n', (err) => {
		if (err) throw err // If there's an error, throw it
	})
}

// This function reads the log file line by line and processes each line
export const parseLogFile = async (filePath: string) => {
	// Create a readable stream from the log file
	const fileStream = fs.createReadStream(filePath)

	// Create a readline interface to read the stream line by line
	const rl = readline.createInterface({
		input: fileStream,
		crlfDelay: Infinity,
	})

	// For each line in the log file, // If the line contains a kill event, process it
	for await (const line of rl) if (line.includes('Kill')) parseKillLine(line)

	// After all lines have been processed, log a success message
	console.log('Successfully written to output/Kills_parsed.log')
}

// This function processes a line from the log file
export const parseKillLine = (line: string) => {
	// This regular expression matches the format of a kill event in the log file
	const killRegex = /(\d+:\d+) Kill: (\d+) (\d+) (\d+): (.+) killed (.+) by (.+)/
	// Use the regular expression to extract information from the line
	const match = line.match(killRegex)

	// If the line matches the regular expression...
	if (match !== null) {
		// Extract the time, killer, victim, and kill method from the line
		const time = match[1]
		const killer = match[5]
		const victim = match[6]
		const mod = modTranslations[match[7]]
		let output

		// Generate a human-readable string describing the kill event
		if (killer === '<world>' && mod === 'Falling to death') {
			output = `At ${time}, the player "${victim}" died because he was wounded and fell from a height enough to kill him.`
		} else if (killer === '<world>' && mod === 'Killed by environment') {
			output = `At ${time}, the player "${victim}" died because the environment killed him.`
		} else {
			output = `At ${time}, the player "${killer}" killed the player "${victim}" using ${mod}`
		}

		// Write the string to the output log file
		writeToLogFile(output)
		return output
	} else {
		return null // If the line doesn't match the regular expression, return null
	}
}

// Start the process by parsing the log file
parseLogFile('./logs/Quake.log')
