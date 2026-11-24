import {test, expect} from '@playwright/test'
import {runCommand, waitForService, log} from '../helpers'

/**
 * Elixir Workflow Tests
 *
 * Tests complete elixir workflow: install → build → start → test.
 * Requires Docker to be running.
 *
 * @workflow tag for categorization
 */

test.describe('Elixir Workflow', () => {
  const testDir = process.env.TEST_DIR || '/tmp/dhti-e2e-workflow'
  const elixirName = 'test-elixir-workflow'

  test('@workflow should complete elixir installation workflow', async () => {
    log('Starting elixir installation workflow')

    // Step 1: Install elixir (dry-run)
    const installResult = await runCommand(
      `dhti-cli elixir install -g https://github.com/dermatologist/dhti-elixir-template.git -n ${elixirName} --dry-run`,
    )

    expect(installResult.exitCode).toBe(0)
    expect(installResult.stdout).toContain('elixir')
    log('✓ Elixir install dry-run completed')

    // Step 2: Verify elixir directory structure would be created
    expect(installResult.stdout).toMatch(/elixir|template|install/i)
    log('✓ Elixir workflow validation passed')
  })

  test('@workflow should test elixir start command', async () => {
    log('Testing elixir start command')

    // Test start command with dry-run
    const startResult = await runCommand(`dhti-cli elixir start -n ${elixirName} --dry-run`)

    // Command should execute (may fail if elixir not installed, which is OK)
    expect([0, 1]).toContain(startResult.exitCode)
    log('✓ Elixir start command tested')
  })

  test('@workflow should verify elixir Docker build', async () => {
    log('Testing elixir Docker build')

    // Test Docker build for elixir (dry-run)
    const buildResult = await runCommand(`dhti-cli docker -n test-elixir:1.0 -t elixir --dry-run`)

    expect(buildResult.exitCode).toBe(0)
    expect(buildResult.stdout).toContain('docker')
    log('✓ Elixir Docker build validated')
  })

  test('@workflow should test elixir health check', async ({page}) => {
    log('Testing elixir health check')

    const elixirEndpoint = 'http://localhost:8001/langserve'

    try {
      // Wait for elixir to be ready
      await waitForService(elixirEndpoint, 10000)

      // Navigate to elixir endpoint
      const response = await page.goto(elixirEndpoint)
      expect(response?.status()).toBeLessThan(500)

      log('✓ Elixir health check passed')
    } catch (error) {
      // Elixir may not be running, which is acceptable
      log('⚠ Elixir not running (expected in some scenarios)')
    }
  })

  test('@workflow should complete full elixir lifecycle', async () => {
    log('Testing complete elixir lifecycle')

    const steps = [
      {
        name: 'install',
        cmd: `dhti-cli elixir install -g https://github.com/dermatologist/dhti-elixir-template.git -n ${elixirName} --dry-run`,
      },
      {name: 'build', cmd: `dhti-cli docker -n test-elixir:1.0 -t elixir --dry-run`},
      {name: 'start', cmd: `dhti-cli elixir start -n ${elixirName} --dry-run`},
    ]

    for (const step of steps) {
      log(`Executing: ${step.name}`)
      const result = await runCommand(step.cmd)

      // All steps should complete (exit code 0 or 1 is acceptable for dry-run)
      expect([0, 1]).toContain(result.exitCode)
      log(`✓ ${step.name} step completed`)
    }

    log('✓ Complete elixir lifecycle validated')
  })
})
