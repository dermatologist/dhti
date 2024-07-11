import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('synthetic', () => {
  it('runs synthetic cmd', async () => {
    const {stdout} = await runCommand('synthetic')
    expect(stdout).to.contain('Please provide a name for the elixir')
  })
})
