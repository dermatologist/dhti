/**
 * Docker Test Utilities
 *
 * Provides functions for managing Docker containers and images during E2E tests:
 * - Build Docker images
 * - Start/stop Docker Compose services
 * - Health checks for services
 * - Cleanup containers and images
 */

import {execSync} from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'

import {LogLevel, log, sleep, waitForService} from './helpers.js'

/**
 * Docker test configuration
 */
export const DOCKER_CONFIG = {
  composeFile: 'docker-compose.yml',
  testLabel: 'dhti-e2e-test',
  timeout: 120_000, // 2 minutes for Docker operations
}

/**
 * Build a Docker image
 * @param imageName - Name for the image (e.g., 'test-elixir:1.0')
 * @param context - Build context path
 * @param dockerfile - Dockerfile path (optional)
 * @returns Build output
 */
export function buildImage(
  imageName: string,
  context: string,
  dockerfile?: string,
): {error: string; output: string; success: boolean} {
  log(LogLevel.INFO, `Building Docker image: ${imageName}`)
  log(LogLevel.INFO, `Context: ${context}`)

  const args = ['-t', imageName, context]

  if (dockerfile) {
    args.unshift('-f', dockerfile)
  }

  try {
    const output = execSync(`docker build ${args.join(' ')}`, {
      encoding: 'utf8',
      timeout: DOCKER_CONFIG.timeout,
    })

    log(LogLevel.SUCCESS, `Docker image built successfully: ${imageName}`)
    return {error: '', output, success: true}
  } catch (error: any) {
    const output = error.stdout?.toString() || ''
    const errorStr = error.stderr?.toString() || error.message

    log(LogLevel.ERROR, `Failed to build Docker image: ${imageName}`)
    log(LogLevel.ERROR, errorStr)

    return {error: errorStr, output, success: false}
  }
}

/**
 * Start Docker Compose services
 * @param composeFile - Path to docker-compose.yml
 * @param detached - Start in detached mode (default: true)
 * @returns Start output
 */
export function startServices(
  composeFile: string = DOCKER_CONFIG.composeFile,
  detached: boolean = true,
): {error: string; output: string; success: boolean} {
  log(LogLevel.INFO, `Starting Docker Compose services from: ${composeFile}`)

  if (!fs.existsSync(composeFile)) {
    log(LogLevel.ERROR, `Compose file not found: ${composeFile}`)
    return {
      error: `Compose file not found: ${composeFile}`,
      output: '',
      success: false,
    }
  }

  const args = detached ? ['-f', composeFile, 'up', '-d'] : ['-f', composeFile, 'up']

  try {
    const output = execSync(`docker compose ${args.join(' ')}`, {
      encoding: 'utf8',
      timeout: DOCKER_CONFIG.timeout,
    })

    log(LogLevel.SUCCESS, 'Docker Compose services started')
    return {error: '', output, success: true}
  } catch (error: any) {
    const output = error.stdout?.toString() || ''
    const errorStr = error.stderr?.toString() || error.message

    log(LogLevel.ERROR, 'Failed to start Docker Compose services')
    log(LogLevel.ERROR, errorStr)

    return {error: errorStr, output, success: false}
  }
}

/**
 * Stop and remove Docker Compose services
 * @param composeFile - Path to docker-compose.yml
 * @param removeVolumes - Also remove volumes (default: true)
 * @returns Stop output
 */
export function stopServices(
  composeFile: string = DOCKER_CONFIG.composeFile,
  removeVolumes: boolean = true,
): {error: string; output: string; success: boolean} {
  log(LogLevel.INFO, `Stopping Docker Compose services`)

  const args = removeVolumes ? ['-f', composeFile, 'down', '-v'] : ['-f', composeFile, 'down']

  try {
    const output = execSync(`docker compose ${args.join(' ')}`, {
      encoding: 'utf8',
      timeout: DOCKER_CONFIG.timeout,
    })

    log(LogLevel.SUCCESS, 'Docker Compose services stopped')
    return {error: '', output, success: true}
  } catch (error: any) {
    const output = error.stdout?.toString() || ''
    const errorStr = error.stderr?.toString() || error.message

    log(LogLevel.WARN, `Warning stopping services: ${errorStr}`)

    // Don't treat stop failures as critical errors
    return {error: errorStr, output, success: true}
  }
}

/**
 * Restart Docker Compose services
 * @param composeFile - Path to docker-compose.yml
 * @returns Restart output
 */
export function restartServices(composeFile: string = DOCKER_CONFIG.composeFile): {
  error: string
  output: string
  success: boolean
} {
  log(LogLevel.INFO, `Restarting Docker Compose services`)

  try {
    const output = execSync(`docker compose -f ${composeFile} restart`, {
      encoding: 'utf8',
      timeout: DOCKER_CONFIG.timeout,
    })

    log(LogLevel.SUCCESS, 'Docker Compose services restarted')
    return {error: '', output, success: true}
  } catch (error: any) {
    const output = error.stdout?.toString() || ''
    const errorStr = error.stderr?.toString() || error.message

    log(LogLevel.ERROR, 'Failed to restart Docker Compose services')
    log(LogLevel.ERROR, errorStr)

    return {error: errorStr, output, success: false}
  }
}

/**
 * Check health of a specific service
 * @param serviceName - Name of the service
 * @param port - Port to check
 * @param timeout - Timeout in milliseconds
 * @returns true if service is healthy
 */
export async function checkServiceHealth(serviceName: string, port: number, timeout: number = 60_000): Promise<boolean> {
  const url = `http://localhost:${port}`
  log(LogLevel.INFO, `Checking health of ${serviceName} at ${url}`)

  return await waitForService(url, timeout)
}

/**
 * Get logs from a Docker container
 * @param containerName - Name or ID of the container
 * @param tail - Number of lines to tail (default: 50)
 * @returns Container logs
 */
export function getContainerLogs(containerName: string, tail: number = 50): string {
  try {
    const logs = execSync(`docker logs --tail ${tail} ${containerName}`, {
      encoding: 'utf8',
    })
    return logs
  } catch (error: any) {
    log(LogLevel.ERROR, `Failed to get logs for ${containerName}: ${error.message}`)
    return error.message
  }
}

/**
 * Get status of all Docker containers
 * @returns Array of container statuses
 */
export function getContainerStatus(): Array<{name: string; ports: string; status: string}> {
  try {
    const output = execSync('docker ps -a --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"', {
      encoding: 'utf8',
    })

    const lines = output.trim().split('\n').slice(1) // Skip header
    const statuses = []

    for (const line of lines) {
      const parts = line.split('\t')
      if (parts.length >= 3) {
        statuses.push({
          name: parts[0].trim(),
          ports: parts[2].trim(),
          status: parts[1].trim(),
        })
      }
    }

    return statuses
  } catch (error: any) {
    log(LogLevel.ERROR, `Failed to get container status: ${error.message}`)
    return []
  }
}

/**
 * List all Docker images
 * @returns Array of image names
 */
export function listImages(): string[] {
  try {
    const output = execSync('docker images --format "{{.Repository}}:{{.Tag}}"', {
      encoding: 'utf8',
    })

    return output
      .trim()
      .split('\n')
      .filter((img) => img.length > 0)
  } catch (error: any) {
    log(LogLevel.ERROR, `Failed to list images: ${error.message}`)
    return []
  }
}

/**
 * Remove a Docker image
 * @param imageName - Name of the image to remove
 * @param force - Force removal (default: false)
 * @returns true if removed successfully
 */
export function removeImage(imageName: string, force: boolean = false): boolean {
  log(LogLevel.INFO, `Removing Docker image: ${imageName}`)

  try {
    const args = force ? ['-f', imageName] : [imageName]
    execSync(`docker rmi ${args.join(' ')}`, {
      encoding: 'utf8',
      stdio: 'ignore',
    })

    log(LogLevel.SUCCESS, `Removed Docker image: ${imageName}`)
    return true
  } catch (error: any) {
    log(LogLevel.WARN, `Failed to remove image ${imageName}: ${error.message}`)
    return false
  }
}

/**
 * Cleanup all test-related Docker resources
 * Removes containers and images with the test label
 */
export function cleanupAll(): void {
  log(LogLevel.INFO, 'Cleaning up all Docker test resources')

  // Get all containers
  const containers = getContainerStatus()

  // Stop test containers
  for (const container of containers) {
    if (container.name.includes('dhti') || container.name.includes('test')) {
      try {
        log(LogLevel.INFO, `Stopping container: ${container.name}`)
        execSync(`docker stop ${container.name}`, {encoding: 'utf8', stdio: 'ignore'})
        execSync(`docker rm ${container.name}`, {encoding: 'utf8', stdio: 'ignore'})
        log(LogLevel.SUCCESS, `Removed container: ${container.name}`)
      } catch {
        // Ignore errors during cleanup
      }
    }
  }

  // Get all images
  const images = listImages()

  // Remove test images
  for (const image of images) {
    if (image.includes('test') || image.includes('dhti-e2e')) {
      removeImage(image, true)
    }
  }

  // Remove orphaned networks
  try {
    const networks = execSync('docker network ls --filter "label=dhti-e2e-test" --format "{{.Name}}"', {
      encoding: 'utf8',
    })

    const networkList = networks
      .trim()
      .split('\n')
      .filter((n) => n.length > 0)
    for (const network of networkList) {
      try {
        execSync(`docker network rm ${network}`, {encoding: 'utf8', stdio: 'ignore'})
        log(LogLevel.SUCCESS, `Removed network: ${network}`)
      } catch {
        // Ignore errors during cleanup
      }
    }
  } catch {
    // No labeled networks found
  }

  log(LogLevel.SUCCESS, 'Docker cleanup complete')
}

/**
 * Wait for all services to be healthy
 * @param services - Array of service configurations
 * @param timeout - Total timeout for all services
 * @returns true if all services are healthy
 */
export async function waitForAllServices(
  services: Array<{name: string; port: number}>,
  timeout: number = 120_000,
): Promise<boolean> {
  log(LogLevel.INFO, `Waiting for ${services.length} services to become healthy`)

  const startTime = Date.now()
  const serviceTimeout = Math.min(timeout / services.length, 30_000)

  for (const service of services) {
    if (Date.now() - startTime >= timeout) {
      log(LogLevel.ERROR, 'Timeout waiting for services')
      return false
    }

    const healthy = await checkServiceHealth(service.name, service.port, serviceTimeout)

    if (!healthy) {
      log(LogLevel.ERROR, `Service ${service.name} failed health check`)
      return false
    }
  }

  log(LogLevel.SUCCESS, 'All services are healthy')
  return true
}

/**
 * Check if Docker is running
 * @returns true if Docker daemon is running
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
 * Get Docker Compose service names from compose file
 * @param composeFile - Path to docker-compose.yml
 * @returns Array of service names
 */
export function getComposeServices(composeFile: string = DOCKER_CONFIG.composeFile): string[] {
  if (!fs.existsSync(composeFile)) {
    log(LogLevel.ERROR, `Compose file not found: ${composeFile}`)
    return []
  }

  try {
    const yaml = require('js-yaml')
    const composeContent = fs.readFileSync(composeFile, 'utf8')
    const composeData = yaml.load(composeContent) as any

    return Object.keys(composeData.services || {})
  } catch (error: any) {
    log(LogLevel.ERROR, `Failed to parse compose file: ${error.message}`)
    return []
  }
}

/**
 * Tag and push a Docker image (for testing registry pushes)
 * @param imageName - Local image name
 * @param taggedName - Tagged image name (e.g., 'registry/image:tag')
 * @returns Push result
 */
export function pushImage(imageName: string, taggedName: string): {error: string; output: string; success: boolean} {
  log(LogLevel.INFO, `Tagging and pushing image: ${imageName} -> ${taggedName}`)

  try {
    // Tag the image
    execSync(`docker tag ${imageName} ${taggedName}`, {encoding: 'utf8'})
    log(LogLevel.SUCCESS, `Tagged image: ${taggedName}`)

    // Push the image
    const output = execSync(`docker push ${taggedName}`, {
      encoding: 'utf8',
      timeout: DOCKER_CONFIG.timeout,
    })

    log(LogLevel.SUCCESS, `Pushed image: ${taggedName}`)
    return {error: '', output, success: true}
  } catch (error: any) {
    const output = error.stdout?.toString() || ''
    const errorStr = error.stderr?.toString() || error.message

    log(LogLevel.ERROR, `Failed to push image: ${taggedName}`)
    log(LogLevel.ERROR, errorStr)

    return {error: errorStr, output, success: false}
  }
}
