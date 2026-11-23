import {test, expect} from '@playwright/test'
import {runCommand, waitForService, log, LogLevel} from '../helpers'
import {startServices, stopServices} from '../docker-utils'

/**
 * Chatbot Workflow E2E Tests
 *
 * Tests the complete chatbot.sh workflow using locally installed dhti-cli.
 * Validates every command from vidhi/chatbot.sh can be executed successfully.
 *
 * @workflow @chatbot tags for categorization
 */

test.describe('Chatbot Workflow Tests', () => {
  const testWorkspace = process.env.DHTI_TEST_WORKSPACE || `${process.env.HOME}/dhti-e2e-test`
  const cliPath = './bin/run.js'
  const elixirGitUrl = 'https://github.com/dermatologist/dhti-elixir.git'
  const elixirName = 'dhti-elixir-schat'
  const elixirSubdir = 'packages/simple_chat'
  const dockerImage = 'dhti/genai-test:1.0'
  const conchPackage = 'packages/esm-chatbot-agent'
  const workdir = `${process.env.HOME}/dhti` // Default workdir for elixir/conch commands
  const elixirDir = `${workdir}/elixir` // Elixir installs to ~/dhti/elixir

  test.beforeAll(async () => {
    log(LogLevel.INFO, '📦 Setting up chatbot test environment...')

    // Verify prerequisites
    await test.step('Verify Node.js is installed', async () => {
      const result = await runCommand('node --version')
      expect(result.exitCode).toBe(0)
      log(`✅ Node.js: ${result.stdout.trim()}`)
    })

    await test.step('Verify Docker is running', async () => {
      const result = await runCommand('docker --version')
      expect(result.exitCode).toBe(0)
      log(`✅ Docker: ${result.stdout.trim()}`)
    })

    await test.step('Verify dhti-cli is built', async () => {
      const result = await runCommand(`node ${cliPath} --version`)
      expect(result.exitCode).toBe(0)
      log(`✅ dhti-cli: ${result.stdout.trim()}`)
    })
  })

  test('@workflow @chatbot should execute complete chatbot.sh workflow', async ({page, request}) => {
    // Cleanup: Remove any existing test elixirs
    await test.step('Clean up existing elixirs', async () => {
      // Uninstall test-elixir if it exists (from previous test runs)
      const cleanupResult = await runCommand(`node ${cliPath} elixir uninstall -n test-elixir 2>&1 || true`)
      log(LogLevel.INFO, '✅ Cleanup complete')
    })

    // Phase 1: Compose Setup
    await test.step('Reset docker-compose.yml', async () => {
      const result = await runCommand(`node ${cliPath} compose reset`)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('docker-compose.yml')
      log(LogLevel.INFO, '✅ Compose reset complete')
    })

    await test.step('Add LangServe module', async () => {
      const result = await runCommand(`node ${cliPath} compose add -m langserve`)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('updated successfully')
      log(LogLevel.INFO, '✅ LangServe module added')
    })

    await test.step('Add OpenMRS module', async () => {
      const result = await runCommand(`node ${cliPath} compose add -m openmrs`)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('updated successfully')
      log(LogLevel.INFO, '✅ OpenMRS module added')
    })

    // Phase 2: Elixir Installation
    await test.step('Install chatbot elixir from GitHub', async () => {
      const result = await runCommand(
        `node ${cliPath} elixir install -g ${elixirGitUrl} -n ${elixirName} -s ${elixirSubdir}`,
      )
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain(elixirName)
      log(LogLevel.INFO, '✅ Elixir installed from GitHub')
    })

    await test.step('Verify elixir files updated', async () => {
      // Check pyproject.toml
      const pyprojectCheck = await runCommand(`grep -q "${elixirName}" ${elixirDir}/pyproject.toml && echo "found"`)
      expect(pyprojectCheck.stdout).toContain('found')

      // Check server.py
      const serverCheck = await runCommand(
        `grep -q "${elixirName.replace(/-/g, '_')}" ${elixirDir}/app/server.py && echo "found"`,
      )
      expect(serverCheck.stdout).toContain('found')

      log(LogLevel.INFO, '✅ Elixir files verified')
    })

    // Phase 3: Docker Build
    await test.step('Build Docker image with elixir', async () => {
      const result = await runCommand(`node ${cliPath} docker -n ${dockerImage} -t elixir`)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toLowerCase().toContain('build')
      log(LogLevel.INFO, '✅ Docker image built')
    })

    await test.step('Verify Docker image exists', async () => {
      const result = await runCommand(`docker images ${dockerImage} --format "{{.Repository}}"`)
      expect(result.stdout).toContain(dockerImage.split(':')[0])
      log(LogLevel.INFO, '✅ Docker image verified')
    })

    // Phase 4: Start Services
    await test.step('Start Docker services', async () => {
      const result = await runCommand(`node ${cliPath} docker -u`)
      expect(result.exitCode).toBe(0)
      log(LogLevel.INFO, '✅ Docker services starting...')
    })

    await test.step('Wait for services to be healthy', async () => {
      // Wait for LangServe
      await waitForService('http://localhost:8001/langserve', 60000)
      log(LogLevel.INFO, '✅ LangServe is healthy')

      // Wait for OpenMRS
      await waitForService('http://localhost:80/openmrs', 90000)
      log(LogLevel.INFO, '✅ OpenMRS is healthy')
    })

    // Phase 5: Bootstrap
    await test.step('Copy bootstrap.py to container', async () => {
      const result = await runCommand(`node ${cliPath} docker bootstrap -f bootstrap.py`)
      expect(result.exitCode).toBe(0)
      log(LogLevel.INFO, '✅ Bootstrap file copied')
    })

    // Phase 6: Start Elixir
    await test.step('Start elixir CDS sandbox', async () => {
      const result = await runCommand(`node ${cliPath} elixir start -n ${elixirName}`)
      expect(result.exitCode).toBe(0)
      log(LogLevel.INFO, '✅ Elixir CDS sandbox started')
    })

    // Phase 7: Conch Installation
    await test.step('Install conch package', async () => {
      const result = await runCommand(`node ${cliPath} conch install`)
      expect(result.exitCode).toBe(0)
      log(LogLevel.INFO, '✅ Conch installed')
    })

    await test.step('Start chatbot conch', async () => {
      const result = await runCommand(`node ${cliPath} conch start -s ${conchPackage}`)
      expect(result.exitCode).toBe(0)
      log(LogLevel.INFO, '✅ Chatbot conch started')
    })

    // Phase 8: Browser Testing
    await test.step('Login to OpenMRS', async () => {
      await page.goto('http://localhost:80/openmrs')

      // Wait for login form
      const usernameInput = page.locator('input[name="username"]')
      await expect(usernameInput).toBeVisible({timeout: 15000})

      // Login
      await usernameInput.fill('admin')
      await page.locator('input[name="password"]').fill('Admin123!')
      await page.click('button[type="submit"]')

      // Wait for successful login
      await page.waitForURL(/.*\/home\?.*/, {timeout: 30000})
      log(LogLevel.INFO, '✅ Logged into OpenMRS')
    })

    await test.step('Navigate to patient record', async () => {
      // Click search icon
      const searchIcon = page.locator('[class*="search"], button[title*="Search"]').first()
      await searchIcon.click({timeout: 10000})

      // Wait for patient search results and select first patient
      const patientLink = page.locator('a[href*="patient"]').first()
      await expect(patientLink).toBeVisible({timeout: 15000})
      await patientLink.click()

      // Wait for patient record to load
      await page.waitForURL(/.*\/patient\/.*/, {timeout: 30000})
      log(LogLevel.INFO, '✅ Patient record loaded')
    })

    await test.step('Verify chatbot widget is present', async () => {
      // Look for chatbot tab or widget
      const chatbotWidget = page.locator('[class*="chatbot"], [id*="chatbot"], div:has-text("Chatbot")').first()
      await expect(chatbotWidget).toBeVisible({timeout: 15000})
      log(LogLevel.INFO, '✅ Chatbot widget found')
    })

    // Phase 9: API Testing
    await test.step('Test elixir endpoint directly', async () => {
      const elixirEndpoint = `http://localhost:8001/langserve/${elixirName}/cds-services/dhti-service`

      const response = await request.post(elixirEndpoint, {
        data: {
          input: {
            context: {
              input: 'What medications is this patient on?',
              patientId: undefined,
            },
          },
          config: {},
          kwargs: {},
        },
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      })

      const status = response.status()
      // Elixir may return 200 (success) or 404 (not configured)
      expect([200, 404]).toContain(status)

      if (status === 200) {
        const body = await response.json()
        // Verify response has cards or summary
        expect(body.cards || body.summary).toBeDefined()
        log(LogLevel.INFO, '✅ Elixir endpoint responded successfully')
      } else {
        log(LogLevel.INFO, '⚠ Elixir endpoint returned 404 (expected in some configurations)')
      }
    })
  })

  test.afterAll(async () => {
    log(LogLevel.INFO, '🧹 Cleaning up chatbot test environment...')

    await test.step('Stop Docker services', async () => {
      const result = await runCommand(`node ${cliPath} docker -d`)
      expect(result.exitCode).toBe(0)
      log(LogLevel.INFO, '✅ Docker services stopped')
    })

    await test.step('Verify containers removed', async () => {
      const result = await runCommand('docker ps -a --filter "name=dhti" --format "{{.Names}}"')
      expect(result.stdout.trim()).toBe('')
      log(LogLevel.INFO, '✅ All containers removed')
    })

    await test.step('Clean up test workspace', async () => {
      const result = await runCommand(`rm -rf ${testWorkspace}`)
      expect(result.exitCode).toBe(0)
      log(LogLevel.INFO, '✅ Test workspace cleaned up')
    })
  })
})
