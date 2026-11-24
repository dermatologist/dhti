// Refactored elixir.ts - Phase 2 improvements
// Key changes:
// 1. Extracted handler methods for each operation
// 2. Standardized error handling (console.error -> this.error)
// 3. Standardized logging (console.log -> this.log)
// 4. Added helper methods for common operations

import {Args, Command, Flags} from '@oclif/core'
import chalk from 'chalk'
// eslint-disable-next-line import/default
import yaml from 'js-yaml'
import {exec, spawn} from 'node:child_process'
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

    // Route to appropriate handler based on operation
    switch (args.op) {
      case 'init':
        await this.handleInit(flags)
        break
      case 'start':
        await this.handleStart(flags)
        break
      case 'dev':
        await this.handleDev(flags)
        break
      case 'install':
        await this.handleInstall(flags)
        break
      case 'uninstall':
        await this.handleUninstall(flags)
        break
      default:
        // Show helpful message with available operations
        this.log('Available operations: init, install, uninstall, dev, start')
        this.log('Run "dhti elixir <operation> --help" for more information')
    }
  }

  private getResourcesDir(): string {
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    return path.resolve(__dirname, '../resources')
  }

  private async handleInit(flags: Awaited<ReturnType<typeof this.parse>>['flags']): Promise<void> {
    if (!flags.workdir) {
      this.error('workdir flag is required for init operation')
    }

    if (!flags.name) {
      this.error('name flag is required for init operation')
    }

    const targetDir = path.join(flags.workdir, 'dhti-elixir')

    if (flags['dry-run']) {
      this.log(chalk.yellow('[DRY RUN] Would execute init operation:'))
      this.log(chalk.cyan(`  npx degit dermatologist/dhti-elixir ${targetDir}`))
      this.log(chalk.cyan(`  Copy ${targetDir}/packages/starter to ${targetDir}/packages/${flags.name}`))
      return
    }

    try {
      this.log(chalk.blue(`Initializing DHTI elixir template in ${targetDir}...`))
      const degitCommand = `npx degit dermatologist/dhti-elixir ${targetDir}`
      await execAsync(degitCommand)
      this.log(chalk.green('✓ DHTI elixir template cloned successfully'))

      const simpleChatSource = path.join(targetDir, 'packages', 'starter')
      const targetPackageDir = path.join(targetDir, 'packages', flags.name)

      if (fs.existsSync(simpleChatSource)) {
        this.log(chalk.blue(`Copying starter to packages/${flags.name}...`))
        fs.cpSync(simpleChatSource, targetPackageDir, {recursive: true})
        this.log(chalk.green(`✓ starter copied to packages/${flags.name}`))
      } else {
        this.log(chalk.yellow(`Warning: starter not found at ${simpleChatSource}`))
      }

      this.log(chalk.green(`\n✓ Initialization complete! Your elixir workspace is ready at ${targetDir}`))
      this.log(chalk.blue(`\nNext steps:`))
      this.log(chalk.cyan(`  1. cd ${targetDir}`))
      this.log(chalk.cyan(`  2. Follow the README.md for development instructions`))
    } catch (error) {
      this.error(`Initialization failed: ${error}`)
    }
  }

  private async handleStart(flags: Awaited<ReturnType<typeof this.parse>>['flags']): Promise<void> {
    let elixirUrl = flags.elixir
    if (!elixirUrl) {
      if (!flags.name) {
        this.error('Either --elixir or --name flag must be provided for start operation')
      }

      const nameWithUnderscores = flags.name.replaceAll('-', '_')
      elixirUrl = `http://localhost:8001/langserve/${nameWithUnderscores}/cds-services`
    }

    const sandboxDir = path.join(flags.workdir, 'cds-hooks-sandbox')

    if (flags['dry-run']) {
      const directoryExists = fs.existsSync(sandboxDir)
      this.log(chalk.yellow('[DRY RUN] Would execute start operation:'))
      if (directoryExists) {
        this.log(chalk.cyan(`  [SKIP] Directory already exists: ${sandboxDir}`))
      } else {
        this.log(chalk.cyan(`  npx degit dermatologist/cds-hooks-sandbox ${sandboxDir}`))
        this.log(chalk.cyan(`  cd ${sandboxDir}`))
        this.log(chalk.cyan(`  yarn install`))
      }

      this.log(chalk.cyan(`  yarn dhti ${elixirUrl} ${flags.fhir}`))
      this.log(chalk.cyan(`  Update docker-compose.yml FHIR_BASE_URL=${flags.fhir}`))
      this.log(chalk.cyan(`  docker restart ${flags.container}`))
      return
    }

    try {
      const directoryExists = fs.existsSync(sandboxDir)

      if (directoryExists) {
        this.log(chalk.blue(`Using existing CDS Hooks Sandbox at ${sandboxDir}...`))
        this.log(chalk.green('✓ Skipped clone and install (directory already exists)'))
      } else {
        this.log(chalk.blue(`Cloning CDS Hooks Sandbox to ${sandboxDir}...`))
        const degitCommand = `npx degit dermatologist/cds-hooks-sandbox#dhti-4 ${sandboxDir}`
        await execAsync(degitCommand)
        this.log(chalk.green('✓ CDS Hooks Sandbox cloned successfully'))

        this.log(chalk.blue('Installing dependencies...'))
        const installCommand = `cd ${sandboxDir} && yarn install`
        const {stderr: installError} = await execAsync(installCommand)
        if (installError && !installError.includes('warning')) {
          this.log(chalk.yellow(`Installation warnings: ${installError}`))
        }

        this.log(chalk.green('✓ Dependencies installed successfully'))
      }

      this.log(chalk.blue('Configuring DHTI endpoints...'))
      const dhtiCommand = `cd ${sandboxDir} && yarn dhti ${elixirUrl} ${flags.fhir}`
      const {stderr: dhtiError} = await execAsync(dhtiCommand)
      if (dhtiError && !dhtiError.includes('warning')) {
        this.log(chalk.yellow(`Configuration warnings: ${dhtiError}`))
      }

      this.log(chalk.green('✓ DHTI endpoints configured successfully'))

      await this.configureDockerContainer(flags)
      await this.startDevServer(sandboxDir, elixirUrl, flags.fhir)
    } catch (error) {
      this.error(`Start operation failed: ${error}`)
    }
  }

  private async configureDockerContainer(flags: Awaited<ReturnType<typeof this.parse>>['flags']): Promise<void> {
    this.log(chalk.blue('Setting up Docker container environment...'))
    try {
      const dockerComposeFile = path.join(flags.workdir, 'docker-compose.yml')
      if (fs.existsSync(dockerComposeFile)) {
        const composeContent = fs.readFileSync(dockerComposeFile, 'utf8')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const compose = yaml.load(composeContent) as Record<string, any>

        if (compose.services && compose.services.langserve) {
          if (!compose.services.langserve.environment) {
            compose.services.langserve.environment = []
          }

          const envArray = compose.services.langserve.environment
          const fhirIndex = envArray.findIndex((env: string | Record<string, string>) => {
            if (typeof env === 'string') {
              return env.startsWith('FHIR_BASE_URL=')
            }

            return typeof env === 'object' && env !== null && 'FHIR_BASE_URL' in env
          })

          if (fhirIndex >= 0) {
            const existingEnv = envArray[fhirIndex]
            if (typeof existingEnv === 'string') {
              envArray[fhirIndex] = `FHIR_BASE_URL=${flags.fhir}`
            } else if (typeof existingEnv === 'object' && existingEnv !== null) {
              existingEnv.FHIR_BASE_URL = flags.fhir
            }
          } else {
            envArray.push(`FHIR_BASE_URL=${flags.fhir}`)
          }

          const updatedCompose = yaml.dump(compose)
          fs.writeFileSync(dockerComposeFile, updatedCompose)
          this.log(chalk.green(`✓ docker-compose.yml updated with FHIR_BASE_URL=${flags.fhir}`))
        } else {
          this.warn('⚠ Warning: langserve service not found in docker-compose.yml')
        }
      } else {
        this.warn(`⚠ Warning: docker-compose.yml not found at ${dockerComposeFile}`)
      }

      const upCommand = `docker compose up -d`
      await execAsync(upCommand, {cwd: flags.workdir})
      this.log(chalk.green(`✓ Docker container ${flags.container} restarted (compose up -d) successfully`))
    } catch (error: unknown) {
      const err = error as {message?: string}
      if (err.message?.includes('No such container')) {
        this.warn(chalk.yellow(`⚠ Warning: Docker container ${flags.container} not found. Skipping container restart.`))
      } else {
        this.error(`Failed to configure Docker container: ${err.message}`)
      }
    }
  }

  private async startDevServer(sandboxDir: string, elixirUrl: string, fhirUrl: string): Promise<void> {
    this.log(chalk.blue('Starting development server...'))
    const devCommand = `yarn dhti ${elixirUrl} ${fhirUrl}`
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
      this.error(`Failed to start development server: ${err.message}`)
    }
  }

  private async handleDev(flags: Awaited<ReturnType<typeof this.parse>>['flags']): Promise<void> {
    if (!flags.name) {
      this.error('name flag is required for dev operation')
    }

    const expoName = flags.name.replaceAll('-', '_')
    const devCommand = `cd ${flags.dev} && docker cp src/${expoName}/. ${flags.container}:/app/.venv/lib/python3.12/site-packages/${expoName}`
    const restartCommand = `docker restart ${flags.container}`

    if (flags['dry-run']) {
      this.log(chalk.yellow('[DRY RUN] Would execute commands:'))
      this.log(chalk.cyan(`  ${devCommand}`))
      this.log(chalk.cyan(`  ${restartCommand}`))
      return
    }

    this.log(devCommand)
    try {
      await execAsync(devCommand)
      await execAsync(restartCommand)
    } catch (error) {
      this.error(`Failed to copy elixir to container: ${error}`)
    }
  }

  private async handleInstall(flags: Awaited<ReturnType<typeof this.parse>>['flags']): Promise<void> {
    if (!flags.name) {
      this.error('name flag is required for install operation')
    }

    const RESOURCES_DIR = this.getResourcesDir()
    await this.installElixir(flags, RESOURCES_DIR)
  }

  private async handleUninstall(flags: Awaited<ReturnType<typeof this.parse>>['flags']): Promise<void> {
    if (!flags.name) {
      this.error('name flag is required for uninstall operation')
    }

    await this.uninstallElixir(flags)
  }

  private async installElixir(
    flags: Awaited<ReturnType<typeof this.parse>>['flags'],
    RESOURCES_DIR: string,
  ): Promise<void> {
    const elixirDir = `${flags.workdir}/elixir`
    const expoName = flags.name.replaceAll('-', '_')
    const isFirstInstall = !fs.existsSync(elixirDir)

    if (isFirstInstall) {
      if (flags['dry-run']) {
        this.log(chalk.yellow(`[DRY RUN] Would create directory: ${elixirDir}`))
        this.log(chalk.yellow(`[DRY RUN] Would copy resources from ${RESOURCES_DIR}/genai to ${elixirDir}`))
      } else {
        fs.mkdirSync(elixirDir)
        fs.cpSync(path.join(RESOURCES_DIR, 'genai'), elixirDir, {recursive: true})
        this.log(chalk.blue(`✓ Initialized elixir directory at ${elixirDir}`))
      }
    } else {
      this.log(chalk.blue(`Using existing elixir directory at ${elixirDir}`))
    }

    if (flags.whl !== 'none') {
      await this.handleWhlInstallation(flags, elixirDir)
    }

    const lineToAdd = await this.preparePyprojectSource(flags)
    const pyproject = flags['dry-run'] ? '' : fs.readFileSync(`${elixirDir}/pyproject.toml`, 'utf8')
    const newPyproject = this.updatePyprojectForInstall(pyproject, flags.name, lineToAdd, flags['dry-run'])
    const finalRoute = await this.updateServerForInstall(expoName, elixirDir, flags['dry-run'])
    await this.completeInstall(flags, elixirDir, expoName, lineToAdd, newPyproject, finalRoute)
  }

  private async uninstallElixir(flags: Awaited<ReturnType<typeof this.parse>>['flags']): Promise<void> {
    const elixirDir = `${flags.workdir}/elixir`
    const expoName = flags.name.replaceAll('-', '_')

    if (!fs.existsSync(elixirDir)) {
      this.error(`Elixir directory not found at ${elixirDir}`)
    }

    const pyproject = flags['dry-run'] ? '' : fs.readFileSync(`${elixirDir}/pyproject.toml`, 'utf8')
    const newPyproject = this.updatePyprojectForUninstall(pyproject, flags.name, flags['dry-run'])
    const finalRoute = await this.updateServerForUninstall(expoName, elixirDir, flags['dry-run'])
    await this.completeUninstall(flags, elixirDir, expoName, newPyproject, finalRoute)
  }

  private async handleWhlInstallation(
    flags: Awaited<ReturnType<typeof this.parse>>['flags'],
    elixirDir: string,
  ): Promise<void> {
    const whlDir = `${elixirDir}/whl/`

    if (!fs.existsSync(whlDir)) {
      if (flags['dry-run']) {
        this.log(chalk.yellow(`[DRY RUN] Would create directory: ${whlDir}`))
      } else {
        fs.mkdirSync(whlDir)
      }
    }

    if (flags['dry-run']) {
      this.log(chalk.yellow(`[DRY RUN] Would copy ${flags.whl} to ${whlDir}${path.basename(flags.whl)}`))
      this.log(chalk.cyan('[DRY RUN] Installing elixir from whl file. Please modify bootstrap.py file if needed'))
    } else {
      fs.cpSync(flags.whl, `${whlDir}${path.basename(flags.whl)}`)
      this.log('Installing elixir from whl file. Please modify bootstrap.py file if needed')
    }
  }

  private async preparePyprojectSource(flags: Awaited<ReturnType<typeof this.parse>>['flags']): Promise<string> {
    let lineToAdd = ''

    if (flags.whl !== 'none') {
      lineToAdd = `${flags.name} = { file = "whl/${path.basename(flags.whl)}" }`
    } else if (flags.git !== 'none') {
      lineToAdd =
        flags.subdirectory === 'none'
          ? `${flags.name} = { git = "${flags.git}", branch = "${flags.branch}" }`
          : `${flags.name} = { git = "${flags.git}", branch = "${flags.branch}", subdirectory = "${flags.subdirectory}" }`
    } else if (flags.pypi !== 'none') {
      lineToAdd = flags.pypi
    } else if (flags.local !== 'none') {
      const absolutePath = path.isAbsolute(flags.local) ? flags.local : path.resolve(process.cwd(), flags.local)

      if (!flags['dry-run']) {
        if (!fs.existsSync(absolutePath)) {
          this.error(`Local directory does not exist: ${absolutePath}`)
        }
        const stats = fs.statSync(absolutePath)
        if (!stats.isDirectory()) {
          this.error(`Path is not a directory: ${absolutePath}`)
        }
      }

      lineToAdd = `${flags.name} = { path = "${absolutePath}" }`
    }

    return lineToAdd
  }

  private updatePyprojectForInstall(content: string, depName: string, source: string, dryRun: boolean): string {
    if (dryRun) return ''

    if (content.includes(`"${depName}"`)) {
      return content
    }

    let result = content.replace('dependencies = [', `dependencies = [\n"${depName}",`)
    result = result.replace('[tool.uv.sources]', `[tool.uv.sources]\n${source}\n`)

    return result
  }

  private updatePyprojectForUninstall(content: string, depName: string, dryRun: boolean): string {
    if (dryRun) return ''

    let result = content.replace(`"${depName}",`, '').replace(`"${depName}"`, '')
    result = result.replace(`\n"${depName}",`, '').replace(`"${depName}",\n`, '')

    const sourceRegex = new RegExp(`${depName}\\s*=\\s*\\{[^}]*\\}\\n?`, 'g')
    result = result.replace(sourceRegex, '')

    return result
  }

  private async updateServerForInstall(expoName: string, elixirDir: string, dryRun: boolean): Promise<string> {
    if (dryRun) return ''

    const content = fs.readFileSync(`${elixirDir}/app/server.py`, 'utf8')

    if (content.includes(`${expoName}_bootstrap`)) {
      return content
    }

    const CliImport = `from ${expoName}.bootstrap import bootstrap as ${expoName}_bootstrap\n${expoName}_bootstrap()\n\nfrom ${expoName}.chain import DhtiChain as ${expoName}_chain_class\n${expoName}_chain = ${expoName}_chain_class().get_chain_as_langchain_tool()\n${expoName}_mcp_tool = ${expoName}_chain_class().get_chain_as_mcp_tool\nmcp_server.add_tool(${expoName}_mcp_tool) # type: ignore\n    `
    const langfuseRoute = `add_routes(app, ${expoName}_chain.with_config(config), path="/langserve/${expoName}")`
    const normalRoute = `add_routes(app, ${expoName}_chain, path="/langserve/${expoName}")`
    const commonRoutes = `\nadd_invokes(app, path="/langserve/${expoName}")\nadd_services(app, path="/langserve/${expoName}")`

    let result = content.replace('import uvicorn', `${CliImport}\nimport uvicorn`)

    if (result.includes('except:')) {
      result = result.replace('except:', `    ${langfuseRoute}\n\nexcept:`)
      result = result.replace('# DHTI_NORMAL_ROUTE\n', `# DHTI_NORMAL_ROUTE\n    ${normalRoute}\n`)
    }

    const commonRoutesMarker = '# DHTI_COMMON_ROUTE'
    if (result.includes(commonRoutesMarker)) {
      const markerIndex = result.indexOf(commonRoutesMarker)
      const afterMarker = result.substring(markerIndex + commonRoutesMarker.length)
      const newlineAndIndent = afterMarker.match(/\n[ \t]*/)?.[0] || '\n'
      result = result.replace(commonRoutesMarker, `${commonRoutesMarker}${newlineAndIndent}${commonRoutes}`)
    }

    return result
  }

  private async updateServerForUninstall(expoName: string, elixirDir: string, dryRun: boolean): Promise<string> {
    if (dryRun) return ''

    const content = fs.readFileSync(`${elixirDir}/app/server.py`, 'utf8')

    const CliImport = `from ${expoName}.bootstrap import bootstrap as ${expoName}_bootstrap\n${expoName}_bootstrap()\n\nfrom ${expoName}.chain import DhtiChain as ${expoName}_chain_class\n${expoName}_chain = ${expoName}_chain_class().get_chain_as_langchain_tool()\n${expoName}_mcp_tool = ${expoName}_chain_class().get_chain_as_mcp_tool\nmcp_server.add_tool(${expoName}_mcp_tool) # type: ignore\n    `
    const langfuseRoute = `add_routes(app, ${expoName}_chain.with_config(config), path="/langserve/${expoName}")`
    const normalRoute = `add_routes(app, ${expoName}_chain, path="/langserve/${expoName}")`
    const commonRoutes = `\nadd_invokes(app, path="/langserve/${expoName}")\nadd_services(app, path="/langserve/${expoName}")`

    let result = content
    result = result.replace(CliImport, '')
    result = result.replace(langfuseRoute, '')
    result = result.replace(normalRoute, '')
    result = result.replace(commonRoutes, '')

    return result
  }

  private async completeInstall(
    flags: Awaited<ReturnType<typeof this.parse>>['flags'],
    elixirDir: string,
    expoName: string,
    lineToAdd: string,
    newPyproject: string,
    finalRoute: string,
  ): Promise<void> {
    if (flags['dry-run']) {
      this.log(chalk.yellow('[DRY RUN] Would update files:'))
      this.log(chalk.cyan(`  - ${elixirDir}/pyproject.toml`))
      this.log(chalk.green(`    Add dependency: "${flags.name}"`))
      this.log(chalk.green(`    Add source: ${lineToAdd}`))
      this.log(chalk.cyan(`  - ${elixirDir}/app/server.py`))
      this.log(chalk.green(`    Add import and routes for ${expoName}`))
    } else {
      fs.writeFileSync(`${elixirDir}/pyproject.toml`, newPyproject)
      fs.writeFileSync(`${elixirDir}/app/server.py`, finalRoute)
      this.log(chalk.green(`✓ Elixir '${flags.name}' installed successfully`))
    }
  }

  private async completeUninstall(
    flags: Awaited<ReturnType<typeof this.parse>>['flags'],
    elixirDir: string,
    expoName: string,
    newPyproject: string,
    finalRoute: string,
  ): Promise<void> {
    if (flags['dry-run']) {
      this.log(chalk.yellow('[DRY RUN] Would update files:'))
      this.log(chalk.cyan(`  - ${elixirDir}/pyproject.toml`))
      this.log(chalk.green(`    Remove dependency: "${flags.name}"`))
      this.log(chalk.green(`    Remove source: ${flags.name}`))
      this.log(chalk.cyan(`  - ${elixirDir}/app/server.py`))
      this.log(chalk.green(`    Remove import and routes for ${expoName}`))
    } else {
      fs.writeFileSync(`${elixirDir}/pyproject.toml`, newPyproject)
      fs.writeFileSync(`${elixirDir}/app/server.py`, finalRoute)
      this.log(chalk.green(`✓ Elixir '${flags.name}' uninstalled successfully`))
    }
  }
}
