import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('elixir', () => {
  it('runs elixir cmd', async () => {
    const {stdout} = await runCommand('elixir')
    expect(stdout).to.contain('hello world')
  })

  it('runs elixir --name oclif', async () => {
    const {stdout} = await runCommand('elixir --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
