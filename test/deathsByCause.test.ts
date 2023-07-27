import { expect } from 'chai'
import { parseLogFile } from '../src/deathsByCause' // Update the path to the correct location of logParser

describe('Deaths By Cause Test', () => {
	it('should correctly parse the log and generate the death report', async () => {
		// Expected report after parsing the log lines
		// prettier-ignore
		const expectedReport = {
			'Killed by environment': 386,
			'Rocket Splash': 698,
			'Falling to death': 90,
			'Rocket': 426,
			'Railgun': 264,
			'Machine Gun': 90,
			'Shotgun': 50,
			'Telefragged': 50,
			'BFG Splash': 48,
			'BFG10k': 32,
			'Crushed': 4,
		}

		// Process each log line and build the report
		const report = await parseLogFile('./logs/Quake.log')

		// Compare the generated report with the expected report
		expect(report).to.deep.equal(expectedReport)
	})
})
