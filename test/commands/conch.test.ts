import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('conch', () => {
  it('runs conch cmd', async () => {
    const {stdout} = await runCommand('conch')
    expect(stdout).to.contain('Please provide a name for the conch')
  })
})
