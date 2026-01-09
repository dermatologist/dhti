import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('conch', () => {
  it('runs conch cmd', async () => {
    const {stdout} = await runCommand('conch')
    expect(stdout).to.contain('Please provide a name for the conch')
  })

  it('runs conch cmd with --dry-run flag', async () => {
    const {stdout} = await runCommand(['conch', 'install', '-n', 'test-conch', '--dry-run'])
    expect(stdout).to.contain('[DRY RUN]')
    // expect(stdout).to.contain('Would copy resources from')
  })

  it('runs conch cmd with --subdirectory flag and --dry-run', async () => {
    const {stdout} = await runCommand([
      'conch',
      'install',
      '-n',
      'test-conch',
      '-g',
      'https://github.com/test/repo',
      '-s',
      'packages/conch1',
      '--dry-run',
    ])
    expect(stdout).to.contain('[DRY RUN]')
    expect(stdout).to.contain('Sparse checkout: packages/conch1')
  })

  it('runs conch cmd without --subdirectory flag and --dry-run', async () => {
    const {stdout} = await runCommand([
      'conch',
      'install',
      '-n',
      'test-conch',
      '-g',
      'https://github.com/test/repo',
      '--dry-run',
    ])
    expect(stdout).to.contain('[DRY RUN]')
    expect(stdout).to.not.contain('Sparse checkout')
  })
})
