import * as fs from 'fs'
import * as readline from 'readline'

let currentGame: any = 0
let games: any = {}

const parsePlayerName = (line: any) => {
	const regex = /n\\([^\\]+)/
	const match = line.match(regex)

	if (match !== null) {
		const playerName = match[1]

		if (!games[`game_${currentGame}`].players.includes(playerName) && playerName != null) {
			games[`game_${currentGame}`].players.push(playerName)
		}
		return match
	}
	return null
}

const parseKillLine = (line: string) => {
	const killRegex = /(\d+:\d+) Kill: (\d+) (\d+) (\d+): (.+) killed (.+) by (.+)/
	const match = line.match(killRegex)

	if (match !== null) {
		const killer = match[5]
		const victim = match[6]

		if (killer !== '<world>' && !games[`game_${currentGame}`].players.includes(killer)) {
			games[`game_${currentGame}`].players.push(killer)
		}

		if (!games[`game_${currentGame}`].players.includes(victim)) games[`game_${currentGame}`].players.push(victim)

		games[`game_${currentGame}`].total_kills++

		if (killer !== '<world>')
			games[`game_${currentGame}`].kills[killer] = (games[`game_${currentGame}`].kills[killer] || 0) + 1
		else games[`game_${currentGame}`].kills[victim] = (games[`game_${currentGame}`].kills[victim] || 0) - 1
	}
}

const getKillData = async (filePath: string) => {
	const fileStream = fs.createReadStream(filePath)
	const rl = readline.createInterface({
		input: fileStream,
		crlfDelay: Infinity,
	})

	for await (const line of rl) {
		if (line.includes('ClientUserinfoChanged')) parsePlayerName(line)
		else if (line.includes('Kill')) parseKillLine(line)
		else if (line.includes('InitGame')) {
			currentGame++ // New game starts
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

	// Write the output to the file
	fs.writeFile('./output/Kills_per_game.json', JSON.stringify(output, null, 2), (err) => {
		if (err) console.error('Error writing file: ', err)
		else console.log('Successfully written to kills_per_game.json')
	})
}

// Function to compute player rankings based on kill counts
const computePlayerRankings = () => {
	const playerRankings: any = {}

	for (let gameNumber = 1; gameNumber <= currentGame; gameNumber++) {
		const gameData = games[`game_${gameNumber}`]

		for (const playerName of gameData.players) {
			const totalKills = gameData.kills[playerName] || 0
			playerRankings[playerName] = (playerRankings[playerName] || 0) + totalKills
		}
	}

	// Convert playerRankings object to an array of { playerName, kills } objects
	const rankingsArray = Object.entries(playerRankings).map(([playerName, kills]) => ({ playerName, kills }))

	// Sort the rankingsArray in descending order of kills
	rankingsArray.sort((a: any, b: any) => b.kills - a.kills)
	return rankingsArray
}

getKillData('./logs/Quake.log')
