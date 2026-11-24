/**
 * Shared file system utilities for DHTI CLI
 */

import fs from 'node:fs'
import path from 'node:path'
import chalk from 'chalk'

/**
 * Ensures a directory exists, creating it if necessary
 * @param dirPath - The directory path to ensure exists
 * @param dryRun - If true, only logs what would be done
 */
export function ensureDirectory(dirPath: string, dryRun: boolean = false): void {
  if (dryRun) {
    if (!fs.existsSync(dirPath)) {
      console.log(chalk.yellow(`[DRY RUN] Would create directory: ${dirPath}`))
    }
    return
  }

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

/**
 * Reads and parses a JSON file
 * @param filePath - Path to the JSON file
 * @returns Parsed JSON data
 * @throws Error if file doesn't exist or is invalid JSON
 */
export function readJsonFile<T>(filePath: string): T {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`)
  }
  const content = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(content) as T
}

/**
 * Writes data to a JSON file with formatting
 * @param filePath - Path to the JSON file
 * @param data - Data to write
 * @param dryRun - If true, only logs what would be done
 */
export function writeJsonFile<T>(filePath: string, data: T, dryRun: boolean = false): void {
  if (dryRun) {
    console.log(chalk.yellow(`[DRY RUN] Would write to: ${filePath}`))
    return
  }

  // Ensure directory exists
  const dirPath = path.dirname(filePath)
  if (dirPath && dirPath !== '.') {
    ensureDirectory(dirPath)
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
}

/**
 * Reads a text file
 * @param filePath - Path to the file
 * @returns File contents
 * @throws Error if file doesn't exist
 */
export function readTextFile(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`)
  }
  return fs.readFileSync(filePath, 'utf8')
}

/**
 * Writes text to a file
 * @param filePath - Path to the file
 * @param content - Content to write
 * @param dryRun - If true, only logs what would be done
 */
export function writeTextFile(filePath: string, content: string, dryRun: boolean = false): void {
  if (dryRun) {
    console.log(chalk.yellow(`[DRY RUN] Would write to: ${filePath}`))
    return
  }

  // Ensure directory exists
  const dirPath = path.dirname(filePath)
  if (dirPath && dirPath !== '.') {
    ensureDirectory(dirPath)
  }

  fs.writeFileSync(filePath, content, 'utf8')
}

/**
 * Checks if a file exists
 * @param filePath - Path to the file
 * @returns true if file exists
 */
export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath)
}

/**
 * Copies a file from source to destination
 * @param src - Source file path
 * @param dest - Destination file path
 * @param dryRun - If true, only logs what would be done
 */
export function copyFile(src: string, dest: string, dryRun: boolean = false): void {
  if (dryRun) {
    console.log(chalk.yellow(`[DRY RUN] Would copy ${src} to ${dest}`))
    return
  }

  if (!fs.existsSync(src)) {
    throw new Error(`Source file not found: ${src}`)
  }

  // Ensure destination directory exists
  const destDir = path.dirname(dest)
  if (destDir && destDir !== '.') {
    ensureDirectory(destDir)
  }

  fs.copyFileSync(src, dest)
}
