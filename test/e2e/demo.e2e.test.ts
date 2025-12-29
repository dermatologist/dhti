import {expect} from 'chai'
import {execSync} from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

describe('E2E Demo Script', function () {
  this.timeout(600_000) // 10 minutes, adjust as needed for docker builds

  // ESM-compatible __dirname
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const demoScript = path.resolve(__dirname, '../../e2e.sh')
  let output = ''

  before(() => {
    // Ensure demo.sh is executable
    fs.chmodSync(demoScript, 0o755)
  })

  it('runs demo.sh without errors', () => {
    try {
      output = execSync(demoScript, {encoding: 'utf8', stdio: 'pipe'})
    } catch (error) {
      // Print output for debugging
      if (error && typeof error === 'object') {
        const anyErr = error as any
        if (anyErr.stdout) console.log('stdout:', anyErr.stdout.toString())
        if (anyErr.stderr) console.error('stderr:', anyErr.stderr.toString())
      }

      throw error
    }

    expect(output).to.be.a('string')
    // Optionally, check for expected output fragments
    expect(output).to.include('Writing file') // Compose step
    expect(output).to.match(/dhti-cli/) // CLI output
  })
})
