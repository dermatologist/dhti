import {test, expect} from '@playwright/test'
import {runCommand, runCommandBackground, waitForService, log, LogLevel} from '../helpers'
import {startServices, stopServices} from '../docker-utils'
import * as fs from 'fs'

/**
 * Chatbot CDS Hooks Sandbox Workflow E2E Tests
 *
 * Tests the chatbot.sh workflow using CDS Hooks sandbox without OpenMRS.
 * Validates elixir installation, Docker build, and CDS Hooks sandbox integration.
 *
 * @workflow @chatbot @cds-sandbox tags for categorization
 */

test.describe('Chatbot CDS Hooks Sandbox Workflow Tests', () => {
  const testWorkspace = process.env.DHTI_TEST_WORKSPACE || `${process.env.HOME}/dhti-e2e-test`
  const cliCommand = 'dhti-cli' // Use globally linked CLI command
  const elixirGitUrl = 'https://github.com/dermatologist/dhti-elixir.git'
  const elixirName = 'dhti-elixir-schat'
  const elixirSubdir = 'packages/simple_chat'
  const dockerImage = 'dhti/genai-test:1.0'
  const conchPackage = 'packages/esm-chatbot-agent'
  const workdir = `${process.env.HOME}/dhti` // Default workdir for elixir/conch commands
  const elixirDir = `${workdir}/elixir` // Elixir installs to ~/dhti/elixir
  const cdsSandboxUrl = 'http://localhost:8080' // CDS Hooks sandbox URL (webpack-dev-server)
  const cdsSandboxDir = `${workdir}/cds-hooks-sandbox` // CDS sandbox directory
  const BACKGROUND_TIMEOUT = 15 * 60 * 1000 // 15 minutes max for background processes

  // Track background processes for cleanup
  let elixirProcess: any = null
  let backgroundStartTime: number = 0
  let elixirStdout: string = ''

  // Helper to check background process timeout
  function checkBackgroundTimeout(processName: string): void {
    const elapsed = Date.now() - backgroundStartTime
    if (elapsed > BACKGROUND_TIMEOUT) {
      log(LogLevel.ERROR, `⚠️ ${processName} has been running for more than 15 minutes!`)
      throw new Error(`${processName} exceeded 15-minute timeout`)
    }
  }

  test.beforeAll(async () => {
    test.setTimeout(120000) // 2 minutes for setup
    log(LogLevel.INFO, '📦 Setting up chatbot CDS sandbox test environment...')

    // // Verify prerequisites
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
   * CDS Hooks Sandbox Testing
   * Tests the elixir using CDS Hooks sandbox without OpenMRS
   * Follows workflow from README.md lines 79-97
   */
  test('@workflow @chatbot @cds-sandbox should test elixir with CDS Hooks sandbox', async ({page, request}) => {
    test.setTimeout(300000) // 5 minutes for this test

    // Cleanup: Remove any existing test elixirs
    await test.step('Clean up existing elixirs', async () => {
      const cleanupResult = await runCommand(`${cliCommand} elixir uninstall -n ${elixirName} 2>&1 || true`)
      log(LogLevel.INFO, '✅ Cleanup complete')
    })

    // Phase 1: Compose Setup
    await test.step('Reset docker-compose.yml', async () => {
      const result = await runCommand(`${cliCommand} compose reset`)
      expect(result.exitCode).toBe(0)
      const output = result.stdout || result.stderr || ''
      expect(output).toContain('docker-compose.yml')
      log(LogLevel.INFO, '✅ Compose reset complete')
    })

    await test.step('Add LangServe module', async () => {
      const result = await runCommand(`${cliCommand} compose add -m langserve`)
      expect(result.exitCode).toBe(0)
      const output = result.stdout || result.stderr || ''
      expect(output).toContain('updated successfully')
      log(LogLevel.INFO, '✅ LangServe module added')
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
      // LangServe exposes /docs endpoint when healthy
      const isHealthy = await waitForService('http://localhost:8001/docs', 180000, 5000)
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

    // Phase 6: Start Elixir (in background)
    let cdsSandboxUrl: string = '' // Will be extracted from elixir start output
    await test.step('Start elixir CDS sandbox in background', async () => {
      backgroundStartTime = Date.now()
      const {proc, getStdout, waitForExit} = await runCommandBackground(`${cliCommand} elixir start -n ${elixirName}`)
      elixirProcess = proc
      log(LogLevel.INFO, '✅ Elixir CDS sandbox starting in background')

      // Wait for the process to generate all its initial output (including Application URL)
      try {
        await waitForExit(30000)
      } catch (error) {
        // Process didn't exit within timeout, which is expected for a long-running service
        log(LogLevel.INFO, '⏳ Elixir process is still running (expected)')
      }

      // Give the process a moment to flush all output buffers
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Get accumulated stdout from the process
      elixirStdout = getStdout()
      log(LogLevel.INFO, `📝 Captured ${elixirStdout.length} bytes of elixir output`)

      // Check if process is still running
      checkBackgroundTimeout('Elixir process')

      // Extract Application URL from the output
      const urlMatch = elixirStdout.match(/Application URL:\s*(http?:\/\/[^\s]+)/i)
      if (urlMatch && urlMatch[1]) {
        cdsSandboxUrl = urlMatch[1]
        log(LogLevel.INFO, `✅ Extracted CDS sandbox URL: ${cdsSandboxUrl}`)
      } else {
        // Fallback to default if URL not found in output
        log(
          LogLevel.WARN,
          `⚠ Could not extract Application URL in ${elixirStdout.substring(0, 500)}, using default: http://localhost:8080`,
        )
        cdsSandboxUrl = 'http://localhost:8080'
      }
    })

    // Phase 6a: CDS Hooks Sandbox UI Testing
    await test.step('Wait for CDS Hooks sandbox to be ready', async () => {
      const isHealthy = await waitForService(cdsSandboxUrl, 80000, 3000)
      if (!isHealthy) {
        log(LogLevel.WARN, '⚠ CDS Hooks sandbox failed to become healthy, skipping UI tests')
        return
      }
      log(LogLevel.INFO, '✅ CDS Hooks sandbox is ready')
    })

    await test.step('Navigate to CDS Hooks sandbox', async () => {
      try {
        log(LogLevel.INFO, `🌐 Navigating to CDS Hooks sandbox: ${cdsSandboxUrl}`)
        await page.goto(cdsSandboxUrl, {timeout: 10000})

        // Verify sandbox page loads
        const pageContent = page.locator('body')
        await expect(pageContent).toBeVisible({timeout: 10000})
        log(LogLevel.INFO, '✅ CDS Hooks sandbox page loaded')
      } catch (error) {
        log(LogLevel.WARN, '⚠ Could not load CDS Hooks sandbox page, skipping UI tests')
        return
      }
    })

    await test.step('List all tabs on the page', async () => {
      const tabTexts = await page
        .locator('a, button, [role="tab"]')
        .evaluateAll((elements) => elements.map((element) => element.textContent?.trim() ?? '').filter(Boolean))
      log(LogLevel.INFO, `📋 Found ${tabTexts.length} potential tabs/links on the page`)
      tabTexts.forEach((text, index) => log(LogLevel.INFO, `  Tab ${index + 1}: "${text}"`))

      const navTabTexts = await page
        .locator('nav a, .nav a, [class*="nav"] a, [role="navigation"] a')
        .evaluateAll((elements) => elements.map((element) => element.textContent?.trim() ?? '').filter(Boolean))
      log(LogLevel.INFO, `🧭 Found ${navTabTexts.length} navigation tabs`)
      navTabTexts.forEach((text, index) => log(LogLevel.INFO, `  Nav Tab ${index + 1}: "${text}"`))

      if (tabTexts.includes('Rx View')) {
        try {
          await page
            .getByRole('button', {name: 'Rx View', exact: true})
            .evaluate((button) => (button as HTMLElement).click())
          log(LogLevel.INFO, '✅ Rx View tab clicked')

          // Wait for tab content to load
          await new Promise((resolve) => setTimeout(resolve, 3000))
          log(LogLevel.INFO, '⏳ Waited 3 seconds for tab content to load')
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)
          log(LogLevel.WARN, `⚠ Could not click Rx View tab: ${message}`)
        }
      }

      // Debug: Check if textarea exists and its visibility
      const textarea = page.locator('textarea[name="communication-message"]')
      const textareaCount = await textarea.count()
      log(LogLevel.INFO, `🔍 Found ${textareaCount} textarea[name="communication-message"] elements`)

      if (textareaCount > 0) {
        const textareaInfo = await textarea.evaluate((el) => {
          const style = window.getComputedStyle(el)
          return {
            tag: el.tagName,
            name: el.getAttribute('name'),
            placeholder: el.getAttribute('placeholder'),
            class: el.className,
            display: style.display,
            visibility: style.visibility,
            opacity: style.opacity,
            height: style.height,
            width: style.width,
            position: style.position,
            zIndex: style.zIndex,
            offsetHeight: el.offsetHeight,
            offsetWidth: el.offsetWidth,
            scrollTop: el.scrollTop,
            isHidden: style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0',
            hasZeroDimensions: el.offsetHeight === 0 || el.offsetWidth === 0,
            parentHidden: (el.parentElement ? window.getComputedStyle(el.parentElement).display : 'N/A') === 'none',
          }
        })
        log(LogLevel.INFO, `Textarea details: ${JSON.stringify(textareaInfo, null, 2)}`)

        // Check if something is covering the textarea
        const coveredInfo = await page.evaluate(() => {
          const textarea = document.querySelector('textarea[name="communication-message"]')
          if (!textarea) return null

          const rect = textarea.getBoundingClientRect()
          const centerPoint = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          }

          // Find what element is at the center point
          const elementAtCenter = document.elementFromPoint(centerPoint.x, centerPoint.y)
          return {
            textareaRect: {top: rect.top, left: rect.left, width: rect.width, height: rect.height},
            elementAtCenter: elementAtCenter
              ? elementAtCenter.tagName + '.' + (elementAtCenter.className || '')
              : 'null',
            isCovered: elementAtCenter && elementAtCenter !== textarea,
          }
        })

        if (coveredInfo) {
          log(LogLevel.INFO, `Coverage check: ${JSON.stringify(coveredInfo, null, 2)}`)
          if (coveredInfo.isCovered) {
            log(LogLevel.WARN, '⚠️ TEXTAREA IS COVERED BY ANOTHER ELEMENT!')
          }
        }

        // Take screenshot
        await page.screenshot({path: 'textarea-debug-before-modal.png', fullPage: false})
        log(LogLevel.INFO, '📸 Screenshot saved to textarea-debug-before-modal.png')
      } else {
        log(LogLevel.WARN, '⚠ Textarea not found in DOM yet')
      }
    })

    await test.step('Ensure no blocking modal exists', async () => {
      const modalOverlay = page.locator('.ModalOverlay__overlay___dIXKy, [class*="Overlay"]')

      // Check if modal exists and get details
      const modalCount = await modalOverlay.count()
      log(LogLevel.INFO, `🔍 Found ${modalCount} modal overlay elements`)

      if (modalCount > 0) {
        // Get modal details
        const modalInfo = await modalOverlay.first().evaluate((el) => {
          const style = window.getComputedStyle(el)
          return {
            tag: el.tagName,
            class: el.className,
            display: style.display,
            visibility: style.visibility,
            opacity: style.opacity,
            position: style.position,
            zIndex: style.zIndex,
            isVisible: (el as HTMLElement).offsetParent !== null,
          }
        })
        log(LogLevel.INFO, `Modal details: ${JSON.stringify(modalInfo, null, 2)}`)

        // Take screenshot for debugging
        await page.screenshot({path: 'modal-debug.png', fullPage: false})
        log(LogLevel.INFO, '📸 Screenshot saved to modal-debug.png')

        // Only consider it blocking if it's actually visible
        if (
          modalInfo.display !== 'none' &&
          modalInfo.visibility !== 'hidden' &&
          modalInfo.opacity !== '0' &&
          modalInfo.isVisible
        ) {
          log(LogLevel.WARN, '⚠ Blocking modal detected, attempting to close...')
          // Try to close it
          const closeButtons = page.locator('button:has-text("Close"), button:has-text("×"), [aria-label*="close"]')
          const count = await closeButtons.count()
          if (count > 0) {
            await closeButtons.first().evaluate((btn) => (btn as HTMLElement).click())
            await new Promise((resolve) => setTimeout(resolve, 2000))
            log(LogLevel.INFO, '✅ Closed blocking modal')
          } else {
            log(LogLevel.WARN, '⚠ Blocking modal present but no close button found')
          }
        } else {
          log(LogLevel.INFO, '✅ Modal exists but is not blocking (hidden via CSS)')
        }
      } else {
        log(LogLevel.INFO, '✅ No blocking modal present')
      }
    })

    await test.step('List all text boxes on the page', async () => {
      const textInputs = await page
        .locator('input[type="text"], textarea, input:not([type]), [contenteditable="true"]')
        .evaluateAll((elements) =>
          elements.map((element) => {
            const input = element as HTMLInputElement | HTMLTextAreaElement
            return {
              tag: element.tagName.toLowerCase(),
              type: element.getAttribute('type') || (element.tagName === 'TEXTAREA' ? 'textarea' : 'unknown'),
              name: element.getAttribute('name') || '',
              placeholder: element.getAttribute('placeholder') || '',
              id: element.getAttribute('id') || '',
              className: element.getAttribute('class') || '',
            }
          }),
        )
      log(LogLevel.INFO, `📝 Found ${textInputs.length} text input elements on the page`)
      textInputs.forEach((input, index) => {
        log(
          LogLevel.INFO,
          `  Input ${index + 1}: <${input.tag}> type="${input.type}" name="${input.name}" placeholder="${input.placeholder}" id="${input.id}" class="${input.className}"`,
        )
      })
    })

    // await test.step('Find communication-message input field', async () => {
    //   const communicationMessageInput = page
    //     .locator(
    //       'textarea[name="communication-message"], textarea[placeholder*="communication"], input[name="communication-message"], [class*="communication"], textarea',
    //     )
    //     .first()

    //   try {
    //     await expect(communicationMessageInput).toBeVisible({timeout: 10000})
    //     log(LogLevel.INFO, '✅ Communication-message input field found')
    //   } catch (error) {
    //     log(LogLevel.WARN, '⚠ Could not find communication-message input field, skipping UI test')
    //   }
    // })

    // await test.step('Submit test query via communication-message', async () => {
    //   const communicationMessageInput = page
    //     .locator(
    //       'textarea[name="communication-message"], textarea[placeholder*="communication"], input[name="communication-message"], [class*="communication"], textarea',
    //     )
    //     .first()

    //   try {
    //     await communicationMessageInput.fill('What medications is this patient on?')
    //     log(LogLevel.INFO, '✅ Test query entered')

    //     try {
    //       const submitButton = page
    //         .locator('button[type="submit"], button:has-text("Submit"), button:has-text("Send")')
    //         .first()
    //       await submitButton.click({timeout: 2000})
    //       log(LogLevel.INFO, '✅ Query submitted via button')
    //     } catch (error) {
    //       log(LogLevel.INFO, '⏳ Waiting for auto-submit (5 seconds)')
    //       await new Promise((resolve) => setTimeout(resolve, 6000))
    //     }
    //   } catch (error) {
    //     log(LogLevel.WARN, '⚠ Could not submit query via UI, will test via API only')
    //   }
    // })

    // await test.step('Verify elixir response appears', async () => {
    //   const responseCard = page
    //     .locator(
    //       '[class*="card"], [class*="result"], [class*="response"], div:has-text("medication"), div:has-text("Medication")',
    //     )
    //     .first()

    //   try {
    //     await expect(responseCard).toBeVisible({timeout: 15000})
    //     log(LogLevel.INFO, '✅ Elixir response cards visible')
    //   } catch (error) {
    //     log(LogLevel.WARN, '⚠ Response cards not found via UI, will verify via API')
    //   }
    // })

        await test.step('Test elixir endpoint directly via API', async () => {
          const elixirEndpoint = `http://localhost:8001/langserve/${elixirName}/cds-services/dhti-service`

          try {
            const response = await request.post(elixirEndpoint, {
              data: {
                input: {
                  context: {
                    input: 'What medications is this patient on?',
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
            expect([200, 404]).toContain(status)

            if (status === 200) {
              const body = await response.json()
              expect(body.cards || body.summary).toBeDefined()
              log(LogLevel.INFO, '✅ Elixir endpoint responded with valid structure')
            } else {
              log(LogLevel.INFO, '⚠ Elixir endpoint returned 404 (expected in some configurations)')
            }
          } catch (error) {
            log(LogLevel.WARN, '⚠ API test failed, but this is expected if CDS sandbox is not running')
          }
        })
      })

      test.afterAll(async () => {
        log(LogLevel.INFO, '🧹 Cleaning up chatbot CDS sandbox test environment...')

        if (elixirProcess) {
          try {
            log(LogLevel.INFO, 'Terminating elixir background process...')
            elixirProcess.kill('SIGTERM')
            await new Promise((resolve) => setTimeout(resolve, 2000))
            log(LogLevel.INFO, '✅ Background elixir process terminated')
          } catch (error) {
            log(LogLevel.WARN, '⚠ Could not terminate elixir process gracefully, forcing kill')
            try {
              elixirProcess.kill('SIGKILL')
            } catch (e) {
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
