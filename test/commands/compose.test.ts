import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('compose', () => {
  it('runs compose cmd', async () => {
    const {stdout} = await runCommand('compose')
    expect(stdout).to.contain('Writing file')
  })

})
