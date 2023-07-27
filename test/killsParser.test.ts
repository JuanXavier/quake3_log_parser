import * as chai from 'chai'
import 'mocha'
import { parseKillLine, parseLogFile } from '../src/killsParser'

const expect = chai.expect
const playerInput = `20:34 ClientUserinfoChanged: 2 n\\Isgalamido\\t\\0\\model\\xian/default\\hmodel\\xian/default\\g_redteam\\\\g_blueteam\\\\c1\\4\\c2\\5\\hc\\100\\w\\0\\l\\0\\tt\\0\\tl\\0`
const playerName = 'Isgalamido'

const playerKillerInput = `2:22 Kill: 3 2 10: Isgalamido killed Dono da Bola by MOD_RAILGUN`
const worldKillerInput = `2:00 Kill: 1022 3 22: <world> killed Isgalamido by MOD_TRIGGER_HURT`

const playerKillerOutput = 'At 2:22, the player "Isgalamido" killed the player "Dono da Bola" using Railgun'
const worldKillerOutput = 'At 2:00, the player "Isgalamido" died because the environment killed him.'

describe('Quake Log Killer Parser Tests', function () {
	describe('Parsing the player kills', function () {
		it('Parsing the kill lines and output in human-readable format when player is killer', function () {
			const result = parseKillLine(playerKillerInput)
			expect(result).to.deep.equal(playerKillerOutput)
		})

		it('Parsing the kill lines and output in human-readable format when world is killer', function () {
			const result = parseKillLine(worldKillerInput)
			expect(result).to.deep.equal(worldKillerOutput)
		})

		it('Should not extract the player name from the line if there is no `kill`', function () {
			const result = parseKillLine(playerInput)
			expect(result).to.deep.equal(null)
		})
	})
})
