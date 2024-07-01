import {Args, Command, Flags} from '@oclif/core'
import { directory } from '@oclif/core/args'
import { dir } from 'console'
import fs from 'fs'
import request from 'request'
export default class Elixir extends Command {
  static override args = {
    op: Args.string({description: 'Operation to perform (install or uninstall)'}),
  }

  static override description = 'Install or uninstall elixirs and create a Docker image'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static override flags = {
    git: Flags.string({char: 'g', description: 'Github repository to install', default: "none"}),
    branch: Flags.string({char: 'b', description: 'Branch to install from', default: "develop"}),
    name: Flags.string({char: 'n', description: 'Name of the elixir'}),
    repo_version: Flags.string({char: 'v', description: 'Version of the elixir', default: "0.1.0"}),
    type: Flags.string({char: 't', description: 'Type of elixir (chain, tool or agent)', default: "chain"}),
    workdir: Flags.string({char: 'w', description: 'Working directory to install the elixir', default: "/tmp/elixir"}),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Elixir)

    // Create a directory to install the elixir
    if (!fs.existsSync(flags.workdir)){
      fs.mkdirSync(flags.workdir);
    }
    fs.cpSync('src/resources/genai', flags.workdir, {recursive: true})

    // get bootstrap.py file content
    const url = `${flags.git}/blob/${flags.branch}/tests/bootstrap.py`.replace('.git', '')
    request.get(url, function (error: any, response: { statusCode: number }, body: any) {
    if (!error && response.statusCode == 200) {
        var to_add = body.split('#DHTI_ADD')[1];
        // Continue with your processing here.
        fs.readFileSync(`${flags.workdir}/app/bootstrap.py`, 'utf8').replace('#DHTI_ADD', `#DHTI_ADD\nAdded by (Edit if needed) ${flags.name}\n${to_add}`)
    }else{
        console.log("Error: ", error)
        console.log("Status code: ", response.statusCode)
        console.log("url: ", url)
    }
    });

    const pyproject = fs.readFileSync(`${flags.workdir}/pyproject.toml`, 'utf8')
    const original_server = fs.readFileSync(`${flags.workdir}/app/server.py`, 'utf8')
    let line_to_add = `${flags.name} = { git = "${flags.git}", branch = "${flags.branch}" }`
    if (flags.git === 'none') {
      line_to_add = `${flags.name} = "${flags.repo_version}"`
    }
    const new_pyproject = pyproject.replace('[tool.poetry.dependencies]', `[tool.poetry.dependencies]\n${line_to_add}`)
    const cli_import = `from ${flags.name} import ${flags.type} as ${flags.name}_${flags.type}\n`
    const new_cli_import =  fs.readFileSync(`${flags.workdir}/app/server.py`, 'utf8').replace('#DHTI_CLI_IMPORT', `#DHTI_CLI_IMPORT\n${cli_import}`)
    const langfuse_route = `add_routes(app, ${flags.name}_${flags.type}.with_config(config), path="/${flags.name}")`
    const new_langfuse_route = new_cli_import.replace('#DHTI_LANGFUSE_ROUTE', `#DHTI_LANGFUSE_ROUTE\n    ${langfuse_route}`)
    const normal_route = `add_routes(app, ${flags.name}_${flags.type}, path="/${flags.name}")`
    const final_route = new_langfuse_route.replace('#DHTI_NORMAL_ROUTE', `#DHTI_NORMAL_ROUTE\n    ${normal_route}`)
    // if args.op === install, add the line to the pyproject.toml file
    if (args.op === 'install') {
      fs.writeFileSync(`${flags.workdir}/pyproject.toml`, new_pyproject)
      fs.writeFileSync(`${flags.workdir}/app/server.py`, final_route)
    } else {
      // if args.op === uninstall, remove the line from the pyproject.toml file
      fs.writeFileSync(`${flags.workdir}/pyproject.toml`, pyproject.replace(line_to_add, ''))
      let new_server =  original_server.replace(cli_import, '')
      new_server = new_server.replace(langfuse_route, '')
      new_server = new_server.replace(normal_route, '')
      fs.writeFileSync(`${flags.workdir}/app/server.py`, new_server)
    }

  }
}
