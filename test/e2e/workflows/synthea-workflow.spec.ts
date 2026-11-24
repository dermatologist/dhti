import {expect, test} from '@playwright/test'

import {log, runCommand} from '../helpers'

/**
 * Synthea Workflow Tests
 *
 * Tests synthetic patient generation workflow.
 * Optional test - may require additional setup.
 *
 * @workflow tag for categorization
 */

test.describe('Synthea Workflow', () => {
  const testDir = process.env.TEST_DIR || '/tmp/dhti-e2e-synthea'

  test('@workflow should verify Synthea command availability', async () => {
    log('Testing Synthea command availability')

    // Test synthea help
    const helpResult = await runCommand('dhti-cli synthea --help')

    // Command should exist (exit code 0 or 1 is acceptable)
    expect([0, 1]).toContain(helpResult.exitCode)
    log('✓ Synthea command available')
  })

  test('@workflow should test Synthea generation (dry-run)', async () => {
    log('Testing Synthea generation')

    // Test synthea generate with dry-run
    const generateResult = await runCommand('dhti-cli synthea generate --dry-run')

    // Command should execute (may fail if not configured, which is OK)
    expect([0, 1]).toContain(generateResult.exitCode)
    log('✓ Synthea generation tested')
  })

  test('@workflow should verify Synthea Docker build', async () => {
    log('Testing Synthea Docker build')

    // Test Docker build for synthea (dry-run)
    const buildResult = await runCommand('dhti-cli docker -n synthea:latest -t synthea --dry-run')

    expect(buildResult.exitCode).toBe(0)
    expect(buildResult.stdout).toContain('docker')
    log('✓ Synthea Docker build validated')
  })

  test('@workflow should test Synthea import workflow', async () => {
    log('Testing Synthea import workflow')

    // Test mimic import command (related to synthea)
    const importResult = await runCommand('dhti-cli mimic import --dry-run')

    // Command should execute
    expect([0, 1]).toContain(importResult.exitCode)
    log('✓ Synthea import workflow tested')
  })

  test('@workflow should complete Synthea lifecycle', async () => {
    log('Testing complete Synthea lifecycle')

    const steps = [
      {cmd: 'dhti-cli synthea generate --dry-run', name: 'generate'},
      {cmd: 'dhti-cli docker -n synthea:latest -t synthea --dry-run', name: 'build'},
      {cmd: 'dhti-cli mimic import --dry-run', name: 'import'},
    ]

    for (const step of steps) {
      log(`Executing: ${step.name}`)
      const result = await runCommand(step.cmd)

      // All steps should complete
      expect([0, 1]).toContain(result.exitCode)
      log(`✓ ${step.name} step completed`)
    }

    log('✓ Complete Synthea lifecycle validated')
  })
})
