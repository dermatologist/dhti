import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('elixir', () => {
  it('runs elixir cmd', async () => {
    const {stdout} = await runCommand('elixir')
    expect(stdout).to.contain('Please provide a name for the elixir')
  })

  it('runs elixir cmd with --dry-run flag', async () => {
    const {stdout} = await runCommand(['elixir', 'install', '-n', 'test-elixir', '--dry-run'])
    expect(stdout).to.contain('[DRY RUN]')
    // expect(stdout).to.contain('Would copy resources from')
  })
})
