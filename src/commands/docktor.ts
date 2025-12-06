import {Args, Command, Flags} from '@oclif/core'
import chalk from 'chalk'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

export default class Docktor extends Command {
  static override args = {
    op: Args.string({description: 'Operation to perform (install, remove, list)', required: true}),
    name: Args.string({description: 'Name of the inference pipeline (e.g., skin-cancer-classifier)', required: false}),
  }

  static override description = 'Manage inference pipelines for MCPX'

  static override examples = [
    '<%= config.bin %> <%= command.id %> install my-pipeline --image my-image:latest --model-path ./models',
    '<%= config.bin %> <%= command.id %> remove my-pipeline',
    '<%= config.bin %> <%= command.id %> list',
  ]

  static override flags = {
    image: Flags.string({char: 'i', description: 'Docker image for the inference pipeline (required for install)'}),
    'model-path': Flags.string({char: 'm', description: 'Local path to the model directory (optional for install)'}),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Docktor)
    const mcpxConfigPath = path.join(os.homedir(), 'mcpx-config')
    const mcpJsonPath = path.join(mcpxConfigPath, 'mcp.json')

    // Ensure config directory exists
    if (!fs.existsSync(mcpxConfigPath)) {
      fs.mkdirSync(mcpxConfigPath, {recursive: true})
    }

    // Ensure mcp.json exists
    if (!fs.existsSync(mcpJsonPath)) {
      fs.writeFileSync(mcpJsonPath, JSON.stringify({mcpServers: {}}, null, 2))
    }

    const mcpConfig = JSON.parse(fs.readFileSync(mcpJsonPath, 'utf8'))

    if (args.op === 'install') {
      if (!args.name) {
        this.error('Name is required for install operation')
      }
      if (!flags.image) {
        this.error('Image is required for install operation')
      }

      const env: Record<string, string> = {}
      const binds: string[] = []

      if (flags['model-path']) {
           const absModelPath = path.resolve(flags['model-path'])
           binds.push(`${absModelPath}:/model`)
      }

      // Add socket mounting for docker tools if needed, but primarily we want the container to run as a server
      // MCPX handles the running of the docker container.
      // We need to configure it in mcp.json so MCPX picks it up.
      // Based on MCP std, docker servers are defined with `docker` command.

      mcpConfig.mcpServers[args.name] = {
        command: "docker",
        args: [
            "run",
            "-i",
            "--rm",
            ...binds.flatMap(b => ["-v", b]),
            flags.image
        ],
        env
      }

      fs.writeFileSync(mcpJsonPath, JSON.stringify(mcpConfig, null, 2))
      this.log(chalk.green(`Inference pipeline '${args.name}' added to MCPX config.`))
      this.log(chalk.yellow('Please restart the MCPX container to apply changes: docker restart dhti-mcpx-1'))

    } else if (args.op === 'remove') {
      if (!args.name) {
        this.error('Name is required for remove operation')
      }

      if (mcpConfig.mcpServers[args.name]) {
        delete mcpConfig.mcpServers[args.name]
        fs.writeFileSync(mcpJsonPath, JSON.stringify(mcpConfig, null, 2))
        this.log(chalk.green(`Inference pipeline '${args.name}' removed from MCPX config.`))
        this.log(chalk.yellow('Please restart the MCPX container to apply changes: docker restart dhti-mcpx-1'))
      } else {
        this.log(chalk.yellow(`Inference pipeline '${args.name}' not found.`))
      }

    } else if (args.op === 'list') {
      this.log(chalk.blue('Installed Inference Pipelines:'))
      for (const [name, config] of Object.entries(mcpConfig.mcpServers)) {
          this.log(`- ${name}: ${(config as any).args.join(' ')}`)
      }
    } else {
        this.error(`Unknown operation: ${args.op}`)
    }
  }
}
