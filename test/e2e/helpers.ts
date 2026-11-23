/**
 * E2E Test Helper Utilities
 *
 * Provides common functions for DHTI E2E tests including:
 * - Service health checks
 * - CLI command execution
 * - Test environment setup/teardown
 * - Output validation
 */

import {execSync, spawn} from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

/**
 * Configuration for E2E tests
 */
export const E2E_CONFIG = {
  testDir: process.env.TEST_DIR || path.join(os.homedir(), 'dhti-e2e-test'),
  timeout: parseInt(process.env.TEST_TIMEOUT || '300000'), // 5 minutes default
  verbose: process.env.VERBOSE === 'true',
}

/**
 * Log levels for test output
 */
export const LogLevel = {
  INFO: '✓ INFO',
  WARN: '⚠ WARN',
  ERROR: '✗ ERROR',
  SUCCESS: '✓ SUCCESS',
} as const

export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel]

/**
 * Colored logging function for test output
 * @param level - Log level (INFO, WARN, ERROR, SUCCESS)
 * @param message - Message to log
 */
export function log(level: LogLevel, message: string): void {
  const colors = {
    [LogLevel.INFO]: '\x1b[32m', // Green
    [LogLevel.WARN]: '\x1b[33m', // Yellow
    [LogLevel.ERROR]: '\x1b[31m', // Red
    [LogLevel.SUCCESS]: '\x1b[36m', // Cyan
    reset: '\x1b[0m',
  }

  const timestamp = new Date().toISOString().split('T')[1].slice(0, -1)
  console.log(`${colors.reset}[${timestamp}] ${colors[level]}${colors.reset} ${message}`)
}

/**
 * Wait for a service to become healthy
 * @param url - URL to check (e.g., 'http://localhost:8001/langserve')
 * @param timeout - Maximum time to wait in milliseconds
 * @param interval - Check interval in milliseconds
 * @returns true if service becomes healthy, false if timeout
 */
export async function waitForService(url: string, timeout: number = 60000, interval: number = 2000): Promise<boolean> {
  const startTime = Date.now()
  log(LogLevel.INFO, `Waiting for service: ${url} (timeout: ${timeout}ms)`)

  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(url, {method: 'GET', timeout: 5000})
      if (response.ok) {
        log(LogLevel.SUCCESS, `Service healthy: ${url}`)
        return true
      }
    } catch (error) {
      // Service not ready yet, continue waiting
    }

    await new Promise((resolve) => setTimeout(resolve, interval))
  }

  log(LogLevel.ERROR, `Service failed to become healthy: ${url}`)
  return false
}

/**
 * Run a CLI command and capture output
 * @param command - Command to execute
 * @param options - Execution options
 * @returns Object with stdout, stderr, and exit code
 */
export function runCommand(
  command: string,
  options: {
    cwd?: string
    timeout?: number
    env?: NodeJS.ProcessEnv
  } = {},
): {stdout: string; stderr: string; exitCode: number} {
  const {cwd = process.cwd(), timeout = 120000, env = process.env} = options

  log(LogLevel.INFO, `Executing: ${command}`)

  try {
    const output = execSync(command, {
      cwd,
      timeout,
      env,
      encoding: 'utf8',
      stdio: 'pipe',
    })

    log(LogLevel.SUCCESS, `Command completed successfully: ${command}`)
    return {stdout: output, stderr: '', exitCode: 0}
  } catch (error: any) {
    const stdout = error.stdout?.toString() || ''
    const stderr = error.stderr?.toString() || ''
    const exitCode = error.status || 1

    log(LogLevel.ERROR, `Command failed: ${command} (exit code: ${exitCode})`)
    if (stderr) log(LogLevel.WARN, `stderr: ${stderr.substring(0, 200)}`)

    return {stdout, stderr, exitCode}
  }
}

/**
 * Validate CLI output contains expected strings
 * @param output - CLI output to validate
 * @param expected - Array of expected strings
 * @returns true if all expected strings found
 */
export function validateCLIOutput(output: string, expected: string[]): boolean {
  const missing = expected.filter((str) => !output.includes(str))

  if (missing.length > 0) {
    log(LogLevel.ERROR, `Missing expected output: ${missing.join(', ')}`)
    return false
  }

  log(LogLevel.SUCCESS, 'Output validation passed')
  return true
}

/**
 * Setup test environment
 * @param testDir - Test directory path
 */
export function setupTestEnvironment(testDir: string = E2E_CONFIG.testDir): void {
  log(LogLevel.INFO, `Setting up test environment: ${testDir}`)

  // Create test directory if it doesn't exist
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, {recursive: true})
    log(LogLevel.SUCCESS, `Created test directory: ${testDir}`)
  }

  // Create subdirectories
  const subdirs = ['elixirs', 'conches', 'docker', 'temp']
  subdirs.forEach((subdir) => {
    const subdirPath = path.join(testDir, subdir)
    if (!fs.existsSync(subdirPath)) {
      fs.mkdirSync(subdirPath, {recursive: true})
    }
  })

  log(LogLevel.SUCCESS, 'Test environment setup complete')
}

/**
 * Teardown test environment
 * @param testDir - Test directory path
 */
export function teardownTestEnvironment(testDir: string = E2E_CONFIG.testDir): void {
  log(LogLevel.INFO, `Tearing down test environment: ${testDir}`)

  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, {recursive: true, force: true})
    log(LogLevel.SUCCESS, `Removed test directory: ${testDir}`)
  }

  log(LogLevel.SUCCESS, 'Test environment teardown complete')
}

/**
 * Read a file and return its contents
 * @param filePath - Path to file
 * @returns File contents as string
 */
export function readFile(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    log(LogLevel.ERROR, `File not found: ${filePath}`)
    throw new Error(`File not found: ${filePath}`)
  }

  return fs.readFileSync(filePath, 'utf8')
}

/**
 * Write content to a file
 * @param filePath - Path to file
 * @param content - Content to write
 */
export function writeFile(filePath: string, content: string): void {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {recursive: true})
  }

  fs.writeFileSync(filePath, content, 'utf8')
  log(LogLevel.SUCCESS, `Written file: ${filePath}`)
}

/**
 * Check if a file exists
 * @param filePath - Path to file
 * @returns true if file exists
 */
export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath)
}

/**
 * Sleep for a specified duration
 * @param ms - Milliseconds to sleep
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Retry a function multiple times
 * @param fn - Function to retry
 * @param retries - Number of retry attempts
 * @param delay - Delay between retries in milliseconds
 * @returns Result of the function
 */
export async function retry<T>(fn: () => Promise<T>, retries: number = 3, delay: number = 1000): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      log(LogLevel.INFO, `Attempt ${attempt}/${retries}`)
      return await fn()
    } catch (error: any) {
      lastError = error
      log(LogLevel.WARN, `Attempt ${attempt} failed: ${error.message}`)

      if (attempt < retries) {
        await sleep(delay)
      }
    }
  }

  log(LogLevel.ERROR, `All ${retries} attempts failed`)
  throw lastError || new Error('Unknown error')
}

/**
 * Generate a unique test identifier
 * @returns Unique string
 */
export function generateTestId(): string {
  return `test-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Parse Docker Compose output to extract service URLs
 * @param output - Docker Compose output
 * @returns Map of service names to URLs
 */
export function parseDockerComposeOutput(output: string): Map<string, string> {
  const services = new Map<string, string>()
  const lines = output.split('\n')

  for (const line of lines) {
    // Match patterns like "dhti_gateway-1  | Listening on http://0.0.0.0:80"
    const match = line.match(/Listening on http:\/\/0\.0\.0\.0:(\d+)/)
    if (match) {
      const port = match[1]
      services.set(`http://localhost:${port}`, `http://localhost:${port}`)
    }
  }

  return services
}

/**
 * Extract application URL from elixir start output
 * @param output - Elixir start output
 * @returns Application URL or null
 */
export function extractAppUrl(output: string): string | null {
  const match = output.match(/Application URL:?\s*(http:\/\/[\w:.]+)/)
  return match ? match[1] : null
}

/**
 * Check if Docker is running
 * @returns true if Docker is running
 */
export function isDockerRunning(): boolean {
  try {
    execSync('docker info', {stdio: 'ignore'})
    return true
  } catch {
    return false
  }
}

/**
 * Check if a port is in use
 * @param port - Port number to check
 * @returns true if port is in use
 */
export function isPortInUse(port: number): boolean {
  try {
    const net = require('net')
    const server = net.createServer()

    return new Promise((resolve) => {
      server.once('error', () => resolve(true))
      server.once('listening', () => {
        server.close()
        resolve(false)
      })
      server.listen(port, '127.0.0.1')
    })
  } catch {
    return false
  }
}
