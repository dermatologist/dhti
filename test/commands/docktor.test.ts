import {runCommand} from '@oclif/test'
import {expect} from 'chai'
import fs from 'node:fs'
import {promises as fsPromises} from 'node:fs'
import os from 'node:os'
import path from 'node:path'

describe('docktor', () => {
  const testWorkdir = path.join(os.homedir(), 'mcpx-test-workdir')
  const mcpxConfigPath = path.join(testWorkdir, 'config')
  const mcpJsonPath = path.join(mcpxConfigPath, 'mcp.json')

  // Helper to ensure clean state
  const cleanUp = async () => {
    try {
      await fsPromises.rm(testWorkdir, {recursive: true, force: true})
    } catch (error) {
      // Directory may not exist, which is fine
    }
  }

  before(cleanUp)
  after(cleanUp)

  it('installs a pipeline', async () => {
    const {stdout} = await runCommand([
      'docktor',
      'install',
      'test-pipeline',
      '--image',
      'test-image',
      '--model-path',
      './models',
      '--workdir',
      testWorkdir,
    ])
    expect(stdout).to.contain("Inference pipeline 'test-pipeline' added")

    const configContent = await fsPromises.readFile(mcpJsonPath, 'utf8')
    const config = JSON.parse(configContent)
    expect(config.mcpServers['test-pipeline']).to.exist
    expect(config.mcpServers['test-pipeline'].command).to.equal('docker')
    expect(config.mcpServers['test-pipeline'].args).to.include('test-image')
  })

  it('lists pipelines', async () => {
    // Manually inject a config to test listing
    await fsPromises.mkdir(mcpxConfigPath, {recursive: true})
    const config = {mcpServers: {'existing-pipeline': {command: 'docker', args: ['existing-image']}}}
    await fsPromises.writeFile(mcpJsonPath, JSON.stringify(config))

    const {stdout} = await runCommand(['docktor', 'list', '--workdir', testWorkdir])
    expect(stdout).to.contain('existing-pipeline')
  })

  it('removes a pipeline', async () => {
    // Setup initial state
    await fsPromises.mkdir(mcpxConfigPath, {recursive: true})
    const setupConfig = {mcpServers: {'test-pipeline': {command: 'docker', args: ['test-image']}}}
    await fsPromises.writeFile(mcpJsonPath, JSON.stringify(setupConfig))

    const {stdout} = await runCommand(['docktor', 'remove', 'test-pipeline', '--workdir', testWorkdir])
    expect(stdout).to.contain("Inference pipeline 'test-pipeline' removed")

    const configContent = await fsPromises.readFile(mcpJsonPath, 'utf8')
    const config = JSON.parse(configContent)
    expect(config.mcpServers['test-pipeline']).to.not.exist
  })
})
