import {Args, Command, Flags} from '@oclif/core'
import { exec } from 'node:child_process';
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
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
    pypi: Flags.string({
      char: 'p',
      default: 'none',
      description: 'PyPi package to install. Ex: dhti-elixir-base = ">=0.1.0"',
    }),
    git: Flags.string({char: 'g', default: 'none', description: 'Github repository to install'}),
    name: Flags.string({char: 'n', description: 'Name of the elixir'}),
    repoVersion: Flags.string({char: 'v', default: '0.1.0', description: 'Version of the elixir'}),
    type: Flags.string({char: 't', default: 'chain', description: 'Type of elixir (chain, tool or agent)'}),
    whl: Flags.string({char: 'e', default: 'none', description: 'Whl file to install'}),
    workdir: Flags.string({
      char: 'w',
      default: `${os.homedir()}/dhti`,
      description: 'Working directory to install the elixir',
    }),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Elixir)

    if (!flags.name) {
      console.log('Please provide a name for the elixir')
      this.exit(1)
    }

    const expoName = flags.name.replaceAll('-', '_')

    // if arg is dev then copy to docker as below
    // docker restart dhti-langserve-1
    if (args.op === 'dev') {
      console.log(
        `cd ${flags.dev} && docker cp ${expoName}/. ${flags.container}:/app/.venv/lib/python3.11/site-packages/${expoName}`,
      )
      try {
        exec(
          `cd ${flags.dev} && docker cp ${expoName}/. ${flags.container}:/app/.venv/lib/python3.11/site-packages/${expoName}`,
          (error, stdout, stderr) => {
            if (error) {
              console.error(`exec error: ${error}`)
              return
            }

            console.log(`stdout: ${stdout}`)
            console.error(`stderr: ${stderr}`)
          },
        )
        exec(`docker restart ${flags.container}`, (error, stdout, stderr) => {
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
    }

    // Create a directory to install the elixir
    if (!fs.existsSync(`${flags.workdir}/elixir`)) {
      fs.mkdirSync(`${flags.workdir}/elixir`)
    }

    fs.cpSync('src/resources/genai', `${flags.workdir}/elixir`, {recursive: true})

    // if whl is not none, copy the whl file to thee whl directory
    if (flags.whl !== 'none') {
      if (!fs.existsSync(`${flags.workdir}/elixir/whl/`)) {
        fs.mkdirSync(`${flags.workdir}/whl/`)
      }

      fs.cpSync(flags.whl, `${flags.workdir}/elixir/whl/${path.basename(flags.whl)}`)
      console.log('Installing elixir from whl file. Please modify boostrap.py file if needed')
    }

    // Install the elixir from git adding to the pyproject.toml file
    let pyproject = fs.readFileSync(`${flags.workdir}/elixir/pyproject.toml`, 'utf8')
    const originalServer = fs.readFileSync(`${flags.workdir}/elixir/app/server.py`, 'utf8')
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

    pyproject = pyproject.replace('dependencies = [', `dependencies = [\n"${flags.name}",`)
    pyproject = pyproject.replace('[tool.uv.sources]', `[tool.uv.sources]\n${lineToAdd}\n`)
    const newPyproject = pyproject

    // Add the elixir import and bootstrap to the server.py file
    let CliImport = `from ${expoName}.bootstrap import bootstrap as ${expoName}_bootstrap\n`
    CliImport += `${expoName}_bootstrap()\n`
    CliImport += `from ${expoName}.chain import ${flags.type} as ${expoName}_${flags.type}\n`
    const newCliImport = fs
      .readFileSync(`${flags.workdir}/elixir/app/server.py`, 'utf8')
      .replace('#DHTI_CLI_IMPORT', `#DHTI_CLI_IMPORT\n${CliImport}`)
    const commonRoutes = `\nadd_invokes(app, path="/langserve/${expoName}")\nadd_services(app, path="/langserve/${expoName}")`
    const langfuseRoute = `add_routes(app, ${expoName}_${flags.type}.with_config(config), path="/langserve/${expoName}")` + commonRoutes
    const newLangfuseRoute = newCliImport.replace('#DHTI_LANGFUSE_ROUTE', `#DHTI_LANGFUSE_ROUTE\n    ${langfuseRoute}`)
    const normalRoute = `add_routes(app, ${expoName}_${flags.type}, path="/langserve/${expoName}")` + commonRoutes
    const finalRoute = newLangfuseRoute.replace('#DHTI_NORMAL_ROUTE', `#DHTI_NORMAL_ROUTE\n    ${normalRoute}`)
    // if args.op === install, add the line to the pyproject.toml file
    if (args.op === 'install') {
      fs.writeFileSync(`${flags.workdir}/elixir/pyproject.toml`, newPyproject)
      fs.writeFileSync(`${flags.workdir}/elixir/app/server.py`, finalRoute)
    }

    if (args.op === 'uninstall') {
      // if args.op === uninstall, remove the line from the pyproject.toml file
      fs.writeFileSync(`${flags.workdir}/elixir/pyproject.toml`, pyproject.replace(lineToAdd, ''))
      let newServer = originalServer.replace(CliImport, '')
      newServer = newServer.replace(langfuseRoute, '')
      newServer = newServer.replace(normalRoute, '')
      fs.writeFileSync(`${flags.workdir}/elixir/app/server.py`, newServer)
    }
  }
}
