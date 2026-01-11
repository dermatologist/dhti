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
    expect(stdout).to.contain('npx degit openmrs/openmrs-esm-template-app')
    expect(stdout).to.contain('Copy resources from')
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
    expect(stdout).to.contain('npx openmrs develop')
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
})
