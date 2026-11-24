import {defineConfig, devices} from '@playwright/test'

/**
 * Playwright configuration for DHTI E2E tests
 * https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Test directory
  testDir: './test/e2e',

  // Timeout settings
  timeout: 30 * 1000, // 30 seconds per test
  expect: {
    timeout: 5000, // 5 seconds for expectations
  },

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only for flaky tests
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI since Docker tests need sequential execution
  workers: process.env.CI ? 1 : undefined,

  // Reporter: use html for local, list+json for CI
  reporter: process.env.CI ? 'list' : [['html', {open: 'never'}], ['list']],

  // Shared settings for all projects
  use: {
    // Base URL for all requests (DHTI gateway)
    baseURL: 'http://localhost:80',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',
  },

  // Configure projects for different test categories
  projects: [
    // Browser automation tests
    {
      name: 'browser-tests',
      testMatch: '**/browser/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        viewport: {width: 1280, height: 720},
      },
    },

    // Workflow integration tests
    {
      name: 'workflow-tests',
      testMatch: '**/workflows/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        viewport: {width: 1280, height: 720},
      },
    },
  ],

  // Ignore non-Playwright test files
  ignorePatterns: ['**/*.e2e.test.ts', '**/helpers.ts', '**/docker-utils.ts'],
})
