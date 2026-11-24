/**
 * Shared validation utilities for DHTI CLI
 */

/**
 * Validates that required flags are present
 * @param flags - The flags object to validate
 * @param required - Array of required flag names
 * @param operation - The operation name for error messages
 * @throws Error if any required flag is missing
 */
export function validateRequiredFlags(
  flags: Record<string, unknown>,
  required: string[],
  operation: string
): void {
  for (const flag of required) {
    if (!flags[flag]) {
      throw new Error(`${flag} flag is required for ${operation} operation`)
    }
  }
}

/**
 * Validates environment variable format (KEY=VALUE)
 * @param envVar - The environment variable string to validate
 * @returns true if format is valid
 */
export function validateEnvVarFormat(envVar: string): boolean {
  const idx = envVar.indexOf('=')
  return idx > 0 && idx < envVar.length - 1
}

/**
 * Validates Docker image name format
 * @param image - The Docker image name to validate
 * @returns true if format is valid
 */
export function validateDockerImageName(image: string): boolean {
  // Basic Docker image name validation
  // Allows: repository/image:tag or image:tag
  const pattern = /^[a-z0-9]+([._-][a-z0-9]+)*[/]([a-z0-9]{2,}[._-])?[a-z0-9]{2,}(:[\w.-]+)?$/i
  return pattern.test(image)
}

/**
 * Validates git URL format
 * @param gitUrl - The git URL to validate
 * @returns true if format is valid
 */
export function validateGitUrl(gitUrl: string): boolean {
  // Supports HTTPS and SSH git URLs
  const httpsPattern = /^https:\/\/[^\s/$.?#].[^\s]*$/i
  const sshPattern = /^git@[\w.-]+:[\w.-]+\/[\w.-]+\.git$/i
  return httpsPattern.test(gitUrl) || sshPattern.test(gitUrl)
}

/**
 * Validates that a path doesn't escape a base directory
 * @param basePath - The base directory
 * @param filePath - The file path to validate
 * @returns true if path is safe
 */
export function validatePathSafety(basePath: string, filePath: string): boolean {
  const resolvedBase = require('node:path').resolve(basePath)
  const resolvedPath = require('node:path').resolve(filePath)
  return resolvedPath.startsWith(resolvedBase)
}

/**
 * Sanitizes input for shell commands
 * @param input - The input string to sanitize
 * @returns sanitized string
 */
export function sanitizeShellInput(input: string): string {
  // Remove potentially dangerous characters
  return input.replace(/[;|&$`\\]/g, '')
}
