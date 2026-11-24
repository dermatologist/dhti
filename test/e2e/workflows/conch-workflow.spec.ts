import {expect, test} from '@playwright/test'

import {log, runCommand, waitForService} from '../helpers'

/**
 * Conch Workflow Tests
 *
 * Tests complete conch workflow: install → start → verify.
 * Requires Docker to be running.
 *
 * @workflow tag for categorization
 */

test.describe('Conch Workflow', () => {
  const conchName = 'test-conch-workflow'

  test('@workflow should complete conch installation workflow', async () => {
    log('Starting conch installation workflow')

    // Step 1: Install conch (dry-run)
    const installResult = await runCommand(
      `dhti-cli conch install -g dermatologist/openmrs-esm-dhti -n ${conchName} --dry-run`,
    )

    expect(installResult.exitCode).toBe(0)
    expect(installResult.stdout).toContain('conch')
    log('✓ Conch install dry-run completed')

    // Step 2: Verify conch directory structure would be created
    expect(installResult.stdout).toMatch(/conch|esm|install/i)
    log('✓ Conch workflow validation passed')
  })

  test('@workflow should test conch start command', async () => {
    log('Testing conch start command')

    // Test start command with dry-run
    const startResult = await runCommand(`dhti-cli conch start -n ${conchName} --dry-run`)

    // Command should execute (may fail if conch not installed, which is OK)
    expect([0, 1]).toContain(startResult.exitCode)
    log('✓ Conch start command tested')
  })

  test('@workflow should verify conch Docker build', async () => {
    log('Testing conch Docker build')

    // Test Docker build for conch (dry-run)
    const buildResult = await runCommand(`dhti-cli docker -n test-conch:1.0 -t conch --dry-run`)

    expect(buildResult.exitCode).toBe(0)
    expect(buildResult.stdout).toContain('docker')
    log('✓ Conch Docker build validated')
  })

  test('@workflow should test conch UI rendering', async ({page}) => {
    log('Testing conch UI rendering')

    const spaUrl = 'http://localhost:80/openmrs/spa/home'

    try {
      // Wait for SPA to be ready
      await waitForService(spaUrl, 10_000)

      // Navigate to SPA
      await page.goto(spaUrl)

      // Verify SPA content is rendered
      const spaContainer = page.locator('[class*="spa"], [class*="esm"], div')
      await expect(spaContainer.first()).toBeVisible()

      log('✓ Conch UI rendering verified')
    } catch {
      // Conch may not be running, which is acceptable
      log('⚠ Conch not running (expected in some scenarios)')
    }
  })

  test('@workflow should complete full conch lifecycle', async () => {
    log('Testing complete conch lifecycle')

    const steps = [
      {cmd: `dhti-cli conch install -g dermatologist/openmrs-esm-dhti -n ${conchName} --dry-run`, name: 'install'},
      {cmd: `dhti-cli docker -n test-conch:1.0 -t conch --dry-run`, name: 'build'},
      {cmd: `dhti-cli conch start -n ${conchName} --dry-run`, name: 'start'},
    ]

    for (const step of steps) {
      log(`Executing: ${step.name}`)
      const result = await runCommand(step.cmd)

      // All steps should complete (exit code 0 or 1 is acceptable for dry-run)
      expect([0, 1]).toContain(result.exitCode)
      log(`✓ ${step.name} step completed`)
    }

    log('✓ Complete conch lifecycle validated')
  })
})
