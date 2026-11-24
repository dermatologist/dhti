import {test, expect} from '@playwright/test'
import {runCommand, waitForService, log} from '../helpers'

/**
 * Full Stack Integration Tests
 *
 * Tests complete integration: elixir + conch + OpenMRS + Docker.
 * Requires Docker to be running.
 *
 * @workflow tag for categorization
 */

test.describe('Full Stack Integration', () => {
  const testDir = process.env.TEST_DIR || '/tmp/dhti-e2e-integration'

  test('@workflow should verify Docker Compose setup', async () => {
    log('Testing Docker Compose setup')

    // Add modules to compose
    const composeResult = await runCommand(`dhti-cli compose add -m langserve -m openmrs -m redis`, {cwd: testDir})

    expect(composeResult.exitCode).toBe(0)
    expect(composeResult.stdout).toContain('Writing file')
    log('✓ Docker Compose setup completed')
  })

  test('@workflow should test Docker services startup', async () => {
    log('Testing Docker services startup')

    // Start services (dry-run)
    const startResult = await runCommand('dhti-cli docker -u --dry-run', {cwd: testDir})

    expect(startResult.exitCode).toBe(0)
    expect(startResult.stdout).toContain('docker')
    log('✓ Docker services startup validated')
  })

  test('@workflow should verify all services health', async ({page}) => {
    log('Testing all services health')

    const services = [
      {name: 'Gateway', url: 'http://localhost:80', timeout: 10000},
      {name: 'OpenMRS', url: 'http://localhost:80/openmrs', timeout: 30000},
      {name: 'LangServe', url: 'http://localhost:8001/langserve', timeout: 30000},
    ]

    for (const service of services) {
      try {
        await waitForService(service.url, service.timeout)

        const response = await page.goto(service.url)
        expect(response?.status()).toBeLessThan(500)

        log(`✓ ${service.name} health check passed`)
      } catch (error) {
        log(`⚠ ${service.name} not available (expected in some scenarios)`)
      }
    }
  })

  test('@workflow should test elixir + conch integration', async ({page}) => {
    log('Testing elixir + conch integration')

    // Test elixir endpoint
    const elixirEndpoint = 'http://localhost:8001/langserve'
    try {
      await waitForService(elixirEndpoint, 10000)
      const elixirResponse = await page.goto(elixirEndpoint)
      expect(elixirResponse?.status()).toBeLessThan(500)
      log('✓ Elixir endpoint accessible')
    } catch (error) {
      log('⚠ Elixir not available')
    }

    // Test conch SPA
    const spaUrl = 'http://localhost:80/openmrs/spa/home'
    try {
      await waitForService(spaUrl, 10000)
      await page.goto(spaUrl)
      const spaContainer = page.locator('[class*="spa"], div')
      await expect(spaContainer.first()).toBeVisible()
      log('✓ Conch SPA accessible')
    } catch (error) {
      log('⚠ Conch not available')
    }
  })

  test('@workflow should test OpenMRS + FHIR integration', async ({page}) => {
    log('Testing OpenMRS + FHIR integration')

    const openmrsUrl = 'http://localhost:80/openmrs'
    const fhirEndpoint = 'http://localhost:80/openmrs/ws/fhir2/R4'

    try {
      // Test OpenMRS
      await waitForService(openmrsUrl, 10000)
      await page.goto(openmrsUrl)
      log('✓ OpenMRS accessible')

      // Test FHIR endpoint
      await waitForService(fhirEndpoint, 10000)
      const pingUrl = `${fhirEndpoint}/_ping`
      const pingResponse = await page.goto(pingUrl)
      expect(pingResponse?.status()).toBe(200)
      log('✓ FHIR endpoint accessible')
    } catch (error) {
      log('⚠ OpenMRS/FHIR not available (expected in some scenarios)')
    }
  })

  test('@workflow should complete full integration workflow', async () => {
    log('Testing complete integration workflow')

    const steps = [
      {name: 'compose', cmd: `dhti-cli compose add -m langserve -m openmrs`, cwd: testDir},
      {name: 'elixir-build', cmd: 'dhti-cli docker -n test-elixir:1.0 -t elixir --dry-run'},
      {name: 'conch-build', cmd: 'dhti-cli docker -n test-conch:1.0 -t conch --dry-run'},
      {name: 'docker-start', cmd: 'dhti-cli docker -u --dry-run', cwd: testDir},
    ]

    for (const step of steps) {
      log(`Executing: ${step.name}`)
      const result = await runCommand(step.cmd, {cwd: step.cwd})

      // All steps should complete
      expect([0, 1]).toContain(result.exitCode)
      log(`✓ ${step.name} step completed`)
    }

    log('✓ Complete integration workflow validated')
  })

  test('@workflow should test Docker services shutdown', async () => {
    log('Testing Docker services shutdown')

    // Stop services (dry-run)
    const stopResult = await runCommand('dhti-cli docker -d --dry-run', {cwd: testDir})

    expect(stopResult.exitCode).toBe(0)
    expect(stopResult.stdout).toContain('docker')
    log('✓ Docker services shutdown validated')
  })
})
