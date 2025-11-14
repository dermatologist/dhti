import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('docker', () => {
  it('runs docker cmd', async () => {
    const {stdout} = await runCommand('docker')
    expect(stdout).to.contain('Please provide a name for the container')
  })

  it('runs docker cmd with --dry-run flag', async () => {
    const {stdout} = await runCommand(['docker', '--dry-run', '-u'])
    expect(stdout).to.contain('[DRY RUN]')
    expect(stdout).to.contain('Would execute')
    expect(stdout).to.contain('docker compose')
  })

})
