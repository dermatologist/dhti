import {Args, Command, Flags} from '@oclif/core'
import chalk from 'chalk'
// eslint-disable-next-line import/default
import yaml from 'js-yaml'
import {exec} from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {promisify} from 'node:util'

const execAsync = promisify(exec)
export default class Elixir extends Command {
  static override args = {
    op: Args.string({description: 'Operation to perform (init, install, uninstall, dev or start)'}),
  }

  static override description = 'Install or uninstall elixirs to create a Docker image'

  static override examples = ['<%= config.bin %> <%= command.id %>']

  static override flags = {
    branch: Flags.string({char: 'b', default: 'develop', description: 'Branch to install from'}),
    container: Flags.string({
      char: 'c',
      default: 'dhti-langserve-1',
      description: 'Name of the container to copy the elixir to while in dev mode',
    }),
    dev: Flags.string({char: 'd', default: 'none', description: 'Dev folder to install'}),
    'dry-run': Flags.boolean({
      default: false,
      description: 'Show what changes would be made without actually making them',
    }),
    elixir: Flags.string({
      char: 'e',
      description: 'Elixir endpoint URL',
    }),
    fhir: Flags.string({
      char: 'f',
      default: 'http://hapi.fhir.org/baseR4',
      description: 'FHIR endpoint URL',
    }),
    git: Flags.string({char: 'g', default: 'none', description: 'Github repository to install'}),
    local: Flags.string({char: 'l', default: 'none', description: 'Local directory to install from'}),
    name: Flags.string({char: 'n', description: 'Name of the elixir'}),
    pypi: Flags.string({
      char: 'p',
      default: 'none',
      description: 'PyPi package to install. Ex: dhti-elixir-base = ">=0.1.0"',
    }),
    repoVersion: Flags.string({char: 'v', default: '0.1.0', description: 'Version of the elixir'}),
    subdirectory: Flags.string({
      char: 's',
      default: 'none',
      description: 'Subdirectory in the repository to install from (for monorepos)',
    }),
    whl: Flags.string({char: 'e', default: 'none', description: 'Whl file to install'}),
    workdir: Flags.string({
      char: 'w',
      default: `${os.homedir()}/dhti`,
      description: 'Working directory to install the elixir',
    }),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Elixir)

    // Resolve resources directory for both dev (src) and packaged (dist)
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    const RESOURCES_DIR = path.resolve(__dirname, '../resources')

    // Handle init operation
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

      const targetDir = path.join(flags.workdir, 'dhti-elixir')

      if (flags['dry-run']) {
        console.log(chalk.yellow('[DRY RUN] Would execute init operation:'))
        console.log(chalk.cyan(`  npx degit dermatologist/dhti-elixir ${targetDir}`))
        console.log(chalk.cyan(`  Copy ${targetDir}/packages/starter to ${targetDir}/packages/${flags.name}`))
        return
      }

      try {
        // Run npx degit to clone the dhti-elixir template
        console.log(chalk.blue(`Initializing DHTI elixir template in ${targetDir}...`))
        const degitCommand = `npx degit dermatologist/dhti-elixir ${targetDir}`
        await execAsync(degitCommand)
        console.log(chalk.green('✓ DHTI elixir template cloned successfully'))

        // Copy packages/starter subdirectory to packages/<name>
        const simpleChatSource = path.join(targetDir, 'packages', 'starter')
        const targetPackageDir = path.join(targetDir, 'packages', flags.name)

        if (fs.existsSync(simpleChatSource)) {
          console.log(chalk.blue(`Copying starter to packages/${flags.name}...`))
          fs.cpSync(simpleChatSource, targetPackageDir, {recursive: true})
          console.log(chalk.green(`✓ starter copied to packages/${flags.name}`))
        } else {
          console.log(chalk.yellow(`Warning: starter not found at ${simpleChatSource}`))
        }

        console.log(chalk.green(`\n✓ Initialization complete! Your elixir workspace is ready at ${targetDir}`))
        console.log(chalk.blue(`\nNext steps:`))
        console.log(chalk.cyan(`  1. cd ${targetDir}`))
        console.log(chalk.cyan(`  2. Follow the README.md for development instructions`))
      } catch (error) {
        console.error(chalk.red('Error during initialization:'), error)
        this.exit(1)
      }

      return
    }

    // Handle start operation
    if (args.op === 'start') {
      // Determine the elixir endpoint URL
      let elixirUrl = flags.elixir
      if (!elixirUrl) {
        // If --elixir is not provided, construct it from --name
        if (!flags.name) {
          console.error(chalk.red('Error: Either --elixir or --name flag must be provided for start operation'))
          this.exit(1)
        }

        const nameWithUnderscores = flags.name.replaceAll('-', '_')
        elixirUrl = `http://localhost:8001/langserve/${nameWithUnderscores}/cds-services`
      }

      const sandboxDir = path.join(flags.workdir, 'cds-hooks-sandbox')

      if (flags['dry-run']) {
        const directoryExists = fs.existsSync(sandboxDir)
        console.log(chalk.yellow('[DRY RUN] Would execute start operation:'))
        if (directoryExists) {
          console.log(chalk.cyan(`  [SKIP] Directory already exists: ${sandboxDir}`))
        } else {
          console.log(chalk.cyan(`  npx degit dermatologist/cds-hooks-sandbox ${sandboxDir}`))
          console.log(chalk.cyan(`  cd ${sandboxDir}`))
          console.log(chalk.cyan(`  yarn install`))
        }

        console.log(chalk.cyan(`  yarn dhti ${elixirUrl} ${flags.fhir}`))
        console.log(chalk.cyan(`  Update docker-compose.yml FHIR_BASE_URL=${flags.fhir}`))
        console.log(chalk.cyan(`  docker restart ${flags.container}`))
        console.log(chalk.cyan(`  yarn dev`))
        return
      }

      try {
        // Check if the directory already exists
        const directoryExists = fs.existsSync(sandboxDir)

        if (directoryExists) {
          console.log(chalk.blue(`Using existing CDS Hooks Sandbox at ${sandboxDir}...`))
          console.log(chalk.green('✓ Skipped clone and install (directory already exists)'))
        } else {
          // Clone the cds-hooks-sandbox repository
          console.log(chalk.blue(`Cloning CDS Hooks Sandbox to ${sandboxDir}...`))
          const degitCommand = `npx degit dermatologist/cds-hooks-sandbox ${sandboxDir}`
          await execAsync(degitCommand)
          console.log(chalk.green('✓ CDS Hooks Sandbox cloned successfully'))

          // Install dependencies
          console.log(chalk.blue('Installing dependencies...'))
          const installCommand = `cd ${sandboxDir} && yarn install`
          const {stderr: installError} = await execAsync(installCommand)
          if (installError && !installError.includes('warning')) {
            console.error(chalk.yellow(`Installation warnings: ${installError}`))
          }

          console.log(chalk.green('✓ Dependencies installed successfully'))
        }

        // Configure dhti endpoints
        console.log(chalk.blue('Configuring DHTI endpoints...'))
        const dhtiCommand = `cd ${sandboxDir} && yarn dhti ${elixirUrl} ${flags.fhir}`
        const {stderr: dhtiError} = await execAsync(dhtiCommand)
        if (dhtiError && !dhtiError.includes('warning')) {
          console.error(chalk.yellow(`Configuration warnings: ${dhtiError}`))
        }

        console.log(chalk.green('✓ DHTI endpoints configured successfully'))

        // Configure Docker container with FHIR_BASE_URL environment variable
        console.log(chalk.blue('Setting up Docker container environment...'))
        try {
          // Update the docker-compose.yml file with the new FHIR_BASE_URL
          const dockerComposeFile = path.join(flags.workdir, 'docker-compose.yml')
          if (fs.existsSync(dockerComposeFile)) {
            const composeContent = fs.readFileSync(dockerComposeFile, 'utf8')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const compose = yaml.load(composeContent) as Record<string, any>

            if (compose.services && compose.services.langserve) {
              if (!compose.services.langserve.environment) {
                compose.services.langserve.environment = []
              }

              // Update or add the FHIR_BASE_URL environment variable
              const envArray = compose.services.langserve.environment
              const fhirIndex = envArray.findIndex((env: string | Record<string, string>) => {
                if (typeof env === 'string') {
                  return env.startsWith('FHIR_BASE_URL=')
                }

                return typeof env === 'object' && env !== null && 'FHIR_BASE_URL' in env
              })

              if (fhirIndex >= 0) {
                // Update existing environment variable
                const existingEnv = envArray[fhirIndex]
                if (typeof existingEnv === 'string') {
                  envArray[fhirIndex] = `FHIR_BASE_URL=${flags.fhir}`
                } else if (typeof existingEnv === 'object' && existingEnv !== null) {
                  existingEnv.FHIR_BASE_URL = flags.fhir
                }
              } else {
                // Add new environment variable
                envArray.push(`FHIR_BASE_URL=${flags.fhir}`)
              }

              const updatedCompose = yaml.dump(compose)
              fs.writeFileSync(dockerComposeFile, updatedCompose)
              console.log(chalk.green(`✓ docker-compose.yml updated with FHIR_BASE_URL=${flags.fhir}`))
            } else {
              console.warn(chalk.yellow('⚠ Warning: langserve service not found in docker-compose.yml'))
            }
          } else {
            console.warn(chalk.yellow(`⚠ Warning: docker-compose.yml not found at ${dockerComposeFile}`))
          }

          // Restart the container to apply the new environment variables
          const upCommand = `docker compose up -d` // Docker Compose is smart enough to re-create only the services where the configuration, including environment variables, has changed
          await execAsync(upCommand, {cwd: flags.workdir})
          console.log(chalk.green(`✓ Docker container ${flags.container} restarted (compose up -d) successfully`))
        } catch (error: unknown) {
          const err = error as {message?: string}
          if (err.message?.includes('No such container')) {
            console.warn(
              chalk.yellow(`⚠ Warning: Docker container ${flags.container} not found. Skipping container restart.`),
            )
          } else {
            console.error(chalk.red(`Error setting up Docker container: ${err.message}`))
            this.exit(1)
          }
        }

        // Start the development server
        console.log(chalk.blue('Starting development server...'))
        const {spawn} = await import('node:child_process')
        const devCommand = `yarn dhti ${elixirUrl} ${flags.fhir} && yarn dev`
        try {
          const child = spawn(devCommand, {cwd: sandboxDir, shell: true, stdio: 'inherit'})
          await new Promise((resolve, reject) => {
            child.on('exit', (code) => {
              if (code === 0) resolve(undefined)
              else reject(new Error(`Dev server exited with code ${code}`))
            })
            child.on('error', reject)
          })
        } catch (error: unknown) {
          const err = error as {message?: string}
          console.error(chalk.red('Error starting development server:'), err.message)
          this.exit(1)
        }
      } catch (error) {
        console.error(chalk.red('Error during start operation:'), error)
        this.exit(1)
      }

      return
    }

    if (!flags.name) {
      console.log('Please provide a name for the elixir')
      this.exit(1)
    }

    const expoName = flags.name.replaceAll('-', '_')

    // if arg is dev then copy to docker as below
    // docker restart dhti-langserve-1
    if (args.op === 'dev') {
      const devCommand = `cd ${flags.dev} && docker cp src/${expoName}/. ${flags.container}:/app/.venv/lib/python3.12/site-packages/${expoName}`
      const restartCommand = `docker restart ${flags.container}`

      if (flags['dry-run']) {
        console.log(chalk.yellow('[DRY RUN] Would execute commands:'))
        console.log(chalk.cyan(`  ${devCommand}`))
        console.log(chalk.cyan(`  ${restartCommand}`))
        return
      }

      console.log(devCommand)
      try {
        exec(devCommand, (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`)
            return
          }

          console.log(`stdout: ${stdout}`)
          console.error(`stderr: ${stderr}`)
        })
        exec(restartCommand, (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`)
            return
          }

          console.log(`stdout: ${stdout}`)
          console.error(`stderr: ${stderr}`)
        })
      } catch (error) {
        console.log('Error copying conch to container', error)
      }

      return
    }

    // Create a directory to install the elixir (only on first install)
    const elixirDir = `${flags.workdir}/elixir`
    const isFirstInstall = !fs.existsSync(elixirDir)

    if (isFirstInstall) {
      if (flags['dry-run']) {
        console.log(chalk.yellow(`[DRY RUN] Would create directory: ${elixirDir}`))
        console.log(chalk.yellow(`[DRY RUN] Would copy resources from ${RESOURCES_DIR}/genai to ${elixirDir}`))
      } else {
        fs.mkdirSync(elixirDir)
        fs.cpSync(path.join(RESOURCES_DIR, 'genai'), elixirDir, {recursive: true})
        console.log(chalk.blue(`✓ Initialized elixir directory at ${elixirDir}`))
      }
    } else if (args.op === 'install') {
      console.log(chalk.blue(`Using existing elixir directory at ${elixirDir}`))
    }

    // if whl is not none, copy the whl file to the whl directory
    if (flags.whl !== 'none') {
      const whlDir = `${elixirDir}/whl/`
      if (!fs.existsSync(whlDir)) {
        if (flags['dry-run']) {
          console.log(chalk.yellow(`[DRY RUN] Would create directory: ${whlDir}`))
        } else {
          fs.mkdirSync(whlDir)
        }
      }

      if (flags['dry-run']) {
        console.log(chalk.yellow(`[DRY RUN] Would copy ${flags.whl} to ${whlDir}${path.basename(flags.whl)}`))
        console.log(chalk.cyan('[DRY RUN] Installing elixir from whl file. Please modify bootstrap.py file if needed'))
      } else {
        fs.cpSync(flags.whl, `${whlDir}${path.basename(flags.whl)}`)
        console.log('Installing elixir from whl file. Please modify bootstrap.py file if needed')
      }
    }

    // Install the elixir from git adding to the pyproject.toml file
    // Always read from the current state, not the template
    let pyproject = flags['dry-run'] ? '' : fs.readFileSync(`${elixirDir}/pyproject.toml`, 'utf8')
    const currentServer = flags['dry-run'] ? '' : fs.readFileSync(`${elixirDir}/app/server.py`, 'utf8')
    let lineToAdd = ''
    if (flags.whl !== 'none') {
      lineToAdd = `${flags.name} = { file = "whl/${path.basename(flags.whl)}" }`
    }

    if (flags.git !== 'none') {
      lineToAdd =
        flags.subdirectory === 'none'
          ? `${flags.name} = { git = "${flags.git}", branch = "${flags.branch}" }`
          : `${flags.name} = { git = "${flags.git}", branch = "${flags.branch}", subdirectory = "${flags.subdirectory}" }`
    }

    if (flags.pypi !== 'none') {
      lineToAdd = flags.pypi
    }

    if (flags.local !== 'none') {
      // Use path for local directory installation
      const absolutePath = path.isAbsolute(flags.local) ? flags.local : path.resolve(process.cwd(), flags.local)

      // Validate that the path exists and is a directory (skip validation in dry-run mode)
      if (!flags['dry-run']) {
        if (!fs.existsSync(absolutePath)) {
          console.error(chalk.red(`Error: Local directory does not exist: ${absolutePath}`))
          this.exit(1)
        }

        const stats = fs.statSync(absolutePath)
        if (!stats.isDirectory()) {
          console.error(chalk.red(`Error: Path is not a directory: ${absolutePath}`))
          this.exit(1)
        }
      }

      lineToAdd = `${flags.name} = { path = "${absolutePath}" }`
    }

    if (!flags['dry-run']) {
      pyproject = pyproject.replace('dependencies = [', `dependencies = [\n"${flags.name}",`)
      pyproject = pyproject.replace('[tool.uv.sources]', `[tool.uv.sources]\n${lineToAdd}\n`)
    }

    const newPyproject = pyproject

    // Add the elixir import and bootstrap to the server.py file
    let CliImport = `from ${expoName}.bootstrap import bootstrap as ${expoName}_bootstrap\n`
    CliImport += `${expoName}_bootstrap()\n`
    CliImport += `
from ${expoName}.chain import DhtiChain as ${expoName}_chain_class
${expoName}_chain = ${expoName}_chain_class().get_chain_as_langchain_tool()
${expoName}_mcp_tool = ${expoName}_chain_class().get_chain_as_mcp_tool
mcp_server.add_tool(${expoName}_mcp_tool) # type: ignore
    `
    let newCliImport = ''
    if (!flags['dry-run']) {
      newCliImport = fs
        .readFileSync(`${flags.workdir}/elixir/app/server.py`, 'utf8')
        .replace('# DHTI_CLI_IMPORT', `#DHTI_CLI_IMPORT\n${CliImport}`)
    }

    const langfuseRoute = `add_routes(app, ${expoName}_chain.with_config(config), path="/langserve/${expoName}")`
    const newLangfuseRoute = flags['dry-run']
      ? ''
      : newCliImport.replace('# DHTI_LANGFUSE_ROUTE', `#DHTI_LANGFUSE_ROUTE\n    ${langfuseRoute}`)
    const normalRoute = `add_routes(app, ${expoName}_chain, path="/langserve/${expoName}")`
    const newNormalRoute = flags['dry-run']
      ? ''
      : newLangfuseRoute.replace('# DHTI_NORMAL_ROUTE', `#DHTI_NORMAL_ROUTE\n    ${normalRoute}`)
    const commonRoutes = `\nadd_invokes(app, path="/langserve/${expoName}")\nadd_services(app, path="/langserve/${expoName}")`
    const finalRoute = flags['dry-run']
      ? ''
      : newNormalRoute.replace('# DHTI_COMMON_ROUTE', `#DHTI_COMMON_ROUTES${commonRoutes}`)

    if (args.op === 'install') {
      if (flags['dry-run']) {
        console.log(chalk.yellow('[DRY RUN] Would update files:'))
        console.log(chalk.cyan(`  - ${elixirDir}/pyproject.toml`))
        console.log(chalk.green(`    Add dependency: "${flags.name}"`))
        console.log(chalk.green(`    Add source: ${lineToAdd}`))
        console.log(chalk.cyan(`  - ${elixirDir}/app/server.py`))
        console.log(chalk.green(`    Add import and routes for ${expoName}`))
      } else {
        fs.writeFileSync(`${elixirDir}/pyproject.toml`, newPyproject)
        fs.writeFileSync(`${elixirDir}/app/server.py`, finalRoute)
      }
    }

    if (args.op === 'uninstall') {
      if (flags['dry-run']) {
        console.log(chalk.yellow('[DRY RUN] Would update files:'))
        console.log(chalk.cyan(`  - ${elixirDir}/pyproject.toml`))
        console.log(chalk.green(`    Remove dependency: "${flags.name}"`))
        console.log(chalk.green(`    Remove source: ${lineToAdd}`))
        console.log(chalk.cyan(`  - ${elixirDir}/app/server.py`))
        console.log(chalk.green(`    Remove import and routes for ${expoName}`))
      } else {
        // if args.op === uninstall, remove the line from the pyproject.toml file
        fs.writeFileSync(
          `${elixirDir}/pyproject.toml`,
          pyproject.replace(lineToAdd, '').replace(`"${flags.name}",`, ''),
        )
        let newServer = currentServer.replace(CliImport, '')
        newServer = newServer.replace(langfuseRoute, '')
        newServer = newServer.replace(normalRoute, '')
        fs.writeFileSync(`${elixirDir}/app/server.py`, newServer)
      }
    }
  }
}
