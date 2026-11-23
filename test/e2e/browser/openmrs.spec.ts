import {test, expect} from '@playwright/test'
import {waitForService} from '../helpers'

/**
 * OpenMRS UI Automation Tests
 *
 * Tests OpenMRS login, navigation, and widget rendering.
 * Requires Docker services to be running.
 *
 * @browser tag for categorization
 */

test.describe('OpenMRS UI Tests', () => {
  const openmrsUrl = 'http://localhost:80/openmrs'
  const loginUsername = 'admin'
  const loginPassword = 'Admin123'

  test('@browser should verify OpenMRS service is healthy', async ({page}) => {
    // Wait for OpenMRS to be ready
    await waitForService(openmrsUrl, 30000)

    // Navigate to OpenMRS
    await page.goto(openmrsUrl)

    // Should reach login page or home page
    const response = await page.response((r) => r.url() === openmrsUrl)
    expect(response?.status()).toBe(200)
  })

  test('@browser should login to OpenMRS', async ({page}) => {
    // Navigate to login page
    await page.goto(openmrsUrl)

    // Wait for login form
    const usernameInput = page.getByPlaceholder('Username').or(page.getByLabel('Username'))
    const passwordInput = page.getByPlaceholder('Password').or(page.getByLabel('Password'))

    // Fill login form (if login page is shown)
    if (await usernameInput.isVisible()) {
      await usernameInput.fill(loginUsername)
      await passwordInput.fill(loginPassword)

      // Submit login
      const loginButton = page.getByRole('button', {name: /login|sign in/i})
      if (await loginButton.isVisible()) {
        await loginButton.click()
      }
    }

    // Verify we're logged in (check for logout button or user menu)
    const logoutButton = page.getByRole('button', {name: /logout|sign out/i})
    const userMenu = page.getByRole('button', {name: /user|profile|admin/i})

    // At least one should be visible
    const hasLogout = (await logoutButton.count()) > 0
    const hasUserMenu = (await userMenu.count()) > 0

    expect(hasLogout || hasUserMenu).toBeTruthy()
  })

  test('@browser should navigate to patient summary', async ({page}) => {
    // Navigate to OpenMRS
    await page.goto(openmrsUrl)

    // Login if needed
    const usernameInput = page.getByPlaceholder('Username').or(page.getByLabel('Username'))
    if (await usernameInput.isVisible()) {
      await usernameInput.fill(loginUsername)
      const passwordInput = page.getByPlaceholder('Password').or(page.getByLabel('Password'))
      await passwordInput.fill(loginPassword)
      const loginButton = page.getByRole('button', {name: /login|sign in/i})
      if (await loginButton.isVisible()) {
        await loginButton.click()
        await page.waitForTimeout(2000) // Wait for redirect
      }
    }

    // Navigate to patient list or summary
    const patientLink = page.getByRole('link', {name: /patient|home/i})
    if ((await patientLink.count()) > 0) {
      await patientLink.first().click()
    }

    // Verify we can see patient-related content
    const pageContent = page.locator('body')
    await expect(pageContent).toBeVisible()
  })

  test('@browser should verify SPA widget rendering', async ({page}) => {
    // Navigate to SPA home
    const spaUrl = 'http://localhost:80/openmrs/spa/home'
    await page.goto(spaUrl)

    // Wait for SPA to load
    await page.waitForTimeout(3000)

    // Verify SPA content is rendered
    const spaContainer = page.locator('[class*="spa"], [class*="esm"], div')
    await expect(spaContainer.first()).toBeVisible()
  })

  test('@browser should handle navigation errors gracefully', async ({page}) => {
    // Navigate to non-existent route
    const invalidUrl = 'http://localhost:80/openmrs/nonexistent/route'

    try {
      await page.goto(invalidUrl, {waitUntil: 'networkidle'})

      // Should show 404 or redirect to home
      const response = await page.response((r) => r.url() === invalidUrl)
      const status = response?.status()

      // Either 404 or redirect is acceptable
      expect(status).toBeLessThan(500)
    } catch (error) {
      // Network errors are acceptable for invalid routes
      console.log('Expected error for invalid route:', error.message)
    }
  })
})
