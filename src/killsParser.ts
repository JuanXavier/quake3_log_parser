import * as fs from 'fs'
import * as readline from 'readline'

const modTranslations: any = {
	MOD_UNKNOWN: 'Unknown kill',
	MOD_SHOTGUN: 'Shotgun',
	MOD_GAUNTLET: 'Gauntlet',
	MOD_MACHINEGUN: 'Machine Gun',
	MOD_GRENADE: 'Grenade',
	MOD_GRENADE_SPLASH: 'Grenade Splash',
	MOD_ROCKET: 'Rocket',
	MOD_ROCKET_SPLASH: 'Rocket Splash',
	MOD_PLASMA: 'Plasma Gun',
	MOD_PLASMA_SPLASH: 'Plasma Splash',
	MOD_RAILGUN: 'Railgun',
	MOD_LIGHTNING: 'Lightning Gun',
	MOD_BFG: 'BFG10k',
	MOD_BFG_SPLASH: 'BFG Splash',
	MOD_WATER: 'Drowned',
	MOD_SLIME: 'Killed by slime',
	MOD_LAVA: 'Killed by lava',
	MOD_CRUSH: 'Crushed',
	MOD_TELEFRAG: 'Telefragged',
	MOD_FALLING: 'Falling to death',
	MOD_SUICIDE: 'Suicide',
	MOD_TARGET_LASER: 'Target laser',
	MOD_TRIGGER_HURT: 'Killed by environment',
	MOD_NAIL: 'Nailgun',
	MOD_CHAINGUN: 'Chaingun',
	MOD_PROXIMITY_MINE: 'Proximity Mine',
	MOD_KAMIKAZE: 'Kamikaze',
	MOD_JUICED: 'Juiced',
	MOD_GRAPPLE: 'Grapple',
}

const writeToLogFile = (output: string) => {
	fs.appendFile('./logs/kills_parsed.log', output + '\n', (err) => {
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
