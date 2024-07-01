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
    // if args.op === install, add the line to the pyproject.toml file
    if (args.op === 'install') {
      fs.writeFileSync('src/resources/genai/pyproject.toml', new_pyproject)
      fs.readFileSync('src/resources/genai/app/server.py', 'utf8').replace('#DHTI_CLI_IMPORT', `#DHTI_CLI_IMPORT\n${cli_import}`)
    } else {
      // if args.op === uninstall, remove the line from the pyproject.toml file
      fs.writeFileSync('src/resources/genai/pyproject.toml', pyproject.replace(line_to_add, ''))
      fs.readFileSync('src/resources/genai/app/server.py', 'utf8').replace(cli_import, '')
    }

  }
}
