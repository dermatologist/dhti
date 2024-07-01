import {Args, Command, Flags} from '@oclif/core'
import fs from 'node:fs'
export default class Conch extends Command {
  static override args = {
        op: Args.string({description: 'Operation to perform (install or uninstall)'}),
  }

  static override description = 'Install or uninstall conchs to create a Docker image'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static override flags = {
    branch: Flags.string({char: 'b', default: "develop", description: 'Branch to install from'}),
    git: Flags.string({char: 'g', default: "none", description: 'Github repository to install'}),
    name: Flags.string({char: 'n', description: 'Name of the elixir'}),
    repoVersion: Flags.string({char: 'v', default: "1.0.0", description: 'Version of the conch'}),
    workdir: Flags.string({char: 'w', default: "/tmp/conch", description: 'Working directory to install the conch'}),
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
    const importmap = JSON.parse(fs.readFileSync(`${flags.workdir}/def/importmap.json`, 'utf8'));
    importmap.imports[flags.name.replace('openmrs-', '@openmrs/')] = `./${flags.name}-${flags.repoVersion}/${flags.name}.js`;
    fs.writeFileSync(`${flags.workdir}/def/importmap.json`, JSON.stringify(importmap, null, 2));

    // Read and process spa-assemble-config.json
    const spaAssembleConfig = JSON.parse(fs.readFileSync(`${flags.workdir}/def/spa-assemble-config.json`, 'utf8'));
    spaAssembleConfig.frontendModules[flags.name.replace('openmrs-', '@openmrs/')] = `${flags.repoVersion}`;
    fs.writeFileSync(`${flags.workdir}/def/spa-assemble-config.json`, JSON.stringify(spaAssembleConfig, null, 2));

     // Read and process Dockerfile
    let dockerfile = fs.readFileSync(`${flags.workdir}/Dockerfile`, 'utf8');
    dockerfile = dockerfile.replaceAll('conch', flags.name).replaceAll('version', flags.repoVersion);
    fs.writeFileSync(`${flags.workdir}/Dockerfile`, dockerfile);

    // Read routes.json
    const routes = JSON.parse(fs.readFileSync(`${flags.workdir}/${flags.name}/src/routes.json`, 'utf8'));
    // Add to routes.registry.json
    const registry = JSON.parse(fs.readFileSync(`${flags.workdir}/def/routes.registry.json`, 'utf8'));
    registry[flags.name.replace('openmrs-', '@openmrs/')] = routes;
    fs.writeFileSync(`${flags.workdir}/def/routes.registry.json`, JSON.stringify(registry, null, 2));
  }
}
