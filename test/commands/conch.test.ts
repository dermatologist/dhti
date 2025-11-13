import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('conch', () => {
  it('runs conch cmd', async () => {
    const {stdout} = await runCommand('conch')
    expect(stdout).to.contain('Please provide a name for the conch')
  })

  it('runs conch cmd with --dry-run flag', async () => {
    const {stdout} = await runCommand(['conch', 'install', '-n', 'test-conch', '--dry-run'])
    expect(stdout).to.contain('[DRY RUN]')
    expect(stdout).to.contain('Would create directory')
  })
})
