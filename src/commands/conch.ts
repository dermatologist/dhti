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
    op: Args.string({description: 'Operation to perform (add, init, install, or start)'}),
  }

  static override description = 'Initialize, install, or start OpenMRS frontend development'

  static override examples = [
    '<%= config.bin %> <%= command.id %> add -g my-repo/my-package -n my-package -w ~/projects',
    '<%= config.bin %> <%= command.id %> add -g my-repo/my-package -b main -n my-package -w ~/projects',
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
      default: 'dermatologist/openmrs-esm-dhti',
      description: 'GitHub repository to install (for install operation)',
    }),
    local: Flags.string({
      char: 'l',
      description: 'Local path to use instead of calculated workdir/name path (for start operation)',
    }),
    name: Flags.string({char: 'n', default: 'esm-dhti', description: 'Name of the conch'}),
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

    if (args.op === 'add') {
      // Validate that git and name are overridden from defaults
      const defaultGit = 'dermatologist/openmrs-esm-dhti'
      const defaultName = 'esm-dhti'

      const gitOverridden = flags.git !== defaultGit
      const nameOverridden = flags.name !== defaultName

      if (!gitOverridden || !nameOverridden) {
        this.log(chalk.yellow('Note: The "add" operation requires non-default values for both --git and --name flags.'))
        if (!gitOverridden) {
          this.log(chalk.yellow('  Current --git: (default)'))
        }

        if (!nameOverridden) {
          this.log(chalk.yellow('  Current --name: (default)'))
        }

        this.log(chalk.yellow('\nNo changes made. Please provide custom --git and --name values.'))
        this.exit(0)
      }

      if (flags['dry-run']) {
        this.log(chalk.yellow('[DRY RUN] Would execute add operation:'))
        const targetPath = path.join(flags.workdir, 'esm-dhti', 'packages', flags.name)
        this.log(chalk.cyan(`  npx degit ${flags.git}#${flags.branch} ${targetPath}`))
        return
      }

      try {
        this.log(chalk.blue(`Adding package ${flags.name} from ${flags.git}#${flags.branch}...`))
        const targetPath = path.join(flags.workdir, 'esm-dhti', 'packages', flags.name)
        const degitCommand = `npx degit ${flags.git}#${flags.branch} ${targetPath}`
        await execAsync(degitCommand)
        this.log(chalk.green('✓ Package added successfully'))
        this.log(chalk.green(`\n✓ Package is ready at ${targetPath}`))
      } catch (error) {
        this.error(`Error during add operation: ${error}`)
      }

      return
    }

    if (args.op === 'init') {
      // Validate required flags
      if (!flags.workdir) {
        this.error('workdir flag is required for init operation')
      }

      if (!flags.name) {
        this.error('name flag is required for init operation')
      }

      const targetDir = path.join(flags.workdir, 'openmrs-esm-dhti')

      if (flags['dry-run']) {
        this.log(chalk.yellow('[DRY RUN] Would execute init operation:'))
        this.log(chalk.cyan(`  npx degit dermatologist/openmrs-esm-dhti ${targetDir}`))
        this.log(chalk.cyan(`  Copy ${targetDir}/packages/esm-starter-app to ${targetDir}/packages/${flags.name}`))
        return
      }

      try {
        // Run npx degit to clone the dhti template
        this.log(chalk.blue(`Initializing DHTI template in ${targetDir}...`))
        const degitCommand = `npx degit dermatologist/openmrs-esm-dhti ${targetDir}`
        await execAsync(degitCommand)
        this.log(chalk.green('✓ DHTI template cloned successfully'))

        // Copy packages/esm-starter-app subdirectory to packages/<name>
        const starterAppSource = path.join(targetDir, 'packages', 'esm-starter-app')
        const targetPackageDir = path.join(targetDir, 'packages', flags.name)

        if (fs.existsSync(starterAppSource)) {
          this.log(chalk.blue(`Copying esm-starter-app to packages/${flags.name}...`))
          fs.cpSync(starterAppSource, targetPackageDir, {recursive: true})
          this.log(chalk.green(`✓ esm-starter-app copied to packages/${flags.name}`))
        } else {
          this.warn(`Warning: esm-starter-app not found at ${starterAppSource}`)
        }

        this.log(chalk.green(`\n✓ Initialization complete! Your workspace is ready at ${targetDir}`))
        this.log(chalk.blue(`\nTo start development, run:`))

        // Use --local and --sources for monorepo workflow
        const startCmd = `dhti-cli conch start --local ${targetDir} --sources 'packages/${flags.name}'`

        this.log(chalk.cyan(`  ${startCmd}`))
      } catch (error) {
        this.error(`Error during initialization: ${error}`)
      }

      return
    }

    if (args.op === 'start') {
      // Validate required flags
      if (!flags.local) {
        // If --local is not provided, require workdir and name
        if (!flags.workdir) {
          this.error('workdir flag is required for start operation (unless --local is provided)')
        }

        if (!flags.name) {
          this.error('name flag is required for start operation (unless --local is provided)')
        }
      }

      const targetDir = flags.local || path.join(flags.workdir, flags.name!)

      if (flags['dry-run']) {
        this.log(chalk.yellow('[DRY RUN] Would execute start operation:'))
        this.log(chalk.cyan(`  cd ${targetDir}`))
        let dryRunCommand = 'corepack enable && yarn install && yarn start'
        if (flags.sources && flags.sources.length > 0) {
          for (const source of flags.sources) {
            dryRunCommand += ` --sources '${source}'`
          }
        }

        this.log(chalk.cyan(`  ${dryRunCommand}`))
        return
      }

      // Check if directory exists (not in dry-run mode)
      if (!fs.existsSync(targetDir)) {
        this.error(`Directory does not exist: ${targetDir}`)
      }

      try {
        this.log(chalk.blue(`Starting OpenMRS development server in ${targetDir}...`))
        this.log(chalk.yellow('Press Ctrl-C to stop\n'))

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
            this.log(chalk.green('\n✓ Development server stopped'))
          } else if (code !== null) {
            this.log(chalk.yellow(`\nDevelopment server exited with code ${code}`))
          }
        })

        // Handle errors
        child.on('error', (error) => {
          this.error(`Error starting development server: ${error}`)
        })

        // Wait for the child process to complete
        await new Promise<void>((resolve) => {
          child.on('close', () => resolve())
        })
      } catch (error) {
        this.error(`Error during start: ${error}`)
      }

      return
    }

    if (args.op === 'install') {
      // Validate required flags
      if (!flags.workdir) {
        this.error('workdir flag is required for install operation')
      }

      if (!flags.name) {
        this.error('name flag is required for install operation')
      }

      // Warn if sources flag is used with install (not applicable)
      if (flags.sources && flags.sources.length > 0) {
        this.warn('Warning: --sources flag is not applicable for install operation. It will be ignored.')
        this.warn('Use --sources with the start operation instead.')
      }

      const targetDir = path.join(flags.workdir, flags.name)
      const degitSource = `${flags.git}#${flags.branch}`

      if (flags['dry-run']) {
        this.log(chalk.yellow('[DRY RUN] Would execute install operation:'))
        this.log(chalk.cyan(`  npx degit ${degitSource} ${targetDir}`))
        return
      }

      try {
        this.log(chalk.blue(`Installing from ${degitSource} to ${targetDir}...`))
        const degitCommand = `npx degit ${degitSource} ${targetDir}`
        await execAsync(degitCommand)
        this.log(chalk.green('✓ Repository cloned successfully'))
        this.log(chalk.green(`\n✓ Installation complete! Your app is ready at ${targetDir}`))
        this.log(chalk.blue(`\nTo start development, run:`))
        let startCmd = `dhti-cli conch start -n ${flags.name} -w ${flags.workdir}`
        if (flags.sources && flags.sources.length > 0) {
          for (const source of flags.sources) {
            startCmd += ` -s '${source}'`
          }
        }

        this.log(chalk.cyan(`  ${startCmd}`))
      } catch (error) {
        this.error(`Error during installation: ${error}`)
      }

      return
    }

    // If no valid operation is provided
    this.error('Invalid operation. Use "add", "install", "init", or "start"')
  }
}
