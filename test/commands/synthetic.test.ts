import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('synthetic', () => {
  it('runs synthetic cmd', async () => {
    const {stdout} = await runCommand('synthetic')
    expect(stdout).to.contain('Please provide an output file')
  })

  it('runs synthetic cmd with --dry-run flag', async () => {
    const {stdout} = await runCommand(['synthetic', 'input.json', 'output.json', '--dry-run', '-m', '2', '-r', '5'])
    expect(stdout).to.contain('[DRY RUN]')
    expect(stdout).to.contain('Synthetic data generation simulation')
    expect(stdout).to.contain('Max records: 5')
  })
})
