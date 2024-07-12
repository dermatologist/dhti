import {Args, Command, Flags} from '@oclif/core'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import request from 'request'
export default class Elixir extends Command {
  static override args = {
    op: Args.string({description: 'Operation to perform (install or uninstall)'}),
  }

  static override description = 'Install or uninstall elixirs to create a Docker image'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static override flags = {
    branch: Flags.string({char: 'b', default: "develop", description: 'Branch to install from'}),
    git: Flags.string({char: 'g', default: "none", description: 'Github repository to install'}),
    name: Flags.string({char: 'n', description: 'Name of the elixir'}),
    repoVersion: Flags.string({char: 'v', default: "0.1.0", description: 'Version of the elixir'}),
    type: Flags.string({char: 't', default: "chain", description: 'Type of elixir (chain, tool or agent)'}),
    whl: Flags.string({char: 'e', default: "none", description: 'Whl file to install'}),
    workdir: Flags.string({char: 'w', default: `${os.homedir()}/dhti`, description: 'Working directory to install the elixir'}),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Elixir)

    if(!flags.name){
      console.log("Please provide a name for the elixir")
      this.exit(1)
    }

    // Create a directory to install the elixir
    if (!fs.existsSync(`${flags.workdir}/elixir`)){
      fs.mkdirSync(`${flags.workdir}/elixir`);
    }

    fs.cpSync('src/resources/genai', `${flags.workdir}/elixir`, {recursive: true})

    // if whl is not none, copy the whl file to thee whl directory
    if (flags.whl !== 'none') {
      if (!fs.existsSync(`${flags.workdir}/elixir/whl/`)){
        fs.mkdirSync(`${flags.workdir}/whl/`);
      }
      fs.cpSync(flags.whl, `${flags.workdir}/elixir/whl/${path.basename(flags.whl)}`)
      console.log("Installing elixir from whl file. Please modify boostrap.py file if needed")
    }

    // Install the elixir from git adding to the pyproject.toml file
    const pyproject = fs.readFileSync(`${flags.workdir}/elixir/pyproject.toml`, 'utf8')
    const originalServer = fs.readFileSync(`${flags.workdir}/elixir/app/server.py`, 'utf8')
    let lineToAdd = `${flags.name} = { git = "${flags.git}", branch = "${flags.branch}" }`
    if (flags.git === 'none') {
      lineToAdd = `${flags.name} = { file = "whl/${path.basename(flags.whl)}" }`
    }
    const newPyproject = pyproject.replace('[tool.poetry.dependencies]', `[tool.poetry.dependencies]\n${lineToAdd}`)

    // Add the elixir import and bootstrap to the server.py file
    const expoName = flags.name.replaceAll('-', '_')
    let CliImport = `from ${expoName} import ${flags.type} as ${expoName}_${flags.type}\n`
    CliImport += `from ${expoName} import bootstrap as ${expoName}_bootstrap\n`
    CliImport += `${expoName}_bootstrap()\n`
    const newCliImport =  fs.readFileSync(`${flags.workdir}/elixir/app/server.py`, 'utf8').replace('#DHTI_CLI_IMPORT', `#DHTI_CLI_IMPORT\n${CliImport}`)
    const langfuseRoute = `add_routes(app, ${expoName}_${flags.type}.with_config(config), path="/langserve/${expoName}")`
    const newLangfuseRoute = newCliImport.replace('#DHTI_LANGFUSE_ROUTE', `#DHTI_LANGFUSE_ROUTE\n    ${langfuseRoute}`)
    const normalRoute = `add_routes(app, ${expoName}_${flags.type}, path="/langserve/${expoName}")`
    const finalRoute = newLangfuseRoute.replace('#DHTI_NORMAL_ROUTE', `#DHTI_NORMAL_ROUTE\n    ${normalRoute}`)
    // if args.op === install, add the line to the pyproject.toml file
    if (args.op === 'install') {
      fs.writeFileSync(`${flags.workdir}/elixir/pyproject.toml`, newPyproject)
      fs.writeFileSync(`${flags.workdir}/elixir/app/server.py`, finalRoute)
    } else {
      // if args.op === uninstall, remove the line from the pyproject.toml file
      fs.writeFileSync(`${flags.workdir}/elixir/pyproject.toml`, pyproject.replace(lineToAdd, ''))
      let newServer=  originalServer.replace(CliImport, '')
      newServer= newServer.replace(langfuseRoute, '')
      newServer= newServer.replace(normalRoute, '')
      fs.writeFileSync(`${flags.workdir}/elixir/app/server.py`, newServer)
    }

  }
}
