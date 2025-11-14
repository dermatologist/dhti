import {execSync} from 'child_process'
import {expect} from 'chai'
import fs from 'fs'
import path from 'path'
import {fileURLToPath} from 'url'

describe('E2E Demo Script', function () {
  this.timeout(600000) // 10 minutes, adjust as needed for docker builds

  // ESM-compatible __dirname
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const demoScript = path.resolve(__dirname, '../../demo.sh')
  let output = ''

  before(function () {
    // Ensure demo.sh is executable
    fs.chmodSync(demoScript, 0o755)
  })

  it('runs demo.sh without errors', function () {
    try {
      output = execSync(demoScript, {encoding: 'utf8', stdio: 'pipe'})
    } catch (err) {
      // Print output for debugging
      if (err && typeof err === 'object') {
        const anyErr = err as any
        if (anyErr.stdout) console.log('stdout:', anyErr.stdout.toString())
        if (anyErr.stderr) console.error('stderr:', anyErr.stderr.toString())
      }
      throw err
    }
    expect(output).to.be.a('string')
    // Optionally, check for expected output fragments
    expect(output).to.include('Writing file') // Compose step
    expect(output).to.match(/dhti-cli/) // CLI output
  })
})
