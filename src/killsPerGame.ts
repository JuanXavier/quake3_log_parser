// Import the file system module to read and write files
import * as fs from 'fs'
// Import the readline module to read the log file line by line
import * as readline from 'readline'

// Initialize variables to store the current game number and game data
export let currentGame: any = 0
export let games: any = {}

// This function extracts a player's name from a line in the log file
export const parsePlayerName = (line: any) => {
	const regex = /n\\([^\\]+)/
	const match = line.match(regex)

	if (match !== null) {
		const playerName = match[1]

		// If the player is not already in the current game's player list, add them
		if (!games[`game_${currentGame}`].players.includes(playerName) && playerName != null) {
			games[`game_${currentGame}`].players.push(playerName)
		}
		return playerName
	}
	return null
}

// This function processes a line from the log file that contains a kill event
export const parseKillLine = (line: string) => {
	const killRegex = /(\d+:\d+) Kill: (\d+) (\d+) (\d+): (.+) killed (.+) by (.+)/
	const match = line.match(killRegex)

	if (match !== null) {
		const killer = match[5]
		const victim = match[6]

		// If the killer and victim are not already in the current game's player list, add them
		if (killer !== '<world>' && !games[`game_${currentGame}`].players.includes(killer)) {
			games[`game_${currentGame}`].players.push(killer)
		}
		if (!games[`game_${currentGame}`].players.includes(victim)) {
			games[`game_${currentGame}`].players.push(victim)
		}

		// Increment the total kill count for the current game
		games[`game_${currentGame}`].total_kills++

		// Update the kill count for the killer or victim
		if (killer !== '<world>') {
			games[`game_${currentGame}`].kills[killer] = (games[`game_${currentGame}`].kills[killer] || 0) + 1
			return 1
		} else {
			games[`game_${currentGame}`].kills[victim] = (games[`game_${currentGame}`].kills[victim] || 0) - 1
			return -1
		}
	}
}

// This function reads the log file line by line and processes each line
export const getKillData = async (filePath: string) => {
	const fileStream = fs.createReadStream(filePath)
	const rl = readline.createInterface({
		input: fileStream,
		crlfDelay: Infinity,
	})

	// For each line in the log file...
	for await (const line of rl) {
		if (line.includes('ClientUserinfoChanged')) parsePlayerName(line)
		else if (line.includes('Kill')) parseKillLine(line)
		else if (line.includes('InitGame')) {
			// If a new game starts, increment the current game number and initialize its data
			currentGame++
			games[`game_${currentGame}`] = {
				total_kills: 0,
				players: [],
				kills: {},
			}
		}
	}

	// After parsing is complete, compute player rankings
	const playerRankings = computePlayerRankings()

	// Create the output object
	const output = {
		games: games,
		player_rankings: playerRankings,
	}

	// Write the output to a JSON file
	fs.writeFile('./output/Kills_per_game.json', JSON.stringify(output, null, 2), (err) => {
		if (err) console.error('Error writing file: ', err)
		else console.log('Successfully written to output/Kills_per_game.json')
	})
}

// This function computes player rankings based on kill counts
export const computePlayerRankings = () => {
	const playerRankings: any = {}

	// For each game...
	for (let gameNumber = 1; gameNumber <= currentGame; gameNumber++) {
		const gameData = games[`game_${gameNumber}`]

		// For each player in the game...
		for (const playerName of gameData.players) {
			const totalKills = gameData.kills[playerName] || 0

			// Update the player's total kill count across all games
			playerRankings[playerName] = (playerRankings[playerName] || 0) + totalKills
		}
	}

	// Convert the playerRankings object to an array of { playerName, kills } objects
	const rankingsArray = Object.entries(playerRankings).map(([playerName, kills]) => ({ playerName, kills }))

	// Sort the rankingsArray in descending order of kills
	rankingsArray.sort((a: any, b: any) => b.kills - a.kills)

	return rankingsArray
}

// Start the process by parsing the log file
getKillData('./logs/Quake.log')
