import {runCommand} from '@oclif/test'
import {expect} from 'chai'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

describe('docktor', () => {
  const mcpxConfigPath = path.join(os.homedir(), 'mcpx-config')
  const mcpJsonPath = path.join(mcpxConfigPath, 'mcp.json')

  // Helper to ensure clean state
  const cleanUp = () => {
    if (fs.existsSync(mcpxConfigPath)) {
        fs.rmSync(mcpxConfigPath, {recursive: true, force: true})
    }
  }

  before(cleanUp)
  after(cleanUp)

  it('installs a pipeline', async () => {
    const {stdout} = await runCommand(['docktor', 'install', 'test-pipeline', '--image', 'test-image', '--model-path', './models'])
    expect(stdout).to.contain("Inference pipeline 'test-pipeline' added")

    const config = JSON.parse(fs.readFileSync(mcpJsonPath, 'utf8'))
    expect(config.mcpServers['test-pipeline']).to.exist
    expect(config.mcpServers['test-pipeline'].command).to.equal('docker')
    expect(config.mcpServers['test-pipeline'].args).to.include('test-image')
  })

  it('lists pipelines', async () => {
    // Manually inject a config to test listing
    if (!fs.existsSync(mcpxConfigPath)) fs.mkdirSync(mcpxConfigPath, {recursive: true})
    const config = {mcpServers: {'existing-pipeline': {command: 'docker', args: ['existing-image']}}}
    fs.writeFileSync(mcpJsonPath, JSON.stringify(config))

    const {stdout} = await runCommand(['docktor', 'list'])
    expect(stdout).to.contain('existing-pipeline')
  })

  it('removes a pipeline', async () => {
    // Setup initial state
    if (!fs.existsSync(mcpxConfigPath)) fs.mkdirSync(mcpxConfigPath, {recursive: true})
    const setupConfig = {mcpServers: {'test-pipeline': {command: 'docker', args: ['test-image']}}}
    fs.writeFileSync(mcpJsonPath, JSON.stringify(setupConfig))

    const {stdout} = await runCommand(['docktor', 'remove', 'test-pipeline'])
    expect(stdout).to.contain("Inference pipeline 'test-pipeline' removed")

    const config = JSON.parse(fs.readFileSync(mcpJsonPath, 'utf8'))
    expect(config.mcpServers['test-pipeline']).to.not.exist
  })
})
