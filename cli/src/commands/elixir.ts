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
    branch: Flags.string({char: 'b', description: 'Branch to install from'}),
    name: Flags.string({char: 'n', description: 'Name of the elixir'}),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Elixir)

    const pyproject = fs.readFileSync('src/resources/genai/pyproject.toml', 'utf8')
    const line_to_add = `${flags.name} = { git = "${flags.git}", branch = "${flags.branch}" }`
    const new_pyproject = pyproject.replace('[tool.poetry.dependencies]', `[tool.poetry.dependencies]\n${line_to_add}`)
    // if args.op === install, add the line to the pyproject.toml file
    if (args.op === 'install') {
      fs.writeFileSync('src/resources/genai/pyproject.toml', new_pyproject)
    } else {
      // if args.op === uninstall, remove the line from the pyproject.toml file
      fs.writeFileSync('src/resources/genai/pyproject.toml', pyproject.replace(line_to_add, ''))
    }

  }
}
