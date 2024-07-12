import {Args, Command, Flags} from '@oclif/core'
import yaml from 'js-yaml'
import { exec } from 'node:child_process';
import fs from 'node:fs'
import os from 'node:os'
import ora from 'ora'
export default class Docker extends Command {
  static override args = {
    path: Args.string({default: `${os.homedir()}/dhti`, description: 'Docker project path to build. Ex: dhti'}),
  }

  static override description = 'Build a docker project and update docker-compose file'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static override flags = {
    down: Flags.boolean({char: 'd', default: false, description: 'Run docker-compose down after building'}),
    file: Flags.string({char: 'f', default: `${os.homedir()}/dhti/docker-compose.yml`, description: 'Full path to the docker compose file to edit or run.'}),
    name: Flags.string({char: 'n', description: 'Name of the container to build'}),
    type : Flags.string({char: 't', default: 'elixir', description: 'Type of the service (elixir/conch)'}),
    up: Flags.boolean({char: 'u', default: false, description: 'Run docker-compose up after building'}),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Docker)

    if(flags.up){
      exec(`docker compose -f ${flags.file} up -d`, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }

        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
      });
      return
    }

    if(flags.down){
      exec(`docker compose -f ${flags.file} down`, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }

        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
      });
      return
    }

    if(!flags.name){
      console.log("Please provide a name for the container to build")
      this.exit(1)
    }

    // cd to path, docker build tag with name
    const spinner = ora('Running docker build ..').start();
    exec(`cd ${args.path}/${flags.type} && docker build -t ${flags.name} .`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }

      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    });

    // read the docker-compose file
    const dockerCompose: any = yaml.load(fs.readFileSync(flags.file, 'utf8'));
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
