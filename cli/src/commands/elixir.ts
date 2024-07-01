import {Args, Command, Flags} from '@oclif/core'
import fs from 'fs'
export default class Elixir extends Command {
  static override args = {
    op: Args.string({description: 'Operation to perform (install or uninstall)'}),
  }

  static override description = 'Install or uninstall elixirs and create a Docker image'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static override flags = {
    git: Flags.string({char: 'g', description: 'Github repository to install'}),
    branch: Flags.string({char: 'b', description: 'Branch to install from', default: "develop"}),
    name: Flags.string({char: 'n', description: 'Name of the elixir'}),
    type: Flags.string({char: 't', description: 'Type of elixir (chain, tool or agent)', default: "chain"}),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Elixir)

    const pyproject = fs.readFileSync('src/resources/genai/pyproject.toml', 'utf8')
    const line_to_add = `${flags.name} = { git = "${flags.git}", branch = "${flags.branch}" }`
    const new_pyproject = pyproject.replace('[tool.poetry.dependencies]', `[tool.poetry.dependencies]\n${line_to_add}`)
    const cli_import = `from ${flags.name} import ${flags.type} as ${flags.name}_${flags.type}\n`
    const new_cli_import =  fs.readFileSync('src/resources/genai/app/server.py', 'utf8').replace('#DHTI_CLI_IMPORT', `#DHTI_CLI_IMPORT\n${cli_import}`)
    const langfuse_route = `add_routes(app, ${flags.name}_${flags.type}.with_config(config), path="/${flags.name}")`
    const new_langfuse_route = fs.readFileSync('src/resources/genai/app/server.py', 'utf8').replace('#DHTI_LANGFUSE_ROUTE', `#DHTI_LANGFUSE_ROUTE\n\t${langfuse_route}`)
    const normal_route = `add_routes(app, ${flags.name}_${flags.type}, path="/${flags.name}")`
    const new_normal_route = fs.readFileSync('src/resources/genai/app/server.py', 'utf8').replace('#DHTI_NORMAL_ROUTE', `#DHTI_NORMAL_ROUTE\n\t${normal_route}`)
    // if args.op === install, add the line to the pyproject.toml file
    if (args.op === 'install') {
      fs.writeFileSync('src/resources/genai/pyproject.toml', new_pyproject)
      fs.writeFileSync('src/resources/genai/app/server.py', new_cli_import)
      fs.writeFileSync('src/resources/genai/app/server.py', new_langfuse_route)
      fs.writeFileSync('src/resources/genai/app/server.py', new_normal_route)
    } else {
      // if args.op === uninstall, remove the line from the pyproject.toml file
      fs.writeFileSync('src/resources/genai/pyproject.toml', pyproject.replace(line_to_add, ''))
      fs.writeFileSync('src/resources/genai/app/server.py', new_cli_import.replace(cli_import, ''))
      fs.writeFileSync('src/resources/genai/app/server.py', new_langfuse_route.replace(langfuse_route, ''))
      fs.writeFileSync('src/resources/genai/app/server.py', new_normal_route.replace(normal_route, ''))
    }

  }
}
