import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('conch', () => {
  it('runs conch cmd', async () => {
    const {stdout} = await runCommand('conch')
    expect(stdout).to.contain('hello world')
  })

  it('runs conch --name oclif', async () => {
    const {stdout} = await runCommand('conch --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
