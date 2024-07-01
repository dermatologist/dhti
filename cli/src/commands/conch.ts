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
    repo_version: Flags.string({char: 'v', description: 'Version of the conch', default: "1.0.0"}),
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

    // // git clone the repository
    // exec(`git clone ${flags.git} ${flags.workdir}/${flags.name}`, (error, stdout, stderr) => {
    //   if (error) {
    //     console.error(`exec error: ${error}`);
    //     return;
    //   }
    //   console.log(`stdout: ${stdout}`);
    //   console.error(`stderr: ${stderr}`);
    // });

    // // Checkout the branch
    // exec(`cd ${flags.workdir}/${flags.name} && git checkout ${flags.branch}`, (error, stdout, stderr) => {
    //   if (error) {
    //     console.error(`exec error: ${error}`);
    //     return;
    //   }
    //   console.log(`stdout: ${stdout}`);
    //   console.error(`stderr: ${stderr}`);
    // });

    // Read and process importmap.json
    let importmap = JSON.parse(fs.readFileSync(`${flags.workdir}/def/importmap.json`, 'utf8'));
    importmap.imports[flags.name.replace('openmrs-', '@openmrs/')] = `./${flags.name}-${flags.repo_version}/${flags.name}.js`;
    fs.writeFileSync(`${flags.workdir}/def/importmap.json`, JSON.stringify(importmap, null, 2));

    // Read and process spa-assemble-config.json
    let spa_assemble_config = JSON.parse(fs.readFileSync(`${flags.workdir}/def/spa-assemble-config.json`, 'utf8'));
    spa_assemble_config.frontendModules[flags.name.replace('openmrs-', '@openmrs/')] = `${flags.repo_version}`;
    fs.writeFileSync(`${flags.workdir}/def/spa-assemble-config.json`, JSON.stringify(spa_assemble_config, null, 2));

     // Read and process Dockerfile
    let dockerfile = fs.readFileSync(`${flags.workdir}/Dockerfile`, 'utf8');
    dockerfile = dockerfile.replaceAll('conch', flags.name).replaceAll('version', flags.repo_version);
    fs.writeFileSync(`${flags.workdir}/Dockerfile`, dockerfile);

    // Read routes.json
    let routes = JSON.parse(fs.readFileSync(`${flags.workdir}/${flags.name}/src/routes.json`, 'utf8'));
    // Add to routes.registry.json
    let registry = JSON.parse(fs.readFileSync(`${flags.workdir}/def/routes.registry.json`, 'utf8'));
    registry[flags.name.replace('openmrs-', '@openmrs/')] = routes;
    fs.writeFileSync(`${flags.workdir}/def/routes.registry.json`, JSON.stringify(registry, null, 2));
  }
}
