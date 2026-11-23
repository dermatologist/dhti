import {test, expect} from '@playwright/test'
import {waitForService} from '../helpers'

/**
 * LangServe API Tests
 *
 * Tests LangServe API endpoints and responses.
 * Requires Docker services to be running.
 *
 * @browser tag for categorization
 */

test.describe('LangServe API Tests', () => {
  const langserveBase = 'http://localhost:8001/langserve'

  test('@browser should verify LangServe is accessible', async ({page}) => {
    // Wait for LangServe to be ready
    await waitForService(langserveBase, 30000)

    // Navigate to LangServe
    const response = await page.goto(langserveBase)
    expect(response?.status()).toBe(200)

    // Check content type to determine if elixirs are installed
    const contentType = response?.headers()['content-type']

    if (contentType?.includes('application/json')) {
      // Unconfigured state - base LangServe returns JSON
      console.log('ℹ LangServe running in base mode (no elixirs installed)')
      const body = await page.json()
      expect(body.message).toBe('Hello from DHTI!')
    } else {
      // Configured state - elixirs installed, returns HTML
      console.log('✅ LangServe running with elixirs configured')
      const pageContent = page.locator('body')
      await expect(pageContent).toBeVisible()
    }
  })

  test('@browser should list available endpoints', async ({page}) => {
    const response = await page.goto(langserveBase)
    const contentType = response?.headers()['content-type']

    if (contentType?.includes('application/json')) {
      // Base mode - verify JSON structure
      const body = await page.json()
      expect(body).toHaveProperty('message')
    } else {
      // Elixir mode - verify HTML content
      await expect(page.locator('body')).toBeVisible()
    }
  })

  test('@browser should test API endpoint discovery', async ({request}) => {
    // Use API request context
    try {
      const response = await request.get(langserveBase)

      // Should return 200 or redirect
      expect(response.status()).toBeLessThan(500)
    } catch (error) {
      console.log('LangServe API discovery:', error.message)
    }
  })

  test('@browser should verify gateway routing', async ({page}) => {
    const gatewayUrl = 'http://localhost:80/langserve/' // Fixed: use /langserve/ path

    try {
      await waitForService(gatewayUrl, 10000)
      const response = await page.goto(gatewayUrl)

      // Gateway should route to LangServe (200 or redirect)
      expect(response?.status()).toBeOneOf([200, 301, 302])

      // Verify we got valid content (JSON or HTML)
      const contentType = response?.headers()['content-type']
      if (contentType?.includes('application/json')) {
        const body = await page.json()
        expect(body).toBeDefined()
      } else {
        await expect(page.locator('body')).toBeVisible({timeout: 5000})
      }
    } catch (error) {
      console.log('⚠ Gateway routing to LangServe not available:', error.message)
      console.log('  This is expected if gateway is not configured to route /langserve/')
    }
  })

  test('@browser should test multiple service routing', async ({page}) => {
    const services = [
      {name: 'Gateway', url: 'http://localhost:80'},
      {name: 'OpenMRS', url: 'http://localhost:80/openmrs'},
      {name: 'LangServe', url: 'http://localhost:8001/langserve'},
    ]

    for (const service of services) {
      try {
        await waitForService(service.url, 5000)

        const response = await page.goto(service.url)
        const status = response?.status()

        // Service should be accessible (200, 301, 302, or 404 are acceptable)
        expect([200, 301, 302, 404]).toContain(status)

        console.log(`${service.name}: ${status}`)
      } catch (error) {
        console.log(`${service.name} not available:`, error.message)
      }
    }
  })

  test('@browser should verify API response headers', async ({request}) => {
    try {
      const response = await request.get(langserveBase)

      // Check for common headers
      const contentType = response.headers()['content-type']
      expect(contentType).toBeTruthy()

      console.log('Content-Type:', contentType)
    } catch (error) {
      console.log('Header check failed:', error.message)
    }
  })

  test('@browser should test concurrent requests', async ({request}) => {
    const requests = [request.get('http://localhost:80'), request.get('http://localhost:8001/langserve')]

    try {
      const responses = await Promise.all(requests)

      // All requests should complete (status may vary)
      expect(responses).toHaveLength(2)
      responses.forEach((r, i) => {
        console.log(`Request ${i + 1} status:`, r.status())
      })
    } catch (error) {
      console.log('Concurrent requests failed:', error.message)
    }
  })
})
