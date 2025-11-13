import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('mimic', () => {
  it('runs mimic cmd', async () => {
    const {stdout} = await runCommand('mimic')
  })

  it('runs mimic cmd with --dry-run flag', async () => {
    const {stdout} = await runCommand(['mimic', '--dry-run'])
    expect(stdout).to.contain('[DRY RUN]')
    expect(stdout).to.contain('Would send POST request')
    expect(stdout).to.contain('Request headers')
  })

})
