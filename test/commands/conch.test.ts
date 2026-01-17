import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('conch', () => {
  it('runs conch cmd without operation', async () => {
    try {
      await runCommand('conch')
    } catch (error: unknown) {
      const err = error as {message?: string}
      expect(err.message).to.contain('Invalid operation')
    }
  })

  it('runs conch init cmd with --dry-run flag', async () => {
    const {stdout} = await runCommand(['conch', 'init', '-n', 'test-conch', '-w', '/tmp/test-workdir', '--dry-run'])
    expect(stdout).to.contain('[DRY RUN]')
    expect(stdout).to.contain('npx degit dermatologist/openmrs-esm-dhti')
    expect(stdout).to.contain('/tmp/test-workdir/openmrs-esm-dhti')
    expect(stdout).to.contain('Copy')
    expect(stdout).to.contain('packages/esm-starter-app')
    expect(stdout).to.contain('packages/test-conch')
  })

  it('runs conch init cmd without name flag', async () => {
    try {
      await runCommand(['conch', 'init', '-w', '/tmp/test-workdir'])
    } catch (error: unknown) {
      const err = error as {message?: string}
      expect(err.message).to.contain('name flag is required')
    }
  })

  it('runs conch init cmd without workdir flag', async () => {
    try {
      await runCommand(['conch', 'init', '-n', 'test-conch', '-w', ''])
    } catch (error: unknown) {
      const err = error as {message?: string}
      expect(err.message).to.contain('workdir flag is required')
    }
  })

  it('runs conch start cmd with --dry-run flag', async () => {
    const {stdout} = await runCommand(['conch', 'start', '-n', 'test-conch', '-w', '/tmp/test-workdir', '--dry-run'])
    expect(stdout).to.contain('[DRY RUN]')
    expect(stdout).to.contain('yarn start')
  })

  it('runs conch start cmd without name flag', async () => {
    try {
      await runCommand(['conch', 'start', '-w', '/tmp/test-workdir'])
    } catch (error: unknown) {
      const err = error as {message?: string}
      expect(err.message).to.contain('name flag is required')
    }
  })

  it('runs conch start cmd without workdir flag', async () => {
    try {
      await runCommand(['conch', 'start', '-n', 'test-conch', '-w', ''])
    } catch (error: unknown) {
      const err = error as {message?: string}
      expect(err.message).to.contain('workdir flag is required')
    }
  })

  it('rejects conch start with non-existent directory', async () => {
    try {
      await runCommand(['conch', 'start', '-n', 'non-existent-app', '-w', '/non/existent/path'])
    } catch (error: unknown) {
      const err = error as {message?: string}
      expect(err.message).to.contain('Directory does not exist')
    }
  })

  it('rejects invalid operation', async () => {
    try {
      await runCommand(['conch', 'invalid-op', '-n', 'test-conch'])
    } catch (error: unknown) {
      const err = error as {message?: string}
      expect(err.message).to.contain('Invalid operation')
    }
  })

  it('runs conch start cmd with single --sources flag', async () => {
    const {stdout} = await runCommand([
      'conch',
      'start',
      '-n',
      'test-conch',
      '-w',
      '/tmp/test-workdir',
      '-s',
      'packages/esm-chatbot-agent',
      '--dry-run',
    ])
    expect(stdout).to.contain('[DRY RUN]')
    expect(stdout).to.contain("--sources 'packages/esm-chatbot-agent'")
  })

  it('runs conch start cmd with multiple --sources flags', async () => {
    const {stdout} = await runCommand([
      'conch',
      'start',
      '-n',
      'test-conch',
      '-w',
      '/tmp/test-workdir',
      '-s',
      'packages/esm-chatbot-agent',
      '-s',
      'packages/esm-another-app',
      '-s',
      'packages/esm-third-app',
      '--dry-run',
    ])
    expect(stdout).to.contain('[DRY RUN]')
    expect(stdout).to.contain("--sources 'packages/esm-chatbot-agent'")
    expect(stdout).to.contain("--sources 'packages/esm-another-app'")
    expect(stdout).to.contain("--sources 'packages/esm-third-app'")
    expect(stdout).to.contain('yarn start')
  })

  it('runs conch install cmd with multiple --sources flags and shows warning', async () => {
    const {stdout} = await runCommand([
      'conch',
      'install',
      '-n',
      'test-conch',
      '-w',
      '/tmp/test-workdir',
      '-s',
      'packages/esm-chatbot-agent',
      '-s',
      'packages/esm-another-app',
      '--dry-run',
    ])
    expect(stdout).to.contain('[DRY RUN]')
    expect(stdout).to.contain('Would execute install operation')
  })

  it('correctly builds start command with multiple sources in output', async () => {
    const {stdout} = await runCommand([
      'conch',
      'start',
      '-n',
      'test-app',
      '-w',
      '/tmp/test-dir',
      '-s',
      'packages/app1',
      '-s',
      'packages/app2',
      '--dry-run',
    ])
    expect(stdout).to.contain("--sources 'packages/app1'")
    expect(stdout).to.contain("--sources 'packages/app2'")
    // Verify the command is built correctly in sequence
    const lines = stdout.split('\n')
    const yarnStartLine = lines.find((line) => line.includes('yarn start'))
    expect(yarnStartLine).to.exist
    if (yarnStartLine) {
      const sourcesCount = (yarnStartLine.match(/--sources/g) || []).length
      expect(sourcesCount).to.equal(2)
    }
  })
})
