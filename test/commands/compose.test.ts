import {runCommand} from '@oclif/test'
import {expect} from 'chai'
// eslint-disable-next-line import/default
import yaml from 'js-yaml'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

describe('compose', () => {
  it('runs compose cmd', async () => {
    const {stdout} = await runCommand('compose')
    expect(stdout).to.contain('Writing file')
  })

  it('runs compose cmd with --dry-run flag', async () => {
    const {stdout} = await runCommand(['compose', 'add', '-m', 'langserve', '--dry-run'])
    expect(stdout).to.contain('[DRY RUN]')
    expect(stdout).to.contain('Would add the following modules')
    expect(stdout).to.contain('langserve')
  })

  describe('env operation', () => {
    let testComposeFile: string
    let testDir: string

    beforeEach(() => {
      // Create a temporary test directory
      testDir = path.join(os.tmpdir(), `dhti-test-${Date.now()}`)
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, {recursive: true})
      }

      testComposeFile = path.join(testDir, 'docker-compose.yml')

      // Create a minimal docker-compose.yml with langserve service
      const composeContent = {
        services: {
          langserve: {
            environment: ['EXISTING_VAR=old_value'],
            image: 'test:latest',
          },
        },
        version: '3.8',
      }

      fs.writeFileSync(testComposeFile, yaml.dump(composeContent), 'utf8')
    })

    afterEach(() => {
      // Clean up test files
      if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, {recursive: true})
      }
    })

    it('should error when --env flag is missing', async () => {
      const {stderr} = await runCommand(['compose', 'env', '-f', testComposeFile, '--value', 'test_value', '--dry-run'])
      expect(stderr).to.include('Error')
    })

    it('should error when --value flag is missing', async () => {
      const {stderr} = await runCommand(['compose', 'env', '-f', testComposeFile, '--env', 'TEST_VAR', '--dry-run'])
      expect(stderr).to.include('Error')
    })

    it('should error when service does not exist', async () => {
      const {stderr} = await runCommand([
        'compose',
        'env',
        '-f',
        testComposeFile,
        '-s',
        'nonexistent',
        '--env',
        'TEST_VAR',
        '--value',
        'test_value',
        '--dry-run',
      ])
      expect(stderr).to.include('Error')
    })

    it('should add new environment variable with --dry-run', async () => {
      const {stdout} = await runCommand([
        'compose',
        'env',
        '-f',
        testComposeFile,
        '--env',
        'NEW_VAR',
        '--value',
        'new_value',
        '--dry-run',
      ])
      expect(stdout).to.contain('[DRY RUN]')
      expect(stdout).to.contain('NEW_VAR')
      expect(stdout).to.contain('new_value')
      expect(stdout).to.contain('Adding new value')
    })

    it('should update existing environment variable with --dry-run', async () => {
      const {stdout} = await runCommand([
        'compose',
        'env',
        '-f',
        testComposeFile,
        '--env',
        'EXISTING_VAR',
        '--value',
        'new_value',
        '--dry-run',
      ])
      expect(stdout).to.contain('[DRY RUN]')
      expect(stdout).to.contain('EXISTING_VAR')
      expect(stdout).to.contain('Old value: old_value')
      expect(stdout).to.contain('New value: new_value')
    })

    it('should add environment variable with host pattern when --host flag is present', async () => {
      const {stdout} = await runCommand([
        'compose',
        'env',
        '-f',
        testComposeFile,
        '--env',
        'FHIR_BASE_URL',
        '--value',
        'http://localhost:8080/fhir',
        '--host',
        '--dry-run',
      ])
      expect(stdout).to.contain('[DRY RUN]')
      expect(stdout).to.contain('FHIR_BASE_URL')
      // eslint-disable-next-line no-template-curly-in-string
      expect(stdout).to.contain('${FHIR_BASE_URL:-http://localhost:8080/fhir}')
    })
  })
})
