import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('elixir', () => {
  it('runs elixir cmd', async () => {
    const {stdout} = await runCommand('elixir')
    expect(stdout).to.contain('Please provide a name for the conch')
  })
})
