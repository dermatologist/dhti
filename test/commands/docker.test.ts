import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('docker', () => {
  it('runs docker cmd', async () => {
    const {stdout} = await runCommand('docker')
    expect(stdout).to.contain('Please provide a name for the conch')
  })

})
