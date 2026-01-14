import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('elixir', () => {
  it('runs elixir cmd', async () => {
    const {stdout} = await runCommand('elixir')
    expect(stdout).to.contain('Please provide a name for the elixir')
  })

  it('runs elixir init cmd with --dry-run flag', async () => {
    const {stdout} = await runCommand(['elixir', 'init', '-n', 'test-elixir', '-w', '/tmp/test-workdir', '--dry-run'])
    expect(stdout).to.contain('[DRY RUN]')
    expect(stdout).to.contain('npx degit dermatologist/dhti-elixir')
    expect(stdout).to.contain('/tmp/test-workdir/dhti-elixir')
    expect(stdout).to.contain('Copy')
    expect(stdout).to.contain('packages/starter')
    expect(stdout).to.contain('packages/test-elixir')
  })

  it('runs elixir init cmd without name flag', async () => {
    try {
      await runCommand(['elixir', 'init', '-w', '/tmp/test-workdir'])
    } catch (error: unknown) {
      const err = error as {message?: string}
      expect(err.message).to.contain('name flag is required')
    }
  })

  it('runs elixir init cmd without workdir flag', async () => {
    try {
      await runCommand(['elixir', 'init', '-n', 'test-elixir', '-w', ''])
    } catch (error: unknown) {
      const err = error as {message?: string}
      expect(err.message).to.contain('workdir flag is required')
    }
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
    const {stdout} = await runCommand(['elixir', 'install', '-n', 'test-elixir', '-l', './local-elixir', '--dry-run'])
    expect(stdout).to.contain('[DRY RUN]')
    expect(stdout).to.contain('path =')
  })

  it('rejects elixir install with non-existent local directory', async () => {
    try {
      await runCommand(['elixir', 'install', '-n', 'test-elixir', '-l', '/non/existent/path'])
    } catch (error: unknown) {
      const err = error as {message?: string}
      expect(err.message).to.contain('Local directory does not exist')
    }
  })

  it('runs elixir start cmd with --dry-run flag and --name flag', async () => {
    const {stdout} = await runCommand(['elixir', 'start', '-w', '/tmp/test-workdir', '-n', 'my-elixir', '--dry-run'])
    expect(stdout).to.contain('[DRY RUN]')
    expect(stdout).to.contain('npx degit dermatologist/cds-hooks-sandbox')
    expect(stdout).to.contain('/tmp/test-workdir/cds-hooks-sandbox')
    expect(stdout).to.contain('yarn install')
    expect(stdout).to.contain('yarn dhti')
    expect(stdout).to.contain('yarn dev')
    expect(stdout).to.contain('http://localhost:8001/langserve/my_elixir/cds-services')
  })

  it('runs elixir start cmd with custom --elixir and --fhir flags with --dry-run', async () => {
    const {stdout} = await runCommand([
      'elixir',
      'start',
      '-w',
      '/tmp/test-workdir',
      '--elixir',
      'http://custom:8001/cds-services',
      '--fhir',
      'http://custom-fhir.org/baseR4',
      '--dry-run',
    ])
    expect(stdout).to.contain('[DRY RUN]')
    expect(stdout).to.contain('http://custom:8001/cds-services')
    expect(stdout).to.contain('http://custom-fhir.org/baseR4')
  })

  it('runs elixir start cmd with --name flag and constructs elixir URL with --dry-run', async () => {
    const {stdout} = await runCommand([
      'elixir',
      'start',
      '-w',
      '/tmp/test-workdir',
      '-n',
      'test-name-with-dash',
      '--dry-run',
    ])
    expect(stdout).to.contain('[DRY RUN]')
    expect(stdout).to.contain('http://localhost:8001/langserve/test_name_with_dash/cds-services')
    expect(stdout).to.contain('http://hapi.fhir.org/baseR4')
  })

  it('rejects elixir start without --elixir and without --name', async () => {
    try {
      await runCommand(['elixir', 'start', '-w', '/tmp/test-workdir', '--dry-run'])
    } catch (error: unknown) {
      const err = error as {message?: string}
      expect(err.message).to.contain('Either --elixir or --name flag must be provided')
    }
  })

  it('runs elixir start cmd with --dry-run showing Docker setup commands', async () => {
    const {stdout} = await runCommand(['elixir', 'start', '-w', '/tmp/test-workdir', '-n', 'my-elixir', '--dry-run'])
    expect(stdout).to.contain('[DRY RUN]')
    expect(stdout).to.contain('Update docker-compose.yml')
    expect(stdout).to.contain('FHIR_BASE_URL=http://hapi.fhir.org/baseR4')
    expect(stdout).to.contain('docker restart dhti-langserve-1')
  })

  it('runs elixir start cmd with custom container and FHIR endpoint shown in dry-run', async () => {
    const {stdout} = await runCommand([
      'elixir',
      'start',
      '-w',
      '/tmp/test-workdir',
      '-n',
      'my-elixir',
      '-c',
      'custom-container',
      '--fhir',
      'http://custom-fhir:8080/R4',
      '--dry-run',
    ])
    expect(stdout).to.contain('[DRY RUN]')
    expect(stdout).to.contain('Update docker-compose.yml')
    expect(stdout).to.contain('FHIR_BASE_URL=http://custom-fhir:8080/R4')
    expect(stdout).to.contain('docker restart custom-container')
  })
})
