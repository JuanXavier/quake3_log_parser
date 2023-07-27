import * as chai from 'chai'
import 'mocha'
import { parsePlayerName, parseKillLine, computePlayerRankings } from '../src/killsPerGame'

const expect = chai.expect
const playerInput = `20:34 ClientUserinfoChanged: 2 n\\Isgalamido\\t\\0\\model\\xian/default\\hmodel\\xian/default\\g_redteam\\\\g_blueteam\\\\c1\\4\\c2\\5\\hc\\100\\w\\0\\l\\0\\tt\\0\\tl\\0`
const playerName = 'Isgalamido'
const playerKillerInput = `2:22 Kill: 3 2 10: Isgalamido killed Dono da Bola by MOD_RAILGUN`
const worldKillerInput = `2:00 Kill: 1022 3 22: <world> killed Isgalamido by MOD_TRIGGER_HURT`

describe('Quake Log Parser Tests', function () {
	describe("Parsing the player's name (parsePlayerName)", function () {
		it('Should extract the player name from the line if there it contains `ClientUserinfoChanged`', function () {
			const result = parsePlayerName(playerInput)
			expect(result).to.deep.equal(playerName)
		})

		it('Should not extract the player name from the line if there is no `ClientUserinfoChanged`', function () {
			const result = parsePlayerName(playerKillerInput)
			expect(result).to.deep.equal(null)
		})
	})

	describe('parseKillLine', function () {
		it('Should decrement kills correctly when <world> is killer', function () {
			const result = parseKillLine(worldKillerInput)
			expect(result).to.deep.equal(-1)
		})

		it('Should increment kills correctly when another player is killer', function () {
			const result = parseKillLine(playerKillerInput)
			expect(result).to.deep.equal(1)
		})
	})

	describe('computePlayerRankings', function () {
		it('Should calculate player rankings correctly', function () {
			const result = computePlayerRankings()
			const isGalamidoKills = 147
			expect(result[0].kills).to.deep.equal(isGalamidoKills)
		})
	})
})
