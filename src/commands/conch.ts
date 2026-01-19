import {Args, Command, Flags} from '@oclif/core'
import chalk from 'chalk'
import {exec, spawn} from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {promisify} from 'node:util'

const execAsync = promisify(exec)

export default class Conch extends Command {
  static override args = {
    op: Args.string({description: 'Operation to perform (init, install, or start)'}),
  }

  static override description = 'Initialize, install, or start OpenMRS frontend development'

  static override examples = [
    '<%= config.bin %> <%= command.id %> install -n my-app -w ~/projects',
    '<%= config.bin %> <%= command.id %> init -n my-app -w ~/projects',
    '<%= config.bin %> <%= command.id %> start -n my-app -w ~/projects',
    '<%= config.bin %> <%= command.id %> start -n my-app -w ~/projects -s packages/chatbot -s packages/utils',
  ]

  static override flags = {
    branch: Flags.string({
      char: 'b',
      default: 'develop',
      description: 'Branch to install from (for install operation)',
    }),
    'dry-run': Flags.boolean({
      default: false,
      description: 'Show what changes would be made without actually making them',
    }),
    git: Flags.string({
      char: 'g',
      default: 'dermatologist/openmrs-esm-dhti-template',
      description: 'GitHub repository to install (for install operation)',
    }),
    local: Flags.string({
      char: 'l',
      description: 'Local path to use instead of calculated workdir/name path (for start operation)',
    }),
    name: Flags.string({char: 'n', description: 'Name of the conch'}),
    sources: Flags.string({
      char: 's',
      description:
        'Additional sources to include when starting (e.g., packages/esm-chatbot-agent, packages/esm-another-app)',
      multiple: true,
    }),
    workdir: Flags.string({
      char: 'w',
      default: `${os.homedir()}/dhti`,
      description: 'Working directory for the conch',
    }),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Conch)

    if (args.op === 'init') {
      // Validate required flags
      if (!flags.workdir) {
        console.error(chalk.red('Error: workdir flag is required for init operation'))
        this.exit(1)
      }

      if (!flags.name) {
        console.error(chalk.red('Error: name flag is required for init operation'))
        this.exit(1)
      }

      const targetDir = path.join(flags.workdir, 'openmrs-esm-dhti')

      if (flags['dry-run']) {
        console.log(chalk.yellow('[DRY RUN] Would execute init operation:'))
        console.log(chalk.cyan(`  npx degit dermatologist/openmrs-esm-dhti ${targetDir}`))
        console.log(chalk.cyan(`  Copy ${targetDir}/packages/esm-starter-app to ${targetDir}/packages/${flags.name}`))
        return
      }

      try {
        // Run npx degit to clone the dhti template
        console.log(chalk.blue(`Initializing DHTI template in ${targetDir}...`))
        const degitCommand = `npx degit dermatologist/openmrs-esm-dhti ${targetDir}`
        await execAsync(degitCommand)
        console.log(chalk.green('✓ DHTI template cloned successfully'))

        // Copy packages/esm-starter-app subdirectory to packages/<name>
        const starterAppSource = path.join(targetDir, 'packages', 'esm-starter-app')
        const targetPackageDir = path.join(targetDir, 'packages', flags.name)

        if (fs.existsSync(starterAppSource)) {
          console.log(chalk.blue(`Copying esm-starter-app to packages/${flags.name}...`))
          fs.cpSync(starterAppSource, targetPackageDir, {recursive: true})
          console.log(chalk.green(`✓ esm-starter-app copied to packages/${flags.name}`))
        } else {
          console.log(chalk.yellow(`Warning: esm-starter-app not found at ${starterAppSource}`))
        }

        console.log(chalk.green(`\n✓ Initialization complete! Your workspace is ready at ${targetDir}`))
        console.log(chalk.blue(`\nTo start development, run:`))

        const startCmd = `dhti-cli conch start -w ${flags.workdir} -n ${flags.name}`

        console.log(chalk.cyan(`  ${startCmd}`))
      } catch (error) {
        console.error(chalk.red('Error during initialization:'), error)
        this.exit(1)
      }

      return
    }

    if (args.op === 'start') {
      // Validate required flags
      if (!flags.local) {
        // If --local is not provided, require workdir and name
        if (!flags.workdir) {
          console.error(chalk.red('Error: workdir flag is required for start operation (unless --local is provided)'))
          this.exit(1)
        }

        if (!flags.name) {
          console.error(chalk.red('Error: name flag is required for start operation (unless --local is provided)'))
          this.exit(1)
        }
      }

      const targetDir = flags.local || path.join(flags.workdir, flags.name!)

      if (flags['dry-run']) {
        console.log(chalk.yellow('[DRY RUN] Would execute start operation:'))
        console.log(chalk.cyan(`  cd ${targetDir}`))
        let dryRunCommand = 'corepack enable && yarn install && yarn start'
        if (flags.sources && flags.sources.length > 0) {
          for (const source of flags.sources) {
            dryRunCommand += ` --sources '${source}'`
          }
        }

        console.log(chalk.cyan(`  ${dryRunCommand}`))
        return
      }

      // Check if directory exists (not in dry-run mode)
      if (!fs.existsSync(targetDir)) {
        console.error(chalk.red(`Error: Directory does not exist: ${targetDir}`))
        if (!flags.local) {
          console.log(chalk.yellow(`Run 'dhti-cli conch init -n ${flags.name} -w ${flags.workdir}' first`))
        }

        this.exit(1)
      }

      try {
        console.log(chalk.blue(`Starting OpenMRS development server in ${targetDir}...`))
        console.log(chalk.yellow('Press Ctrl-C to stop\n'))

        // Build the start command with sources flag if provided
        let startCommand = 'corepack enable && yarn install && yarn start'
        if (flags.sources && flags.sources.length > 0) {
          for (const source of flags.sources) {
            startCommand += ` --sources '${source}'`
          }
        }

        // Spawn corepack enable && yarn install && yarn start with stdio inheritance to show output and allow Ctrl-C
        const child = spawn(startCommand, {
          cwd: targetDir,
          shell: true,
          stdio: 'inherit',
        })

        // Handle process exit
        child.on('exit', (code) => {
          if (code === 0) {
            console.log(chalk.green('\n✓ Development server stopped'))
          } else if (code !== null) {
            console.log(chalk.yellow(`\nDevelopment server exited with code ${code}`))
          }
        })

        // Handle errors
        child.on('error', (error) => {
          console.error(chalk.red('Error starting development server:'), error)
          this.exit(1)
        })

        // Wait for the child process to complete
        await new Promise<void>((resolve) => {
          child.on('close', () => resolve())
        })
      } catch (error) {
        console.error(chalk.red('Error during start:'), error)
        this.exit(1)
      }

      return
    }

    if (args.op === 'install') {
      // Validate required flags
      if (!flags.workdir) {
        console.error(chalk.red('Error: workdir flag is required for install operation'))
        this.exit(1)
      }

      if (!flags.name) {
        console.error(chalk.red('Error: name flag is required for install operation'))
        this.exit(1)
      }

      // Warn if sources flag is used with install (not applicable)
      if (flags.sources && flags.sources.length > 0) {
        console.warn(
          chalk.yellow('Warning: --sources flag is not applicable for install operation. It will be ignored.'),
        )
        console.warn(chalk.yellow('Use --sources with the start operation instead.'))
      }

      const targetDir = path.join(flags.workdir, flags.name)
      const degitSource = `${flags.git}#${flags.branch}`

      if (flags['dry-run']) {
        console.log(chalk.yellow('[DRY RUN] Would execute install operation:'))
        console.log(chalk.cyan(`  npx degit ${degitSource} ${targetDir}`))
        return
      }

      try {
        console.log(chalk.blue(`Installing from ${degitSource} to ${targetDir}...`))
        const degitCommand = `npx degit ${degitSource} ${targetDir}`
        await execAsync(degitCommand)
        console.log(chalk.green('✓ Repository cloned successfully'))
        console.log(chalk.green(`\n✓ Installation complete! Your app is ready at ${targetDir}`))
        console.log(chalk.blue(`\nTo start development, run:`))
        let startCmd = `dhti-cli conch start -n ${flags.name} -w ${flags.workdir}`
        if (flags.sources && flags.sources.length > 0) {
          for (const source of flags.sources) {
            startCmd += ` -s '${source}'`
          }
        }

        console.log(chalk.cyan(`  ${startCmd}`))
      } catch (error) {
        console.error(chalk.red('Error during installation:'), error)
        this.exit(1)
      }

      return
    }

    // If no valid operation is provided
    console.error(chalk.red('Error: Invalid operation. Use "install", "init", or "start"'))
    this.exit(1)
  }
}
