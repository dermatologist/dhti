import {Args, Command, Flags} from '@oclif/core'
import chalk from 'chalk'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

export default class Docktor extends Command {
  static override args = {
    op: Args.string({description: 'Operation to perform (install, remove, restart, list)', required: true}),
    name: Args.string({description: 'Name of the inference pipeline (e.g., skin-cancer-classifier)', required: false}),
  }

  static override description = 'Manage inference pipelines for MCPX'

  static override examples = [
    '<%= config.bin %> <%= command.id %> install my-pipeline --image my-image:latest --model-path ./models',
    '<%= config.bin %> <%= command.id %> remove my-pipeline',
    '<%= config.bin %> <%= command.id %> list',
  ]

  static override flags = {
    container: Flags.string({
      char: 'c',
      default: 'dhti-mcpx-1',
      description: 'Docker container name for MCPX (use docker ps to find the correct name)',
    }),
    environment: Flags.string({
      char: 'e',
      description: 'Environment variables to pass to docker (format: VAR=value)',
      multiple: true,
    }),
    image: Flags.string({char: 'i', description: 'Docker image for the inference pipeline (required for install)'}),
    'model-path': Flags.string({
      char: 'm',
      default: '/lunar/packages/mcpx-server/config',
      description: 'Local path to the model directory (optional for install)',
    }),
    workdir: Flags.string({
      char: 'w',
      default: `${os.homedir()}/dhti`,
      description: 'Working directory for MCPX config',
    }),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Docktor)

    const mcpxConfigPath = path.join(flags.workdir, 'config')
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

    // Ensure mcpServers exists
    if (!mcpConfig.mcpServers) {
      mcpConfig.mcpServers = {}
    }

    switch (args.op) {
      case 'install': {
        if (!args.name) {
          this.error('Name is required for install operation')
        }

        if (!flags.image) {
          this.error('Image is required for install operation')
        }

        const binds: string[] = []
        const envVars: string[] = []

        if (flags['model-path']) {
          const absModelPath = path.resolve(flags['model-path'])
          binds.push(`${absModelPath}:/model`)
        }

        if (flags.environment && flags.environment.length > 0) {
          const invalidEnvVars = flags.environment.filter((e) => {
            const idx = e.indexOf('=')
            return idx <= 0 || idx === e.length - 1
          })

          if (invalidEnvVars.length > 0) {
            this.error(
              `Invalid environment variable format. Expected 'NAME=value'. Invalid entries: ${invalidEnvVars.join(
                ', ',
              )}`,
            )
          }

          envVars.push(...flags.environment)
        }

        // Add socket mounting for docker tools if needed, but primarily we want the container to run as a server
        // MCPX handles the running of the docker container.
        // We need to configure it in mcp.json so MCPX picks it up.
        // Based on MCP std, docker servers are defined with `docker` command.

        // Add (merge) new server into existing mcpServers
        mcpConfig.mcpServers[args.name] = {
          args: [
            'run',
            '-i',
            '--rm',
            ...binds.flatMap((b) => ['-v', b]),
            ...envVars.flatMap((e) => ['-e', e]),
            flags.image,
          ],
          command: 'docker',
        }

        // Write back the updated config (preserving all other properties and existing servers)
        fs.writeFileSync(mcpJsonPath, JSON.stringify(mcpConfig, null, 2))
        this.log(chalk.green(`Inference pipeline '${args.name}' added`))

        // Copy only mcp.json to container and restart (non-fatal if it fails)
        try {
          await this.restartMcpxContainer(mcpxConfigPath, flags.container)
        } catch {
          this.log(chalk.yellow('Note: Could not restart container. Please restart manually if needed.'))
        }

        break
      }

      case 'remove': {
        if (!args.name) {
          this.error('Name is required for remove operation')
        }

        if (mcpConfig.mcpServers && mcpConfig.mcpServers[args.name]) {
          delete mcpConfig.mcpServers[args.name]
          // Write back the updated config (preserving all other properties and remaining servers)
          fs.writeFileSync(mcpJsonPath, JSON.stringify(mcpConfig, null, 2))
          this.log(chalk.green(`Inference pipeline '${args.name}' removed`))
        } else {
          this.log(chalk.yellow(`Inference pipeline '${args.name}' not found.`))
        }

        break
      }

      case 'restart': {
        await this.restartMcpxContainer(mcpxConfigPath, flags.container)

        break
      }

      case 'list': {
        this.log(chalk.blue('Installed Inference Pipelines:'))
        for (const [name, config] of Object.entries(mcpConfig.mcpServers)) {
          const argsList = Array.isArray((config as any).args) ? (config as any).args.join(' ') : ''
          this.log(`- ${name}: ${argsList}`)
        }

        break
      }

      default: {
        this.error(`Unknown operation: ${args.op}`)
      }
    }
  }

  private async restartMcpxContainer(mcpxConfigPath: string, containerName: string): Promise<void> {
    try {
      const {execSync} = await import('node:child_process')
      execSync(`docker cp ${mcpxConfigPath} ${containerName}:/lunar/packages/mcpx-server/`)
      this.log(chalk.green('Copied mcp.json to container: /lunar/packages/mcpx-server/config/mcp.json'))
      execSync(`docker restart ${containerName}`)
      this.log(chalk.green(`Restarted ${containerName} container.`))
    } catch {
      this.log(
        chalk.red(
          `Failed to copy config or restart container '${containerName}'. Please check Docker status and container name.`,
        ),
      )
    }
  }
}
