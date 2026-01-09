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

  it('runs elixir cmd with --subdirectory flag and --dry-run', async () => {
    const {stdout} = await runCommand([
      'elixir',
      'install',
      '-n',
      'test-elixir',
      '-g',
      'https://github.com/test/repo',
      '-s',
      'packages/elixir1',
      '--dry-run',
    ])
    expect(stdout).to.contain('[DRY RUN]')
    expect(stdout).to.contain('subdirectory = "packages/elixir1"')
  })

  it('runs elixir cmd without --subdirectory flag and --dry-run', async () => {
    const {stdout} = await runCommand([
      'elixir',
      'install',
      '-n',
      'test-elixir',
      '-g',
      'https://github.com/test/repo',
      '--dry-run',
    ])
    expect(stdout).to.contain('[DRY RUN]')
    expect(stdout).to.not.contain('subdirectory')
  })

  it('runs elixir cmd with --local flag and --dry-run', async () => {
    const {stdout} = await runCommand([
      'elixir',
      'install',
      '-n',
      'test-elixir',
      '-l',
      '/path/to/local/elixir',
      '--dry-run',
    ])
    expect(stdout).to.contain('[DRY RUN]')
    expect(stdout).to.contain('path = "/path/to/local/elixir"')
  })

  it('runs elixir cmd with relative --local flag and --dry-run', async () => {
    const {stdout} = await runCommand([
      'elixir',
      'install',
      '-n',
      'test-elixir',
      '-l',
      './local-elixir',
      '--dry-run',
    ])
    expect(stdout).to.contain('[DRY RUN]')
    expect(stdout).to.contain('path =')
  })
})
