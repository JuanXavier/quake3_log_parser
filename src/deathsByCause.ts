// Import the file system module to read and write files
import * as fs from 'fs'
// Import the readline module to read the log file line by line
import * as readline from 'readline'
// Import the modTranslations object from a separate module
import { modTranslations } from './utils/modTranslations'

// This object will store the report of deaths grouped by death cause
let report: any = {}

// This function reads the log file line by line and processes each line
const parseLogFile = async (filePath: string) => {
	// Create a readable stream from the log file
	const fileStream = fs.createReadStream(filePath)

	// Create a readline interface to read the stream line by line
	const rl = readline.createInterface({
		input: fileStream,
		crlfDelay: Infinity,
	})

	// For each line in the log file, if the line contains a kill event, process it
	for await (const line of rl) if (line.includes('Kill')) parseKillLine(line)

	// After all lines have been processed, write the report to a JSON file
	fs.writeFile('./output/Deaths_by_cause.json', JSON.stringify(report, null, 2), (err) => {
		if (err) throw err
		else console.log('Successfully written to output/Deaths_by_cause.json')
	})
}

// This function processes a line from the log file
const parseKillLine = (line: string) => {
	// This regular expression matches the format of a kill event in the log file
	const killRegex = /(\d+:\d+) Kill: (\d+) (\d+) (\d+): (.+) killed (.+) by (.+)/
	// Use the regular expression to extract information from the line
	const match = line.match(killRegex)
	// If the line matches the regular expression...
	if (match !== null) {
		const mod = modTranslations[match[7]]
		// Update the report object
		if (!report[mod]) report[mod] = 1
		else report[mod]++
	} else return null
}

// Call the main function
parseLogFile('./logs/Quake.log')
