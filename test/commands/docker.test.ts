import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('docker', () => {
  it('runs docker cmd', async () => {
    const {stdout} = await runCommand('docker')
    expect(stdout).to.contain('Please provide a name for the container')
  })

  it('runs docker cmd with --dry-run flag', async () => {
    const {stdout} = await runCommand(['docker', '--dry-run', '-u'])
    expect(stdout).to.contain('[DRY RUN]')
    expect(stdout).to.contain('Would execute')
    expect(stdout).to.contain('docker compose')
  })

  it('runs docker cmd with --restart flag and --dry-run', async () => {
    const {stdout} = await runCommand(['docker', '--restart', 'test-container', '--dry-run'])
    expect(stdout).to.contain('[DRY RUN]')
    expect(stdout).to.contain('Would execute')
    expect(stdout).to.contain('docker restart test-container')
  })

  it('runs docker cmd with --gateway flag and --dry-run', async () => {
    const {stdout} = await runCommand(['docker', '--gateway', '--dry-run'])
    expect(stdout).to.contain('[DRY RUN]')
    expect(stdout).to.contain('Would execute')
    expect(stdout).to.contain('docker restart dhti-gateway-1')
  })

  it('runs docker cmd with -g flag and --dry-run', async () => {
    const {stdout} = await runCommand(['docker', '-g', '--dry-run'])
    expect(stdout).to.contain('[DRY RUN]')
    expect(stdout).to.contain('Would execute')
    expect(stdout).to.contain('docker restart dhti-gateway-1')
  })

  it('runs docker cmd with -r flag and --dry-run', async () => {
    const {stdout} = await runCommand(['docker', '-r', 'my-container', '--dry-run'])
    expect(stdout).to.contain('[DRY RUN]')
    expect(stdout).to.contain('Would execute')
    expect(stdout).to.contain('docker restart my-container')
  })

  it('rejects when both --gateway and --restart are provided', async () => {
    const {error} = await runCommand(['docker', '--gateway', '--restart', 'test-container'])
    expect(error?.oclif?.exit).to.equal(1)
  })

  it('rejects invalid container names with special characters', async () => {
    const {error} = await runCommand(['docker', '--restart', 'test@container', '--dry-run'])
    expect(error?.oclif?.exit).to.equal(1)
  })

  it('rejects invalid container names with dollar signs', async () => {
    const {error} = await runCommand(['docker', '--restart', 'test$container', '--dry-run'])
    expect(error?.oclif?.exit).to.equal(1)
  })

})
