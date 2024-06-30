import {Args, Command, Flags} from '@oclif/core'

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
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Elixir)

  }
}
