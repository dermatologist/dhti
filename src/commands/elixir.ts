import {Args, Command, Flags} from '@oclif/core'
import fs from 'node:fs'
import request from 'request'
import path from 'node:path'
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
    whl: Flags.string({char: 'e', default: "none", description: 'Whl file to install'}),
    name: Flags.string({char: 'n', description: 'Name of the elixir'}),
    repoVersion: Flags.string({char: 'v', default: "0.1.0", description: 'Version of the elixir'}),
    type: Flags.string({char: 't', default: "chain", description: 'Type of elixir (chain, tool or agent)'}),
    workdir: Flags.string({char: 'w', default: "/tmp/elixir", description: 'Working directory to install the elixir'}),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Elixir)

    if(!flags.name){
      console.log("Please provide a name for the elixir")
      this.exit(1)
    }

    // Create a directory to install the elixir
    if (!fs.existsSync(flags.workdir)){
      fs.mkdirSync(flags.workdir);
    }

    fs.cpSync('src/resources/genai', flags.workdir, {recursive: true})

    // if whl is not none, copy the whl file to thee whl directory
    if (flags.whl !== 'none') {
      if (!fs.existsSync(`${flags.workdir}/whl/`)){
        fs.mkdirSync(`${flags.workdir}/whl/`);
      }
      fs.cpSync(flags.whl, `${flags.workdir}/whl/${path.basename(flags.whl)}`)
      console.log("Installing elixir from whl file. Please modify boostrap.py file if needed")
    }
    else {
      // get bootstrap.py file content
      const url = `${flags.git}/blob/${flags.branch}/tests/bootstrap.py`.replace('.git', '')
      request.get(url, (error: any, response: { statusCode: number }, body: any) => {
        if (!error && response.statusCode === 200) {
            const toAdd = body.split('#DHTI_ADD')[1];
            // Continue with your processing here.
            let current_bootstrap = fs.readFileSync(`${flags.workdir}/app/bootstrap.py`, 'utf8')
            if (!current_bootstrap.includes(flags.name || 'ALWAYS_ADD')) {
              fs.writeFileSync(`${flags.workdir}/app/bootstrap.py`, current_bootstrap.replace('#DHTI_ADD', `#DHTI_ADD \n${flags.name}\n#(Edit if needed)\n\n${toAdd}`))
            }
        }else{
            console.log("Error:", error)
            console.log("Status code:", response.statusCode)
            console.log("url:", url)
        }
      });
    }

    const pyproject = fs.readFileSync(`${flags.workdir}/pyproject.toml`, 'utf8')
    const originalServer = fs.readFileSync(`${flags.workdir}/app/server.py`, 'utf8')
    let lineToAdd = `${flags.name} = { git = "${flags.git}", branch = "${flags.branch}" }`
    const repoName = flags.name.replace(/_/g, '-')
    if (flags.git === 'none') {
      lineToAdd = `${repoName} = { file = "whl/${path.basename(flags.whl)}" }`
    }

    const newPyproject = pyproject.replace('[tool.poetry.dependencies]', `[tool.poetry.dependencies]\n${lineToAdd}`)
    const CliImport = `from ${flags.name} import ${flags.type} as ${flags.name}_${flags.type}\n`
    const newCliImport =  fs.readFileSync(`${flags.workdir}/app/server.py`, 'utf8').replace('#DHTI_CLI_IMPORT', `#DHTI_CLI_IMPORT\n${CliImport}`)
    const langfuseRoute = `add_routes(app, ${flags.name}_${flags.type}.with_config(config), path="/${flags.name}")`
    const newLangfuseRoute = newCliImport.replace('#DHTI_LANGFUSE_ROUTE', `#DHTI_LANGFUSE_ROUTE\n    ${langfuseRoute}`)
    const normalRoute = `add_routes(app, ${flags.name}_${flags.type}, path="/${flags.name}")`
    const finalRoute = newLangfuseRoute.replace('#DHTI_NORMAL_ROUTE', `#DHTI_NORMAL_ROUTE\n    ${normalRoute}`)
    // if args.op === install, add the line to the pyproject.toml file
    if (args.op === 'install') {
      fs.writeFileSync(`${flags.workdir}/pyproject.toml`, newPyproject)
      fs.writeFileSync(`${flags.workdir}/app/server.py`, finalRoute)
    } else {
      // if args.op === uninstall, remove the line from the pyproject.toml file
      fs.writeFileSync(`${flags.workdir}/pyproject.toml`, pyproject.replace(lineToAdd, ''))
      let newServer=  originalServer.replace(CliImport, '')
      newServer= newServer.replace(langfuseRoute, '')
      newServer= newServer.replace(normalRoute, '')
      fs.writeFileSync(`${flags.workdir}/app/server.py`, newServer)
    }

  }
}
