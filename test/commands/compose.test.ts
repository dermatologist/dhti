import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('compose', () => {
  it('runs compose cmd', async () => {
    const {stdout} = await runCommand('compose')
    expect(stdout).to.contain('Writing file')
  })

  it('runs compose cmd with --dry-run flag', async () => {
    const {stdout} = await runCommand(['compose', 'add', '-m', 'langserve', '--dry-run'])
    expect(stdout).to.contain('[DRY RUN]')
    expect(stdout).to.contain('Would add the following modules')
    expect(stdout).to.contain('langserve')
  })

})
