import {Args, Command, Flags} from '@oclif/core'
import chalk from 'chalk'
import {exec} from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
export default class Elixir extends Command {
  static override args = {
    op: Args.string({description: 'Operation to perform (install, uninstall or dev)'}),
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
    git: Flags.string({char: 'g', default: 'none', description: 'Github repository to install'}),
    name: Flags.string({char: 'n', description: 'Name of the elixir'}),
    pypi: Flags.string({
      char: 'p',
      default: 'none',
      description: 'PyPi package to install. Ex: dhti-elixir-base = ">=0.1.0"',
    }),
    repoVersion: Flags.string({char: 'v', default: '0.1.0', description: 'Version of the elixir'}),
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

    // Create a directory to install the elixir
    if (!fs.existsSync(`${flags.workdir}/elixir`)) {
      if (flags['dry-run']) {
        console.log(chalk.yellow(`[DRY RUN] Would create directory: ${flags.workdir}/elixir`))
      } else {
        fs.mkdirSync(`${flags.workdir}/elixir`)
      }
    }

    if (flags['dry-run']) {
      console.log(chalk.yellow(`[DRY RUN] Would copy resources from ${RESOURCES_DIR}/genai to ${flags.workdir}/elixir`))
    } else {
      fs.cpSync(path.join(RESOURCES_DIR, 'genai'), `${flags.workdir}/elixir`, {recursive: true})
    }

    // if whl is not none, copy the whl file to thee whl directory
    if (flags.whl !== 'none') {
      if (!fs.existsSync(`${flags.workdir}/elixir/whl/`)) {
        if (flags['dry-run']) {
          console.log(chalk.yellow(`[DRY RUN] Would create directory: ${flags.workdir}/whl/`))
        } else {
          fs.mkdirSync(`${flags.workdir}/whl/`)
        }
      }

      if (flags['dry-run']) {
        console.log(chalk.yellow(`[DRY RUN] Would copy ${flags.whl} to ${flags.workdir}/elixir/whl/${path.basename(flags.whl)}`))
        console.log(chalk.cyan('[DRY RUN] Installing elixir from whl file. Please modify boostrap.py file if needed'))
      } else {
        fs.cpSync(flags.whl, `${flags.workdir}/elixir/whl/${path.basename(flags.whl)}`)
        console.log('Installing elixir from whl file. Please modify boostrap.py file if needed')
      }
    }

    // Install the elixir from git adding to the pyproject.toml file
    let pyproject = flags['dry-run'] ? '' : fs.readFileSync(`${flags.workdir}/elixir/pyproject.toml`, 'utf8')
    const originalServer = flags['dry-run'] ? '' : fs.readFileSync(`${flags.workdir}/elixir/app/server.py`, 'utf8')
    let lineToAdd = ''
    if (flags.whl !== 'none') {
      lineToAdd = `${flags.name} = { file = "whl/${path.basename(flags.whl)}" }`
    }

    if (flags.git !== 'none') {
      lineToAdd = `${flags.name} = { git = "${flags.git}", branch = "${flags.branch}" }`
    }

    if (flags.pypi !== 'none') {
      lineToAdd = flags.pypi
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
    const newLangfuseRoute = flags['dry-run'] ? '' : newCliImport.replace('# DHTI_LANGFUSE_ROUTE', `#DHTI_LANGFUSE_ROUTE\n    ${langfuseRoute}`)
    const normalRoute = `add_routes(app, ${expoName}_chain, path="/langserve/${expoName}")`
    const newNormalRoute = flags['dry-run'] ? '' : newLangfuseRoute.replace('# DHTI_NORMAL_ROUTE', `#DHTI_NORMAL_ROUTE\n    ${normalRoute}`)
    const commonRoutes = `\nadd_invokes(app, path="/langserve/${expoName}")\nadd_services(app, path="/langserve/${expoName}")`
    const finalRoute = flags['dry-run'] ? '' : newNormalRoute.replace('# DHTI_COMMON_ROUTE', `#DHTI_COMMON_ROUTES${commonRoutes}`)

    // if args.op === install, add the line to the pyproject.toml file
    if (args.op === 'install') {
      if (flags['dry-run']) {
        console.log(chalk.yellow('[DRY RUN] Would update files:'))
        console.log(chalk.cyan(`  - ${flags.workdir}/elixir/pyproject.toml`))
        console.log(chalk.green(`    Add dependency: "${flags.name}"`))
        console.log(chalk.green(`    Add source: ${lineToAdd}`))
        console.log(chalk.cyan(`  - ${flags.workdir}/elixir/app/server.py`))
        console.log(chalk.green(`    Add import and routes for ${expoName}`))
      } else {
        fs.writeFileSync(`${flags.workdir}/elixir/pyproject.toml`, newPyproject)
        fs.writeFileSync(`${flags.workdir}/elixir/app/server.py`, finalRoute)
      }
    }

    if (args.op === 'uninstall') {
      if (flags['dry-run']) {
        console.log(chalk.yellow('[DRY RUN] Would update files:'))
        console.log(chalk.cyan(`  - ${flags.workdir}/elixir/pyproject.toml`))
        console.log(chalk.green(`    Remove source: ${lineToAdd}`))
        console.log(chalk.cyan(`  - ${flags.workdir}/elixir/app/server.py`))
        console.log(chalk.green(`    Remove import and routes for ${expoName}`))
      } else {
        // if args.op === uninstall, remove the line from the pyproject.toml file
        fs.writeFileSync(`${flags.workdir}/elixir/pyproject.toml`, pyproject.replace(lineToAdd, ''))
        let newServer = originalServer.replace(CliImport, '')
        newServer = newServer.replace(langfuseRoute, '')
        newServer = newServer.replace(normalRoute, '')
        fs.writeFileSync(`${flags.workdir}/elixir/app/server.py`, newServer)
      }
    }
  }
}
