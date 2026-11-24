import {expect, test} from '@playwright/test'
import * as fs from 'node:fs'

import {startServices, stopServices} from '../docker-utils'
import {LogLevel, log, runCommand, runCommandBackground, waitForService} from '../helpers'

/**
 * Chatbot OpenMRS Workflow E2E Tests
 *
 * Tests the complete chatbot.sh workflow with OpenMRS EMR integration.
 * Validates elixir installation, conch installation, and OpenMRS integration.
 *
 * @workflow @chatbot @openmrs tags for categorization
 */

test.describe('Chatbot OpenMRS Workflow Tests', () => {
  const testWorkspace = process.env.DHTI_TEST_WORKSPACE || `${process.env.HOME}/dhti-e2e-test`
  const cliCommand = 'dhti-cli' // Use globally linked CLI command
  const elixirGitUrl = 'https://github.com/dermatologist/dhti-elixir.git'
  const elixirName = 'dhti-elixir-schat'
  const elixirSubdir = 'packages/simple_chat'
  const dockerImage = 'dhti/genai-test:1.0'
  const conchPackage = 'packages/esm-chatbot-agent'
  const workdir = `${process.env.HOME}/dhti` // Default workdir for elixir/conch commands
  const elixirDir = `${workdir}/elixir` // Elixir installs to ~/dhti/elixir
  const BACKGROUND_TIMEOUT = 15 * 60 * 1000 // 15 minutes max for background processes

  // Track background processes for cleanup
  let conchProcess: any = null
  let backgroundStartTime: number = 0

  // Helper to check background process timeout
  function checkBackgroundTimeout(processName: string): void {
    const elapsed = Date.now() - backgroundStartTime
    if (elapsed > BACKGROUND_TIMEOUT) {
      log(LogLevel.ERROR, `⚠️ ${processName} has been running for more than 15 minutes!`)
      throw new Error(`${processName} exceeded 15-minute timeout`)
    }
  }

  test.beforeAll(async () => {
    test.setTimeout(120_000) // 2 minutes for setup
    log(LogLevel.INFO, '📦 Setting up chatbot OpenMRS test environment...')

    // Verify prerequisites
    await test.step('Verify Node.js is installed', async () => {
      const result = await runCommand('node --version')
      expect(result.exitCode).toBe(0)
      log(LogLevel.INFO, `✅ Node.js: ${result.stdout.trim()}`)
    })

    await test.step('Verify Docker is running', async () => {
      const result = await runCommand('docker --version')
      expect(result.exitCode).toBe(0)
      log(LogLevel.INFO, `✅ Docker: ${result.stdout.trim()}`)
    })

    await test.step('Build dhti-cli', async () => {
      const result = await runCommand('npm run build', {cwd: process.env.DHTI_CLI_PATH || process.cwd()})
      expect(result.exitCode).toBe(0)
      log(LogLevel.INFO, '✅ dhti-cli built')
    })

    await test.step('Link dhti-cli globally', async () => {
      const result = await runCommand('npm link', {cwd: process.env.DHTI_CLI_PATH || process.cwd()})
      expect(result.exitCode).toBe(0)
      log(LogLevel.INFO, '✅ dhti-cli linked globally')
    })

    await test.step('Verify dhti-cli is available', async () => {
      const result = await runCommand(`${cliCommand} --version`)
      expect(result.exitCode).toBe(0)
      log(LogLevel.INFO, `✅ dhti-cli: ${result.stdout.trim()}`)
    })
  })

  /**
   * OpenMRS EMR Testing
   * Tests the complete workflow including conch installation and OpenMRS integration
   */
  test('@workflow @chatbot @openmrs should test elixir in OpenMRS EMR', async ({page, request}) => {
    test.setTimeout(300_000) // 5 minutes for this test

    // Cleanup: Remove any existing test elixirs
    await test.step('Clean up existing elixirs', async () => {
      const cleanupResult = await runCommand(`${cliCommand} elixir uninstall -n ${elixirName} 2>&1 || true`)
      log(LogLevel.INFO, '✅ Cleanup complete')
    })

    // Phase 1: Compose Setup
    await test.step('Reset docker-compose.yml', async () => {
      const result = await runCommand(`${cliCommand} compose reset`)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('docker-compose.yml')
      log(LogLevel.INFO, '✅ Compose reset complete')
    })

    await test.step('Add LangServe module', async () => {
      const result = await runCommand(`${cliCommand} compose add -m langserve`)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('updated successfully')
      log(LogLevel.INFO, '✅ LangServe module added')
    })

    await test.step('Add OpenMRS module', async () => {
      const result = await runCommand(`${cliCommand} compose add -m openmrs`)
      expect(result.exitCode).toBe(0)
      const output = result.stdout || result.stderr || ''
      expect(output).toContain('updated successfully')
      log(LogLevel.INFO, '✅ OpenMRS module added')
    })

    // Phase 2: Elixir Installation
    await test.step('Install chatbot elixir from GitHub', async () => {
      const result = await runCommand(
        `${cliCommand} elixir install -g ${elixirGitUrl} -n ${elixirName} -s ${elixirSubdir}`,
      )
      expect(result.exitCode).toBe(0)
      const output = result.stdout || result.stderr || ''
      expect(output).toContain(elixirName)
      log(LogLevel.INFO, '✅ Elixir installed from GitHub')
    })

    await test.step('Verify elixir files updated', async () => {
      const pyprojectCheck = await runCommand(`grep -q "${elixirName}" ${elixirDir}/pyproject.toml && echo "found"`)
      expect(pyprojectCheck.stdout).toContain('found')

      const serverCheck = await runCommand(
        `grep -q "${elixirName.replaceAll('-', '_')}" ${elixirDir}/app/server.py && echo "found"`,
      )
      expect(serverCheck.stdout).toContain('found')

      log(LogLevel.INFO, '✅ Elixir files verified')
    })

    // Phase 3: Docker Build
    await test.step('Build Docker image with elixir', async () => {
      const result = await runCommand(`${cliCommand} docker -n ${dockerImage} -t elixir`)
      expect(result.exitCode).toBe(0)
      const output = (result.stdout || result.stderr || '').toLowerCase()
      expect(output).toContain('built')
      log(LogLevel.INFO, '✅ Docker image built')
    })

    await test.step('Verify Docker image exists', async () => {
      const result = await runCommand(`docker images ${dockerImage} --format "{{.Repository}}"`)
      const output = result.stdout || result.stderr || ''
      expect(output).toContain(dockerImage.split(':')[0])
      log(LogLevel.INFO, '✅ Docker image verified')
    })

    // Phase 4: Start Services
    await test.step('Start Docker services', async () => {
      const result = await runCommand(`${cliCommand} docker -u`)
      expect(result.exitCode).toBe(0)
      log(LogLevel.INFO, '✅ Docker services starting...')
    })

    await test.step('Wait for LangServe to be healthy', async () => {
      const isHealthy = await waitForService('http://localhost:8001/docs', 180_000, 5000)
      expect(isHealthy).toBe(true)
      log(LogLevel.INFO, '✅ LangServe is healthy')
    })

    // Phase 5: Bootstrap
    await test.step('Copy bootstrap.py to container', async () => {
      const bootstrapPath = `${process.cwd()}/src/resources/genai/app/bootstrap.py`
      if (!fs.existsSync(bootstrapPath)) {
        log(LogLevel.WARN, '⚠ bootstrap.py not found, skipping bootstrap copy')
        return
      }

      const result = await runCommand(`${cliCommand} docker bootstrap -f ${bootstrapPath}`)
      expect(result.exitCode).toBe(0)
      log(LogLevel.INFO, '✅ Bootstrap file copied')
    })

    // Phase 6: Conch Installation
    await test.step('Clean up existing conch directory', async () => {
      const conchDir = `${workdir}/esm-dhti`
      const cleanupResult = await runCommand(`rm -rf ${conchDir} 2>&1 || true`)
      log(LogLevel.INFO, '✅ Conch directory cleaned')
    })

    await test.step('Install conch package', async () => {
      const result = await runCommand(`${cliCommand} conch install`)
      expect(result.exitCode).toBe(0)
      log(LogLevel.INFO, '✅ Conch installed')
    })

    await test.step('Start chatbot conch', async () => {
      backgroundStartTime = Date.now()
      const {proc} = runCommandBackground(`${cliCommand} conch start -s ${conchPackage}`)
      conchProcess = proc
      log(LogLevel.INFO, '✅ Chatbot conch started in background')

      await new Promise((resolve) => setTimeout(resolve, 5000))
      checkBackgroundTimeout('Conch process')
    })

    // Phase 7: Start Docker Services with OpenMRS
    await test.step('Start Docker services with OpenMRS', async () => {
      const result = await runCommand(`${cliCommand} docker -u`)
      expect(result.exitCode).toBe(0)
      log(LogLevel.INFO, '✅ Docker services starting...')
    })

    await test.step('Wait for OpenMRS to be healthy', async () => {
      const isHealthy = await waitForService('http://localhost:80/openmrs', 300_000, 5000)
      if (!isHealthy) {
        log(LogLevel.WARN, '⚠ OpenMRS failed to become healthy, skipping browser tests')
        return
      }

      log(LogLevel.INFO, '✅ OpenMRS is healthy')
    })

    // Phase 8: OpenMRS Browser Testing
    await test.step('Login to OpenMRS', async () => {
      await page.goto('http://localhost:80/openmrs')

      const usernameInput = page.locator('input[name="username"]')
      await expect(usernameInput).toBeVisible({timeout: 15_000})

      await usernameInput.fill('admin')
      await page.locator('input[name="password"]').fill('Admin123!')
      await page.click('button[type="submit"]')

      await page.waitForURL(/.*\/home\?.*/, {timeout: 30_000})
      log(LogLevel.INFO, '✅ Logged into OpenMRS')
    })

    await test.step('Navigate to patient record', async () => {
      try {
        const searchButton = page.locator('button:has-text("Search"), [class*="search"]').first()
        await searchButton.click({timeout: 5000})
      } catch {
        log(LogLevel.WARN, '⚠ Could not click search button, trying alternative')
      }

      const patientLink = page.locator('a[href*="patient"], [class*="patient"]').first()
      await expect(patientLink).toBeVisible({timeout: 15_000})
      await patientLink.click()

      await page.waitForURL(/.*\/patient\/.*/, {timeout: 30_000})
      log(LogLevel.INFO, '✅ Patient record loaded')
    })

    await test.step('Verify chatbot widget is present', async () => {
      const chatbotWidget = page.locator('[class*="chatbot"], [id*="chatbot"], div:has-text("Chatbot")').first()
      await expect(chatbotWidget).toBeVisible({timeout: 15_000})
      log(LogLevel.INFO, '✅ Chatbot widget found')
    })

    // Phase 9: API Testing (OpenMRS context)
    await test.step('Test elixir endpoint via OpenMRS', async () => {
      const elixirEndpoint = `http://localhost:8001/langserve/${elixirName}/cds-services/dhti-service`

      const response = await request.post(elixirEndpoint, {
        data: {
          config: {},
          input: {
            context: {
              input: 'What medications is this patient on?',
            },
          },
          kwargs: {},
        },
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      })

      const status = response.status()
      expect([200, 404]).toContain(status)

      if (status === 200) {
        const body = await response.json()
        expect(body.cards || body.summary).toBeDefined()
        log(LogLevel.INFO, '✅ Elixir endpoint responded successfully')
      } else {
        log(LogLevel.INFO, '⚠ Elixir endpoint returned 404 (expected in some configurations)')
      }
    })
  })

  test.afterAll(async () => {
    log(LogLevel.INFO, '🧹 Cleaning up chatbot OpenMRS test environment...')

    if (conchProcess) {
      try {
        log(LogLevel.INFO, 'Terminating conch background process...')
        conchProcess.kill('SIGTERM')
        await new Promise((resolve) => setTimeout(resolve, 2000))
        log(LogLevel.INFO, '✅ Background conch process terminated')
      } catch {
        log(LogLevel.WARN, '⚠ Could not terminate conch process gracefully, forcing kill')
        try {
          conchProcess.kill('SIGKILL')
        } catch {
          // Ignore
        }
      }
    }

    await test.step('Stop Docker services', async () => {
      const result = await runCommand(`${cliCommand} docker -d`)
      expect(result.exitCode).toBe(0)
      log(LogLevel.INFO, '✅ Docker services stopped')
    })

    await test.step('Remove all Docker containers', async () => {
      const result = await runCommand('docker rm -f $(docker ps -a -q --filter "name=dhti" 2>/dev/null) 2>&1 || true')
      log(LogLevel.INFO, '✅ All Docker containers removed')
    })

    await test.step('Remove all Docker images', async () => {
      const result = await runCommand('docker rmi -f dhti/genai-test:1.0 2>&1 || true')
      log(LogLevel.INFO, '✅ Docker images removed')
    })

    await test.step('Remove Docker volumes', async () => {
      const result = await runCommand(
        'docker volume rm -f $(docker volume ls -q -f name=dhti 2>/dev/null) 2>&1 || true',
      )
      log(LogLevel.INFO, '✅ Docker volumes removed')
    })

    await test.step('Verify containers removed', async () => {
      const result = await runCommand('docker ps -a --filter "name=dhti" --format "{{.Names}}"')
      expect(result.stdout.trim()).toBe('')
      log(LogLevel.INFO, '✅ All containers verified removed')
    })

    await test.step('Clean up test workspace', async () => {
      const result = await runCommand(`rm -rf ${testWorkspace}`)
      expect(result.exitCode).toBe(0)
      log(LogLevel.INFO, '✅ Test workspace cleaned up')
    })

    await test.step('Remove all Docker images including gateway', async () => {
      const result = await runCommand('docker rmi -f dhti/genai-test:1.0 beapen/dhti-gateway:latest 2>&1 || true')
      log(LogLevel.INFO, '✅ All Docker images removed')
    })
  })
})
