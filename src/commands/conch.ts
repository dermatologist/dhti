import {Args, Command, Flags} from '@oclif/core'
import chalk from 'chalk'
import {exec, spawn} from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
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
    name: Flags.string({char: 'n', description: 'Name of the conch'}),
    workdir: Flags.string({
      char: 'w',
      default: `${os.homedir()}/dhti`,
      description: 'Working directory for the conch',
    }),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Conch)

    // Resolve resources directory for both dev (src) and packaged (dist)
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    const RESOURCES_DIR = path.resolve(__dirname, '../resources')

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

      const targetDir = path.join(flags.workdir, flags.name)

      if (flags['dry-run']) {
        console.log(chalk.yellow('[DRY RUN] Would execute init operation:'))
        console.log(chalk.cyan(`  npx degit openmrs/openmrs-esm-template-app ${targetDir}`))
        console.log(chalk.cyan(`  Copy resources from ${RESOURCES_DIR}/spa to ${targetDir}/src`))
        return
      }

      try {
        // Run npx degit to clone the template
        console.log(chalk.blue(`Initializing OpenMRS app template in ${targetDir}...`))
        const degitCommand = `npx degit openmrs/openmrs-esm-template-app ${targetDir}`
        await execAsync(degitCommand)
        console.log(chalk.green('✓ Template cloned successfully'))

        // Copy resources from spa directory to target/src
        const spaResourcesDir = path.join(RESOURCES_DIR, 'spa')
        const targetSrcDir = path.join(targetDir, 'src')

        if (fs.existsSync(spaResourcesDir)) {
          console.log(chalk.blue('Copying resources to src directory...'))
          fs.cpSync(spaResourcesDir, targetSrcDir, {recursive: true})
          console.log(chalk.green('✓ Resources copied successfully'))
        } else {
          console.log(chalk.yellow(`Warning: Resources directory not found at ${spaResourcesDir}`))
        }

        console.log(chalk.green(`\n✓ Initialization complete! Your app is ready at ${targetDir}`))
        console.log(chalk.blue(`\nTo start development, run:`))
        console.log(chalk.cyan(`  dhti-cli conch start -n ${flags.name} -w ${flags.workdir}`))
      } catch (error) {
        console.error(chalk.red('Error during initialization:'), error)
        this.exit(1)
      }

      return
    }

    if (args.op === 'start') {
      // Validate required flags
      if (!flags.workdir) {
        console.error(chalk.red('Error: workdir flag is required for start operation'))
        this.exit(1)
      }

      if (!flags.name) {
        console.error(chalk.red('Error: name flag is required for start operation'))
        this.exit(1)
      }

      const targetDir = path.join(flags.workdir, flags.name)

      if (flags['dry-run']) {
        console.log(chalk.yellow('[DRY RUN] Would execute start operation:'))
        console.log(chalk.cyan(`  cd ${targetDir}`))
        console.log(chalk.cyan(`  corepack enable & yarn & yarn start`))
        return
      }

      // Check if directory exists (not in dry-run mode)
      if (!fs.existsSync(targetDir)) {
        console.error(chalk.red(`Error: Directory does not exist: ${targetDir}`))
        console.log(chalk.yellow(`Run 'dhti-cli conch init -n ${flags.name} -w ${flags.workdir}' first`))
        this.exit(1)
      }

      try {
        console.log(chalk.blue(`Starting OpenMRS development server in ${targetDir}...`))
        console.log(chalk.yellow('Press Ctrl-C to stop\n'))

        // Spawn corepack enable & yarn & yarn start with stdio inheritance to show output and allow Ctrl-C
        const child = spawn('corepack enable & yarn & yarn start', {
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
        console.log(chalk.cyan(`  dhti-cli conch start -n ${flags.name} -w ${flags.workdir}`))
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
