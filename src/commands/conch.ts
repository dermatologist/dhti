import {Args, Command, Flags} from '@oclif/core'
import fs from 'node:fs'
import { exec } from 'child_process';
export default class Conch extends Command {
  static override args = {
        op: Args.string({description: 'Operation to perform (dev/none)'}),
  }

  static override description = 'Install or uninstall conchs to create a Docker image'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static override flags = {
    branch: Flags.string({char: 'b', default: "develop", description: 'Branch to install from'}),
    git: Flags.string({char: 'g', default: "none", description: 'Github repository to install'}),
    dev: Flags.string({char: 'e', default: "none", description: 'Dev folder to install'}),
    name: Flags.string({char: 'n', description: 'Name of the elixir'}),
    repoVersion: Flags.string({char: 'v', default: "1.0.0", description: 'Version of the conch'}),
    workdir: Flags.string({char: 'w', default: "/tmp", description: 'Working directory to install the conch'}),
    container: Flags.string({char: 'c', default: "dhti-frontend", description: 'Name of the container to copy the conch to while in dev mode'}),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Conch)

    if(!flags.name){
      console.log("Please provide a name for the conch")
      this.exit(1)
    }

    // if arg is dev then copy to docker as below
    //docker cp ../../openmrs-esm-genai/dist/. dhti-frontend-1:/usr/share/nginx/html/openmrs-esm-genai-1.0.0
    //docker restart dhti-frontend-1
    if(args.op === 'dev'){
      try{
        exec(`docker cp ${flags.dev}/dist/. ${flags.container}:/usr/share/nginx/html/${flags.name}-${flags.repoVersion}`, (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            return;
          }
          console.log(`stdout: ${stdout}`);
          console.error(`stderr: ${stderr}`);
        });
        exec(`docker restart ${flags.container}-1`, (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            return;
          }
          console.log(`stdout: ${stdout}`);
          console.error(`stderr: ${stderr}`);
        });
      }catch (e){
        console.log("Error copying conch to container", e)
      }
    }

    // Create a directory to install the elixir
    if (!fs.existsSync(`${flags.workdir}/conch`)){
      fs.mkdirSync(`${flags.workdir}/conch`);
    }

    fs.cpSync('src/resources/spa', `${flags.workdir}/conch`, {recursive: true})


    if (flags.git !== 'none') {
      // git clone the repository
      exec(`git clone ${flags.git} ${flags.workdir}/conch/${flags.name}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
      });

      // Checkout the branch
      exec(`cd ${flags.workdir}/conch/${flags.name} && git checkout ${flags.branch}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
      });
    }

    // If flags.dev is not none, copy the dev folder to the conch directory
    if (flags.dev !== 'none') {
      fs.cpSync(flags.dev, `${flags.workdir}/conch/${flags.name}`, {recursive: true})
    }

    // Read and process importmap.json
    const importmap = JSON.parse(fs.readFileSync(`${flags.workdir}/conch/def/importmap.json`, 'utf8'));
    importmap.imports[flags.name.replace('openmrs-', '@openmrs/')] = `./${flags.name}-${flags.repoVersion}/${flags.name}.js`;
    fs.writeFileSync(`${flags.workdir}/conch/def/importmap.json`, JSON.stringify(importmap, null, 2));

    // Read and process spa-assemble-config.json
    const spaAssembleConfig = JSON.parse(fs.readFileSync(`${flags.workdir}/conch/def/spa-assemble-config.json`, 'utf8'));
    spaAssembleConfig.frontendModules[flags.name.replace('openmrs-', '@openmrs/')] = `${flags.repoVersion}`;
    fs.writeFileSync(`${flags.workdir}/conch/def/spa-assemble-config.json`, JSON.stringify(spaAssembleConfig, null, 2));

     // Read and process Dockerfile
    let dockerfile = fs.readFileSync(`${flags.workdir}/conch/Dockerfile`, 'utf8');
    dockerfile = dockerfile.replaceAll('conch', flags.name).replaceAll('version', flags.repoVersion);
    fs.writeFileSync(`${flags.workdir}/conch/Dockerfile`, dockerfile);

    // Read routes.json
    const routes = JSON.parse(fs.readFileSync(`${flags.workdir}/conch/${flags.name}/src/routes.json`, 'utf8'));
    // Add to routes.registry.json
    const registry = JSON.parse(fs.readFileSync(`${flags.workdir}/conch/def/routes.registry.json`, 'utf8'));
    registry[flags.name.replace('openmrs-', '@openmrs/')] = routes;
    fs.writeFileSync(`${flags.workdir}/conch/def/routes.registry.json`, JSON.stringify(registry, null, 2));
  }
}
