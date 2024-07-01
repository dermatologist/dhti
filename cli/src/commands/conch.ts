import {Args, Command, Flags} from '@oclif/core'
import fs from 'fs'
import request from 'request'
import { exec } from 'child_process';
export default class Conch extends Command {
  static override args = {
        op: Args.string({description: 'Operation to perform (install or uninstall)'}),
  }

  static override description = 'Install or uninstall conchs to create a Docker image'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static override flags = {
    git: Flags.string({char: 'g', description: 'Github repository to install', default: "none"}),
    branch: Flags.string({char: 'b', description: 'Branch to install from', default: "develop"}),
    name: Flags.string({char: 'n', description: 'Name of the elixir'}),
    repo_version: Flags.string({char: 'v', description: 'Version of the conch', default: "0.1.0"}),
    workdir: Flags.string({char: 'w', description: 'Working directory to install the conch', default: "/tmp/conch"}),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Conch)

    if(!flags.name){
      console.log("Please provide a name for the conch")
      this.exit(1)
    }

    // Create a directory to install the elixir
    if (!fs.existsSync(flags.workdir)){
      fs.mkdirSync(flags.workdir);
    }
    fs.cpSync('src/resources/spa', flags.workdir, {recursive: true})

    // git clone the repository
    exec(`git clone ${flags.git} ${flags.workdir}/${flags.name}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    });

  }
}
