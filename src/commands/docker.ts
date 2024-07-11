import {Args, Command, Flags} from '@oclif/core'
import { exec } from 'child_process';
import fs from 'node:fs'
import yaml from 'js-yaml'

export default class Docker extends Command {
  static override args = {
    path: Args.string({description: 'Docker project path to build. Ex: dhti'}),
  }

  static override description = 'Build a docker project and update docker-compose file'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static override flags = {
    file: Flags.string({char: 'f', default: '~/dhti/docker-compose.yml', description: 'Full path to the docker compose file to edit.'}),
    name: Flags.string({char: 'n', description: 'Name of the container to build'}),
    type : Flags.string({char: 't', description: 'Type of the service (elixir/conch)', default: 'elixir'}),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Docker)

    if(!flags.name){
      console.log("Please provide a name for the conch")
      this.exit(1)
    }

    // cd to path, docker build tag with name
    exec(`cd ${args.path}/${flags.type} && docker build -t ${flags.name} .`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    });

    // read the docker-compose file
    let dockerCompose: any = yaml.load(fs.readFileSync(flags.file, 'utf8'));
    // if type is elixir set image of backend to name, else set image of frontend to name
    if(flags.type === 'elixir'){
      dockerCompose.services.langserve.image = flags.name
      dockerCompose.services.langserve.pull_policy = "if_not_present"
    }else{
      dockerCompose.services.frontend.image = flags.name
      dockerCompose.services.frontend.pull_policy = "if_not_present"
    }
    // write the docker-compose file
    fs.writeFileSync(flags.file, yaml.dump(dockerCompose));
  }
}
